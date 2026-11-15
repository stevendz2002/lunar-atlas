import { Component, ElementRef, signal, viewChild } from '@angular/core';

// Set this to a direct audio source authorized for use on the site.
const soundtrackSource: string | null = null;

@Component({
  selector: 'app-moon-soundtrack',
  standalone: true,
  templateUrl: './moon-soundtrack.component.html',
  styleUrl: './moon-soundtrack.component.css'
})
export class MoonSoundtrackComponent {
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');
  readonly audioSrc = soundtrackSource;
  readonly playing = signal(false);
  readonly muted = signal(false);
  readonly audioUnavailable = signal(false);

  async toggleSound(): Promise<void> {
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
