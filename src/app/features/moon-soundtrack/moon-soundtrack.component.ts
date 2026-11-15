import { Component, signal } from '@angular/core';

// Add a direct audio URL or an asset path only when its use on this site is authorized.
const soundtrackSource: string | null = null;

@Component({
  selector: 'app-moon-soundtrack',
  standalone: true,
  templateUrl: './moon-soundtrack.component.html',
  styleUrl: './moon-soundtrack.component.css'
})
export class MoonSoundtrackComponent {
  readonly audioSrc = soundtrackSource;
  readonly audioUnavailable = signal(false);
}
