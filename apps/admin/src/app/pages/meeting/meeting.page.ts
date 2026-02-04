import { CommonModule } from '@angular/common';
import { Component, ElementRef, Signal, ViewChild, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MeetingService } from '../../core/meeting/meeting.service';
import { VideoSrcDirective } from '../../core/meeting/video-src.directive';

type UiMessage = {
  fromSelf: boolean;
  name: string;
  message: string;
  timestamp: number;
};

@Component({
  selector: 'app-meeting-page',
  standalone: true,
  imports: [CommonModule, FormsModule, VideoSrcDirective],
  templateUrl: './meeting.page.html',
  styleUrl: './meeting.page.scss'
})
export class MeetingPage {
  @ViewChild('chatMessagesContainer') private readonly chatMessagesRef?: ElementRef<HTMLDivElement>;
  protected readonly serverUrl = signal<string>('http://localhost:4100');
  protected readonly roomId = signal<string>('demo-room');
  protected readonly displayName = signal<string>('Admin');
  protected readonly text = signal<string>('');
  protected readonly uiMessages: Signal<UiMessage[]>;

  constructor(private readonly meeting: MeetingService) {
    this.uiMessages = computed(() => {
      const raw = this.meeting.messages();
      return raw.map(m => ({
        fromSelf: false,
        name: m.name,
        message: m.message,
        timestamp: m.timestamp
      }));
    });

    effect(() => {
      const _ = this.uiMessages();
      queueMicrotask(() => {
        const el = this.chatMessagesRef?.nativeElement;
        if (!el) {
          return;
        }
        el.scrollTop = el.scrollHeight;
      });
    });
  }

  protected getInitials(name: string | undefined): string {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      return '?';
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
  }

  protected get joined() {
    return this.meeting.joined;
  }

  protected get busy() {
    return this.meeting.busy;
  }

  protected get error() {
    return this.meeting.error;
  }

  protected get localStream() {
    return this.meeting.localStream;
  }

  protected get participants() {
    return this.meeting.participants;
  }

  protected async join(): Promise<void> {
    if (this.joined()) {
      return;
    }
    await this.meeting.connect({
      serverUrl: this.serverUrl().trim(),
      roomId: this.roomId().trim(),
      displayName: this.displayName().trim()
    });
  }

  protected leave(): void {
    this.meeting.leave();
  }

  protected setServerUrl(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    this.serverUrl.set(target.value);
  }

  protected setRoomId(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    this.roomId.set(target.value);
  }

  protected setDisplayName(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    this.displayName.set(target.value);
  }

  protected setText(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    this.text.set(target.value);
  }

  protected send(): void {
    const value = this.text().trim();
    if (!value) {
      return;
    }
    this.meeting.sendMessage(value);
    this.text.set('');
  }
}

