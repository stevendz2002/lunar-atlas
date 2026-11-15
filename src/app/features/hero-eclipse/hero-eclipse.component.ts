import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import type { IntroPhase } from '../../core/models/moon.model';
import { ThreeEngineService } from '../../core/services/three-engine.service';
import { PerformanceMonitorService } from '../../core/services/performance-monitor.service';

@Component({
  selector: 'app-hero-eclipse',
  standalone: true,
  templateUrl: './hero-eclipse.component.html',
  styleUrl: './hero-eclipse.component.css'
})
export class HeroEclipseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) private canvasHost!: ElementRef<HTMLDivElement>;
  @ViewChild('copy', { static: true }) private copy!: ElementRef<HTMLElement>;
  @ViewChild('preloader', { static: false }) private preloader!: ElementRef<HTMLDivElement>;
  @ViewChild('introFlare', { static: false }) private introFlare!: ElementRef<HTMLDivElement>;

  private readonly zone = inject(NgZone);
  private readonly engine = inject(ThreeEngineService);
  readonly monitor = inject(PerformanceMonitorService);
  readonly phase = signal<IntroPhase>('loading');
  readonly progress = signal(0);
  readonly webglAvailable = signal(false);
  private timeline: gsap.core.Timeline | null = null;
  private parallaxX: ((value: number) => void) | null = null;
  private parallaxY: ((value: number) => void) | null = null;
  private readonly listeners = new AbortController();
  private destroyed = false;
  private introSkipped = false;

  ngAfterViewInit(): void {
    this.webglAvailable.set(this.engine.attach(this.canvasHost.nativeElement));
    this.progress.set(40);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.skipIntro();
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.parallaxX = gsap.quickTo(this.copy.nativeElement, 'x', { duration: 0.9, ease: 'power3.out' });
      this.parallaxY = gsap.quickTo(this.copy.nativeElement, 'y', { duration: 0.9, ease: 'power3.out' });
      window.addEventListener('pointermove', this.onParallax, { passive: true, signal: this.listeners.signal });
    });
    void this.prepareIntro();
  }

  private readonly onParallax = (event: PointerEvent): void => {
    if (this.phase() !== 'ready' || this.monitor.status() === 'reduced-motion') return;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.zone.runOutsideAngular(() => {
      this.parallaxX?.((event.clientX / width - 0.5) * -13);
      this.parallaxY?.((event.clientY / height - 0.5) * -11);
    });
  };

  skipIntro(): void {
    this.introSkipped = true;
    this.timeline?.kill();
    this.progress.set(100);
    this.engine.setFlareIntensity(0.85);
    this.revealInstantly();
  }

  private async prepareIntro(): Promise<void> {
    // Se muestran hitos de carga reales: motor, imagen y fuentes.
    await this.assetReady();
    if (this.destroyed || this.introSkipped) return;
    this.progress.set(75);
    await Promise.race([
      document.fonts.ready.then(() => undefined),
      new Promise<void>((resolve) => window.setTimeout(resolve, 1300))
    ]);
    if (this.destroyed || this.introSkipped) return;
    this.progress.set(100);
    this.playIntro();
  }

  private async assetReady(): Promise<void> {
    const image = new Image();
    image.src = new URL('assets/eclipse-reference.png', document.baseURI).href;
    try {
      await Promise.race([
        image.decode(),
        new Promise<void>((resolve) => window.setTimeout(resolve, 2000))
      ]);
    } catch {
      // Un recurso decorativo nunca bloquea la navegación.
    }
  }

  private playIntro(): void {
    this.phase.set('impact');
    this.engine.hitStop(50); // Tres frames a 60 FPS; no congela Angular.
    const intensity = { value: 0.5 };
    this.zone.runOutsideAngular(() => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          if (!this.destroyed) this.zone.run(() => this.phase.set('ready'));
        }
      });
      this.timeline
        .fromTo(this.introFlare.nativeElement,
          { scaleX: 0.08, opacity: 0.2 },
          { scaleX: 1.8, opacity: 1, duration: 0.075, ease: 'power4.out' })
        .to(intensity, {
          value: 2.9, duration: 0.09,
          onUpdate: () => this.engine.setFlareIntensity(intensity.value)
        }, 0)
        .to(intensity, {
          value: 0.85, duration: 0.55, ease: 'power2.out',
          onUpdate: () => this.engine.setFlareIntensity(intensity.value)
        }, 0.12)
        .to(this.introFlare.nativeElement, { opacity: 0, duration: 0.55 }, 0.16)
        .to(this.preloader.nativeElement, { autoAlpha: 0, duration: 0.65 }, 0.35)
        .fromTo(this.copy.nativeElement,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.82, ease: 'power3.out' }, 0.55);
    });
  }

  private revealInstantly(): void {
    if (this.destroyed) return;
    this.zone.runOutsideAngular(() => {
      gsap.set(this.preloader.nativeElement, { autoAlpha: 0 });
      gsap.set(this.copy.nativeElement, { autoAlpha: 1, x: 0, y: 0 });
    });
    this.phase.set('ready');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.listeners.abort();
    this.timeline?.kill();
    this.parallaxX = null;
    this.parallaxY = null;
    gsap.killTweensOf(this.copy.nativeElement);
    this.engine.destroy();
  }
}
