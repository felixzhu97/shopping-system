import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'video[appVideoSrc]',
  standalone: true
})
export class VideoSrcDirective implements OnChanges {
  @Input() appVideoSrc: MediaStream | null = null;

  constructor(private readonly elementRef: ElementRef<HTMLVideoElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appVideoSrc']) {
      const video = this.elementRef.nativeElement as HTMLVideoElement & {
        srcObject?: MediaStream | null;
      };
      video.srcObject = this.appVideoSrc ?? null;
    }
  }
}

