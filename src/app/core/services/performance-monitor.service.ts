import { Injectable, signal } from '@angular/core';
import type { EngineStatus } from '../models/moon.model';

@Injectable({ providedIn: 'root' })
export class PerformanceMonitorService {
  readonly fps = signal(0);
  readonly status = signal<EngineStatus>('starting');
  readonly pointer = signal<{ readonly x: number; readonly y: number }>({ x: 0, y: 0 });

  updateFps(fps: number): void {
    this.fps.set(Math.max(0, Math.round(fps)));
  }

  updatePointer(x: number, y: number): void {
    this.pointer.set({ x: Math.round(x), y: Math.round(y) });
  }
}
