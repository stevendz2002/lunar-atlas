import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FEATURED_MOONS, PLANETS } from '../../core/data/moons.seed';
import type { Moon, PlanetName } from '../../core/models/moon.model';
import { MoonApiService } from '../../core/services/moon-api.service';

type Filter = PlanetName | 'Todas';
type Order = 'destacadas' | 'radio' | 'nombre';

@Component({
  selector: 'app-moon-gallery',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './moon-gallery.component.html',
  styleUrl: './moon-gallery.component.css'
})
export class MoonGalleryComponent implements OnInit {
  readonly api = inject(MoonApiService);
  readonly planets: readonly Filter[] = ['Todas', ...PLANETS];
  readonly activePlanet = signal<Filter>('Todas');
  readonly search = signal('');
  readonly order = signal<Order>('destacadas');
  readonly selected = signal<Moon>(FEATURED_MOONS[1]!);
  readonly pageSize = signal(12);
  readonly filtered = computed(() => {
    const planet = this.activePlanet();
    const phrase = this.search().trim().toLocaleLowerCase('es');
    const result = this.api.moons().filter(moon =>
      (planet === 'Todas' || moon.planet === planet) &&
      (!phrase || `${moon.name} ${moon.planet}`.toLocaleLowerCase('es').includes(phrase))
    );
    switch (this.order()) {
      case 'radio': return [...result].sort((a, b) => (b.radiusKm ?? 0) - (a.radiusKm ?? 0));
      case 'nombre': return [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
      default: return result;
    }
  });
  readonly displayed = computed(() => this.filtered().slice(0, this.pageSize()));
  readonly formattedRadius = computed(() => this.selected().radiusKm === null ? '—' :
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(this.selected().radiusKm!));
  readonly formattedPeriod = computed(() => this.selected().orbitalDays === null ? '—' :
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(this.selected().orbitalDays!));

  ngOnInit(): void { void this.api.refresh(); }

  setPlanet(planet: Filter): void { this.activePlanet.set(planet); this.pageSize.set(12); }
  setSort(value: string): void {
    if (value === 'nombre' || value === 'radio' || value === 'destacadas') this.order.set(value);
  }
  select(moon: Moon): void { this.selected.set(moon); }
  more(): void { this.pageSize.update(n => n + 12); }
  next(): void {
    const featured = this.api.moons().filter(m => m.featured);
    const current = featured.findIndex(m => m.id === this.selected().id);
    if (featured.length) this.selected.set(featured[(current + 1 + featured.length) % featured.length]!);
  }
  previous(): void {
    const featured = this.api.moons().filter(m => m.featured);
    const current = featured.findIndex(m => m.id === this.selected().id);
    if (featured.length) this.selected.set(featured[(current - 1 + featured.length) % featured.length]!);
  }
}
