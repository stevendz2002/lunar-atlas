import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-moon-soundtrack',
  standalone: true,
  templateUrl: './moon-soundtrack.component.html',
  styleUrl: './moon-soundtrack.component.css',
  host: { '(document:click)': 'startOnFirstInteraction()' }
})
export class MoonSoundtrackComponent {
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');
  private autoStartPending = true;
  readonly audioSrc = 'assets/somnias-a-luna.mp3';
  readonly playing = signal(false);
  readonly muted = signal(false);
  readonly audioUnavailable = signal(false);

  playbackStarted(): void {
    this.autoStartPending = false;
    this.playing.set(true);
  }

  startOnFirstInteraction(): void {
    if (!this.autoStartPending) return;

    const audio = this.audio()?.nativeElement;
    if (!audio?.paused) return;

    this.autoStartPending = false;
    // The explicit music button stays available if the browser blocks this attempt.
    void audio.play().catch(() => undefined);
  }

  async toggleSound(): Promise<void> {
    this.autoStartPending = false;
    const audio = this.audio()?.nativeElement;
    if (!audio) return;

    if (!audio.paused) {
      audio.muted = !audio.muted;
      this.muted.set(audio.muted);
      return;
    }

    audio.muted = false;
    this.muted.set(false);
    try {
      await audio.play();
    } catch {
      this.audioUnavailable.set(true);
    }
  }
}
