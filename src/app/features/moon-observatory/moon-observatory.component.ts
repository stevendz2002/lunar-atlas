import { Component, computed, signal } from '@angular/core';

interface Phase { readonly name: string; readonly label: string; readonly description: string }
const PHASES: readonly Phase[] = [
  { name: 'Luna nueva', label: '00', description: 'La cara iluminada apunta principalmente en dirección contraria al observador terrestre.' },
  { name: 'Creciente inicial', label: '01', description: 'Comienza a asomar una fina franja iluminada después de la Luna nueva.' },
  { name: 'Cuarto creciente', label: '02', description: 'Aproximadamente la mitad del disco lunar visible está iluminado.' },
  { name: 'Gibosa creciente', label: '03', description: 'La fracción iluminada aumenta y se acerca a la Luna llena.' },
  { name: 'Luna llena', label: '04', description: 'Desde la Tierra observamos casi todo el hemisferio lunar visible iluminado.' },
  { name: 'Gibosa menguante', label: '05', description: 'Después de la Luna llena, la fracción iluminada comienza a disminuir.' },
  { name: 'Cuarto menguante', label: '06', description: 'Aproximadamente la mitad del disco visible vuelve a estar iluminado.' },
  { name: 'Menguante final', label: '07', description: 'Solo queda una franja iluminada antes de un nuevo ciclo.' }
];

@Component({
  selector: 'app-moon-observatory',
  standalone: true,
  templateUrl: './moon-observatory.component.html',
  styleUrl: './moon-observatory.component.css'
})
export class MoonObservatoryComponent {
  readonly phases = PHASES;
  readonly index = signal(4);
  readonly current = computed(() => this.phases[this.index()]!);
  setPhase(index: number): void {
    if (Number.isInteger(index) && index >= 0 && index < this.phases.length) this.index.set(index);
  }
}
