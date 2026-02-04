import { Injectable, signal } from '@angular/core';
import { io, type Socket } from 'socket.io-client';

type RemoteParticipant = {
  userId: string;
  name: string;
  stream: MediaStream | null;
};

type ChatMessage = {
  userId: string;
  name: string;
  message: string;
  timestamp: number;
};

type ConnectOptions = {
  serverUrl: string;
  roomId: string;
  displayName: string;
};

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private socket: Socket | null = null;
  private localStreamInternal: MediaStream | null = null;
  private roomIdInternal = '';
  private displayNameInternal = '';
  private peerConnections = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, MediaStream>();

  private readonly iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  readonly localStream = signal<MediaStream | null>(null);
  readonly participants = signal<RemoteParticipant[]>([]);
  readonly messages = signal<ChatMessage[]>([]);
  readonly joined = signal<boolean>(false);
  readonly busy = signal<boolean>(false);
  readonly error = signal<string>('');

  async connect(options: ConnectOptions): Promise<void> {
    if (this.joined()) {
      return;
    }
    this.error.set('');
    this.busy.set(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.localStreamInternal = stream;
      this.localStream.set(stream);

      this.roomIdInternal = options.roomId.trim();
      this.displayNameInternal = options.displayName.trim() || 'Guest';

      this.socket = io(options.serverUrl, {
        transports: ['websocket']
      });

      this.registerSocketHandlers();

      this.socket.emit('join-room', {
        roomId: this.roomIdInternal,
        name: this.displayNameInternal
      });

      this.joined.set(true);
    } catch (e) {
      this.error.set(this.extractErrorMessage(e) || 'Failed to start media or connect');
      this.cleanup();
    } finally {
      this.busy.set(false);
    }
  }

  leave(): void {
    this.socket?.disconnect();
    this.cleanup();
  }

  sendMessage(text: string): void {
    if (!this.socket || !this.joined() || !this.roomIdInternal) {
      return;
    }
    const message = text.trim();
    if (!message) {
      return;
    }
    this.socket.emit('chat-message', {
      roomId: this.roomIdInternal,
      name: this.displayNameInternal || 'Guest',
      message
    });
  }

  private registerSocketHandlers(): void {
    if (!this.socket) {
      return;
    }
    this.socket.on('room-users', (users: { userId: string; name: string }[]) => {
      if (!Array.isArray(users)) {
        return;
      }
      const current = this.participants();
      const next: RemoteParticipant[] = [...current];
      for (const u of users) {
        if (!u || !u.userId) {
          continue;
        }
        const exists = next.some(p => p.userId === u.userId);
        if (!exists) {
          next.push({
            userId: u.userId,
            name: u.name || 'Guest',
            stream: this.remoteStreams.get(u.userId) ?? null
          });
        }
        void this.createAndSendOffer(u.userId);
      }
      this.participants.set(next);
    });

    this.socket.on('user-joined', (payload: { userId: string; name?: string }) => {
      if (!payload || !payload.userId) {
        return;
      }
      const userId = String(payload.userId);
      const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : 'Guest';
      const current = this.participants();
      const exists = current.some(p => p.userId === userId);
      if (!exists) {
        this.participants.set([
          ...current,
          {
            userId,
            name,
            stream: this.remoteStreams.get(userId) ?? null
          }
        ]);
      }
    });

    this.socket.on('user-left', (payload: { userId: string }) => {
      if (!payload || !payload.userId) {
        return;
      }
      const userId = String(payload.userId);
      this.closePeerConnection(userId);
      this.remoteStreams.delete(userId);
      this.participants.set(this.participants().filter(p => p.userId !== userId));
    });

    this.socket.on(
      'signal-offer',
      async (payload: { fromUserId: string; sdp: RTCSessionDescriptionInit }) => {
      if (!payload || !payload.fromUserId || !payload.sdp) {
        return;
      }
      const fromUserId = String(payload.fromUserId);
      const pc = this.getOrCreatePeerConnection(fromUserId);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket?.emit('signal-answer', {
          targetUserId: fromUserId,
          sdp: answer
        });
      } catch (e) {
        this.error.set(this.extractErrorMessage(e) || 'Failed to handle offer');
      }
    }
    );

    this.socket.on(
      'signal-answer',
      async (payload: { fromUserId: string; sdp: RTCSessionDescriptionInit }) => {
      if (!payload || !payload.fromUserId || !payload.sdp) {
        return;
      }
      const fromUserId = String(payload.fromUserId);
      const pc = this.peerConnections.get(fromUserId);
      if (!pc) {
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch (e) {
        this.error.set(this.extractErrorMessage(e) || 'Failed to handle answer');
      }
    }
    );

    this.socket.on(
      'signal-ice-candidate',
      async (payload: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      if (!payload || !payload.fromUserId || !payload.candidate) {
        return;
      }
      const fromUserId = String(payload.fromUserId);
      const pc = this.peerConnections.get(fromUserId);
      if (!pc) {
        return;
      }
      try {
        await pc.addIceCandidate(payload.candidate);
      } catch (e) {
        this.error.set(this.extractErrorMessage(e) || 'Failed to handle candidate');
      }
    }
    );

    this.socket.on('chat-message', (payload: ChatMessage) => {
      if (!payload || typeof payload.message !== 'string') {
        return;
      }
      const list = this.messages();
      this.messages.set([...list, payload]);
    });

    this.socket.on('connect_error', (err: unknown) => {
      this.error.set(this.extractErrorMessage(err) || 'Signal server connection error');
    });
  }

  private async createAndSendOffer(targetUserId: string): Promise<void> {
    const pc = this.getOrCreatePeerConnection(targetUserId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket?.emit('signal-offer', {
        targetUserId,
        sdp: offer
      });
    } catch (e) {
      this.error.set(this.extractErrorMessage(e) || 'Failed to create offer');
    }
  }

  private getOrCreatePeerConnection(userId: string): RTCPeerConnection {
    const existing = this.peerConnections.get(userId);
    if (existing) {
      return existing;
    }
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers
    });
    if (this.localStreamInternal) {
      for (const track of this.localStreamInternal.getTracks()) {
        pc.addTrack(track, this.localStreamInternal);
      }
    }
    pc.onicecandidate = event => {
      if (event.candidate && this.socket) {
        this.socket.emit('signal-ice-candidate', {
          targetUserId: userId,
          candidate: event.candidate
        });
      }
    };
    pc.ontrack = event => {
      const stream = event.streams[0];
      if (!stream) {
        return;
      }
      this.remoteStreams.set(userId, stream);
      const current = this.participants();
      const index = current.findIndex(p => p.userId === userId);
      if (index === -1) {
        this.participants.set([
          ...current,
          {
            userId,
            name: 'Guest',
            stream
          }
        ]);
      } else {
        const updated = [...current];
        updated[index] = {
          ...updated[index],
          stream
        };
        this.participants.set(updated);
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.closePeerConnection(userId);
      }
    };
    this.peerConnections.set(userId, pc);
    return pc;
  }

  private closePeerConnection(userId: string): void {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.close();
      this.peerConnections.delete(userId);
    }
  }

  private cleanup(): void {
    for (const pc of this.peerConnections.values()) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.close();
    }
    this.peerConnections.clear();
    if (this.localStreamInternal) {
      for (const track of this.localStreamInternal.getTracks()) {
        track.stop();
      }
    }
    this.localStreamInternal = null;
    this.localStream.set(null);
    this.remoteStreams.clear();
    this.participants.set([]);
    this.messages.set([]);
    this.joined.set(false);
    this.roomIdInternal = '';
  }

  private extractErrorMessage(e: unknown): string {
    if (!e) {
      return '';
    }
    if (typeof e === 'string') {
      return e;
    }
    const anyError = e as { message?: unknown };
    if (typeof anyError.message === 'string') {
      return anyError.message;
    }
    return '';
  }
}

