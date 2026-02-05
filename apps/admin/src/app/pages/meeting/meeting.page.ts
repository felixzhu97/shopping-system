import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, Signal, ViewChild, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MeetingService } from '../../core/meeting/meeting.service';
import { VideoSrcDirective } from '../../core/meeting/video-src.directive';

type UiMessage = { name: string; message: string; timestamp: number };

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

@Component({
  selector: 'app-meeting-page',
  standalone: true,
  imports: [CommonModule, FormsModule, VideoSrcDirective],
  templateUrl: './meeting.page.html',
  styleUrl: './meeting.page.scss'
})
export class MeetingPage implements OnDestroy {
  @ViewChild('chatMessagesContainer') private readonly chatMessagesRef?: ElementRef<HTMLDivElement>;
  protected readonly serverUrl = signal<string>('http://localhost:4100');
  protected readonly roomId = signal<string>('demo-room');
  protected readonly displayName = signal<string>('Admin');
  protected readonly text = signal<string>('');
  protected readonly uiMessages: Signal<UiMessage[]>;
  protected readonly isSpeaking = signal<boolean>(false);
  protected readonly isListening = signal<boolean>(false);
  protected readonly listenForInput = signal<boolean>(false);
  protected readonly subtitleText = signal<string>('');
  protected readonly subtitleOn = signal<boolean>(false);
  protected readonly ttsSupported = signal<boolean>(false);
  protected readonly sttSupported = signal<boolean>(false);

  private static readonly SUBTITLE_HIDE_DELAY_MS = 4000;
  private static readonly SUBTITLE_MAX_LENGTH = 100;

  private recognition: SpeechRecognition | null = null;
  private synthesisUtterance: SpeechSynthesisUtterance | null = null;
  private subtitleFinalAccumulated = '';
  private subtitleHideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly meeting: MeetingService,
    private readonly ngZone: NgZone
  ) {
    if (typeof window !== 'undefined') {
      this.ttsSupported.set(!!window.speechSynthesis);
      const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      this.sttSupported.set(!!Recognition);
    }
    this.uiMessages = computed(() =>
      this.meeting.messages().map(m => ({ name: m.name, message: m.message, timestamp: m.timestamp }))
    );

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

  protected toggleSubtitle(): void {
    if (!this.sttSupported()) return;
    const next = !this.subtitleOn();
    this.subtitleOn.set(next);
    this.clearSubtitleState();
    if (next && !this.isListening()) this.startListening();
    else if (!next && !this.listenForInput()) this.stopListening();
  }

  private clearSubtitleState(): void {
    this.subtitleText.set('');
    this.subtitleFinalAccumulated = '';
    if (this.subtitleHideTimer !== null) {
      clearTimeout(this.subtitleHideTimer);
      this.subtitleHideTimer = null;
    }
  }

  private scheduleSubtitleHide(): void {
    if (this.subtitleHideTimer !== null) {
      clearTimeout(this.subtitleHideTimer);
      this.subtitleHideTimer = null;
    }
    this.subtitleHideTimer = setTimeout(() => {
      this.subtitleHideTimer = null;
      this.subtitleText.set('');
      this.subtitleFinalAccumulated = '';
    }, MeetingPage.SUBTITLE_HIDE_DELAY_MS);
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

  protected setServerUrl(e: Event): void {
    const v = (e.target as HTMLInputElement | null)?.value;
    if (v !== undefined) this.serverUrl.set(v);
  }

  protected setRoomId(e: Event): void {
    const v = (e.target as HTMLInputElement | null)?.value;
    if (v !== undefined) this.roomId.set(v);
  }

  protected setDisplayName(e: Event): void {
    const v = (e.target as HTMLInputElement | null)?.value;
    if (v !== undefined) this.displayName.set(v);
  }

  protected setText(e: Event): void {
    const v = (e.target as HTMLInputElement | null)?.value;
    if (v !== undefined) this.text.set(v);
  }

  protected send(): void {
    const value = this.text().trim();
    if (!value) {
      return;
    }
    this.meeting.sendMessage(value);
    this.text.set('');
  }

  protected speakCurrentInput(): void {
    const value = this.text().trim();
    if (!value || !this.ttsSupported()) {
      return;
    }
    this.speak(value);
  }

  protected speakMessage(m: UiMessage): void {
    if (!m.message?.trim() || !this.ttsSupported()) {
      return;
    }
    const toSpeak = `${m.name} says: ${m.message}`;
    this.speak(toSpeak);
  }

  private speak(utteranceText: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    window.speechSynthesis.cancel();
    this.synthesisUtterance = new SpeechSynthesisUtterance(utteranceText);
    this.synthesisUtterance.onstart = () => this.isSpeaking.set(true);
    this.synthesisUtterance.onend = () => this.isSpeaking.set(false);
    this.synthesisUtterance.onerror = () => this.isSpeaking.set(false);
    window.speechSynthesis.speak(this.synthesisUtterance);
  }

  protected stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
    }
  }

  protected toggleListen(): void {
    if (!this.sttSupported()) return;
    const next = !this.listenForInput();
    this.listenForInput.set(next);
    if (next && !this.isListening()) this.startListening();
    else if (!next && !this.subtitleOn()) this.stopListening();
  }

  private startListening(): void {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }
    this.recognition = new Recognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      let newAccumulated = final
        ? (this.subtitleFinalAccumulated + ' ' + final).trim()
        : this.subtitleFinalAccumulated;
      let display = (newAccumulated + (interim ? ' ' + interim : '')).trim();
      if (display.length > MeetingPage.SUBTITLE_MAX_LENGTH) {
        const newPart = (final + (interim ? ' ' + interim : '')).trim();
        newAccumulated = newPart;
        display = newPart;
      }
      const acc = newAccumulated;
      const txt = display;
      this.ngZone.run(() => {
        if (final) {
          this.subtitleFinalAccumulated = acc;
          if (this.listenForInput()) {
            const current = this.text().trim();
            this.text.set(current ? `${current} ${final}` : final);
          }
        }
        if (this.subtitleOn()) {
          this.subtitleText.set(txt);
          this.scheduleSubtitleHide();
        }
      });
    };
    this.recognition.onend = () => this.ngZone.run(() => this.isListening.set(false));
    this.recognition.onerror = () => this.ngZone.run(() => this.isListening.set(false));
    this.clearSubtitleState();
    this.recognition.start();
    this.isListening.set(true);
  }

  private stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.isListening.set(false);
    this.clearSubtitleState();
  }

  ngOnDestroy(): void {
    this.clearSubtitleState();
    this.stopSpeaking();
    this.stopListening();
  }
}

