import { Component, inject } from '@angular/core';
import { HeroEclipseComponent } from './features/hero-eclipse/hero-eclipse.component';
import { MoonGalleryComponent } from './features/moon-gallery/moon-gallery.component';
import { MoonObservatoryComponent } from './features/moon-observatory/moon-observatory.component';
import { MoonSoundtrackComponent } from './features/moon-soundtrack/moon-soundtrack.component';
import { PerformanceMonitorService } from './core/services/performance-monitor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroEclipseComponent, MoonGalleryComponent, MoonObservatoryComponent, MoonSoundtrackComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly monitor = inject(PerformanceMonitorService);
  readonly year = new Date().getFullYear();
}
