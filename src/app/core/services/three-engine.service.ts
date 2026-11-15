import { Injectable, NgZone, inject } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PerformanceMonitorService } from './performance-monitor.service';

interface EnergyRipple {
  readonly mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  age: number;
}

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PLANET_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453123); }
  float noise3(vec3 p) {
    vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    float a=mix(hash(i),hash(i+vec3(1.,0.,0.)),f.x);
    float b=mix(hash(i+vec3(0.,1.,0.)),hash(i+vec3(1.,1.,0.)),f.x);
    float c=mix(hash(i+vec3(0.,0.,1.)),hash(i+vec3(1.,0.,1.)),f.x);
    float d=mix(hash(i+vec3(0.,1.,1.)),hash(i+vec3(1.,1.,1.)),f.x);
    return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);
  }
  float fbm(vec3 p) { return .55*noise3(p) + .27*noise3(p*2.1) + .12*noise3(p*4.3); }
  void main() {
    vec3 n=normalize(vNormal);
    float facing=clamp(dot(n,vec3(0.,0.,1.)),0.,1.);
    float fresnel=pow(1.-facing,4.8);
    vec3 sphere=normalize(vec3(cos(vUv.y*3.14159)*cos(vUv.x*6.28318),
      cos(vUv.y*3.14159)*sin(vUv.x*6.28318),sin(vUv.y*3.14159)));
    float land=fbm(sphere*6.5+vec3(1.1,1.6,0.5));
    float coast=smoothstep(.43,.52,land);
    vec3 ocean=vec3(.005,.016,.038);
    vec3 continent=vec3(.026,.038,.042);
    vec3 surface=mix(ocean,continent,coast);
    float clouds=smoothstep(.54,.73,fbm(sphere*11.2+vec3(4.,2.,1.)));
    surface+=vec3(.010,.022,.034)*clouds;
    float lights=step(.81,noise3(sphere*110.))*coast*.025;
    surface+=vec3(.80,.44,.19)*lights;
    vec3 atmosphere=vec3(.28,.53,1.07)*fresnel*(.42+smoothstep(-2.,0.,vPosition.y)*.33);
    gl_FragColor=vec4(surface+atmosphere,1.);
  }
`;

const MOON_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  float crater(vec3 n, vec3 center, float size) {
    float d = length(n - normalize(center)) / size;
    return -.19 * (1. - smoothstep(.55,.98,d)) +
      .14 * exp(-pow((d - 1.) * 7., 2.));
  }
  void main() {
    vec3 n = normalize(vNormal);
    float light = max(dot(n, normalize(vec3(-.65,.48,.75))),0.);
    float maria = smoothstep(.05,.64,
      sin(n.x*8.+sin(n.y*6.))*sin(n.y*7.+n.z*4.));
    float grain = sin(n.x*147.+n.z*109.)*sin(n.y*191.+n.z*88.)*.035;
    float relief = crater(n,vec3(-.28,-.36,1.),.13) +
      crater(n,vec3(.28,.30,1.),.105) + crater(n,vec3(.42,-.11,1.),.22) +
      crater(n,vec3(-.55,.44,1.),.082) + crater(n,vec3(-.14,.49,1.),.065) +
      crater(n,vec3(.10,-.62,1.),.095);
    vec3 rock = mix(vec3(.75,.75,.74),vec3(.44,.46,.50),maria*.80);
    float rim = pow(1.-max(n.z,0.),4.) * light;
    gl_FragColor = vec4((rock + grain + relief)*(.15+.85*light) +
      vec3(.38,.53,.83)*rim*.42,1.);
  }
`;

const HALO_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uIntensity;
  void main() {
    vec2 point = (vUv - 0.5) * vec2(1.0, 1.0);
    float distanceToCenter = length(point);
    float aura = exp(-pow(distanceToCenter * 6.8, 2.0)) * 0.50;
    vec3 color = vec3(0.50, 0.68, 1.35);
    gl_FragColor = vec4(color, aura * uIntensity);
  }
`;

const FLARE_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uIntensity;
  void main() {
    float beam = exp(-pow((vUv.y - 0.5) * 34.0, 2.0));
    float feather = pow(max(0.0, 1.0 - abs(vUv.x - 0.5) * 2.0), 1.5);
    float spark = exp(-pow((vUv.x - 0.5) * 12.0, 2.0)) *
                  exp(-pow((vUv.y - 0.5) * 5.0, 2.0));
    float light = (beam * feather + spark * 0.75) * uIntensity;
    vec3 color = mix(vec3(0.39, 0.68, 1.60), vec3(2.1, 1.70, 1.02),
      smoothstep(0.0, 0.55, spark + beam));
    gl_FragColor = vec4(color * light, clamp(light, 0.0, 1.0));
  }
`;

/** Ciclo WebGL independiente de la detección de cambios de Angular. */
@Injectable({ providedIn: 'root' })
export class ThreeEngineService {
  private readonly zone = inject(NgZone);
  private readonly monitor = inject(PerformanceMonitorService);

  private host: HTMLElement | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private starGeometry: THREE.BufferGeometry | null = null;
  private stars: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
  private originalStars: Float32Array | null = null;
  private flareMaterial: THREE.ShaderMaterial | null = null;
  private haloMaterial: THREE.ShaderMaterial | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private controller: AbortController | null = null;
  private rafId = 0;
  private lastFrame = 0;
  private frameCounter = 0;
  private fpsClock = 0;
  private hitStopUntil = 0;
  private elapsed = 0;
  private pointerSpeed = 0;
  private lastPointerSample = 0;
  private readonly pointer = new THREE.Vector2();
  private readonly targetPointer = new THREE.Vector2();
  private readonly ripples: EnergyRipple[] = [];
  private reducedMotion = false;

  /** Devuelve false si no hay WebGL; el componente deja visible el fallback CSS. */
  attach(host: HTMLElement): boolean {
    this.destroy();
    this.host = host;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2);
    return this.zone.runOutsideAngular(() => {
      try {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) {
          this.zone.run(() => this.monitor.status.set('fallback'));
          return false;
        }

        this.scene = new THREE.Scene();
        this.scene.background = null;
        this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
        this.camera.position.set(0, 0.15, 8.5);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.reducedMotion ? 1 : 1.5));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.domElement.setAttribute('aria-hidden', 'true');
        this.renderer.domElement.className = 'eclipse-canvas';
        host.appendChild(this.renderer.domElement);

        this.setupCelestialBodies();
        this.setupStars();

        if (!this.reducedMotion) {
          this.composer = new EffectComposer(this.renderer);
          this.composer.addPass(new RenderPass(this.scene, this.camera));
          this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.16, 0.62, 0.69);
          this.composer.addPass(this.bloom);
          this.composer.addPass(new OutputPass());
        }

        this.resize();
        this.controller = new AbortController();
        window.addEventListener('pointermove', this.onPointerMove, { passive: true, signal: this.controller.signal });
        window.addEventListener('pointerdown', this.onPointerDown, { passive: true, signal: this.controller.signal });
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(host);
        this.zone.run(() => this.monitor.status.set(this.reducedMotion ? 'reduced-motion' : 'webgl'));

        if (this.reducedMotion) {
          this.render();
        } else {
          this.lastFrame = performance.now();
          this.fpsClock = this.lastFrame;
          this.rafId = requestAnimationFrame(this.animate);
        }
        return true;
      } catch (error: unknown) {
        console.warn('No se pudo iniciar WebGL; usando fondo CSS.', error);
        this.destroy();
        this.zone.run(() => this.monitor.status.set('fallback'));
        return false;
      }
    });
  }

  /** Un destello de 3 frames nominales a 60 FPS. */
  hitStop(milliseconds = 50): void {
    this.hitStopUntil = performance.now() + milliseconds;
  }

  setFlareIntensity(value: number): void {
    if (this.flareMaterial) this.flareMaterial.uniforms['uIntensity']!.value = value;
    if (this.haloMaterial) this.haloMaterial.uniforms['uIntensity']!.value = Math.max(0.35, value);
    if (this.reducedMotion) this.render();
  }

  emitRipple(clientX: number, clientY: number): void {
    if (!this.scene || !this.camera || !this.host || this.reducedMotion) return;
    const rect = this.host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ndc = new THREE.Vector3(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
      0.5
    );
    ndc.unproject(this.camera);
    const direction = ndc.sub(this.camera.position).normalize();
    if (Math.abs(direction.z) < 0.001) return;
    const distance = (0.6 - this.camera.position.z) / direction.z;
    const world = this.camera.position.clone().add(direction.multiplyScalar(distance));
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.97, 1.04, 64),
      new THREE.MeshBasicMaterial({
        color: 0xaedaff, transparent: true, opacity: 0.72,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
      })
    );
    ring.position.set(world.x, world.y, 0.6);
    ring.scale.setScalar(0.1);
    this.ripples.push({ mesh: ring, age: 0 });
    this.scene.add(ring);
  }

  private setupCelestialBodies(): void {
    const scene = this.scene;
    if (!scene) return;

    // Primer plano: Tierra nocturna oscurecida y continentes estilizados.
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 96, 64),
      new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: PLANET_FRAGMENT })
    );
    earth.position.set(0, -5.55, -0.65);
    scene.add(earth);

    // Luna claramente diferenciada y situada cerca del horizonte terrestre.
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.43, 72, 56),
      new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: MOON_FRAGMENT })
    );
    moon.position.set(0, -0.40, 0.12);
    scene.add(moon);

    this.haloMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX, fragmentShader: HALO_FRAGMENT,
      uniforms: { uIntensity: { value: 0.52 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.3), this.haloMaterial);
    halo.position.set(0, -0.40, -0.38);
    scene.add(halo);

    // Emisión horizontal anamórfica justo en el horizonte de la Tierra.
    this.flareMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX, fragmentShader: FLARE_FRAGMENT,
      uniforms: { uIntensity: { value: 0.84 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const flare = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 0.95), this.flareMaterial);
    flare.position.set(0, -1.23, 0.30);
    scene.add(flare);
  }

  private setupStars(): void {
    const scene = this.scene;
    if (!scene) return;
    const count = this.reducedMotion ? 80 : 320;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index++) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * 21;
      positions[offset + 1] = (Math.random() - 0.5) * 12;
      positions[offset + 2] = -2.8 - Math.random() * 3.5;
    }
    this.originalStars = positions.slice();
    this.starGeometry = new THREE.BufferGeometry();
    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.PointsMaterial({
      color: 0xc3deff, size: 0.042, transparent: true, opacity: 0.78,
      sizeAttenuation: true, depthWrite: false
    });
    this.stars = new THREE.Points(this.starGeometry, points);
    scene.add(this.stars);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const nextX = (event.clientX / width) * 2 - 1;
    const nextY = 1 - (event.clientY / height) * 2;
    const now = performance.now();
    const seconds = Math.max(0.016, (now - this.lastPointerSample) / 1000);
    const dx = nextX - this.targetPointer.x;
    const dy = nextY - this.targetPointer.y;
    this.pointerSpeed = Math.min(4, Math.hypot(dx, dy) / seconds);
    this.lastPointerSample = now;
    this.targetPointer.set(nextX, nextY);
    // Se actualiza la UI como máximo una vez cada 100 ms, no en cada frame WebGL.
    if (now - this.lastPointerUi > 100) {
      this.lastPointerUi = now;
      this.zone.run(() => this.monitor.updatePointer(event.clientX, event.clientY));
    }
  };
  private lastPointerUi = 0;

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.emitRipple(event.clientX, event.clientY);
  };

  private readonly animate = (timestamp: number): void => {
    if (!this.scene || !this.camera || !this.renderer) return;
    this.rafId = requestAnimationFrame(this.animate);
    if (document.hidden) {
      this.lastFrame = timestamp;
      this.fpsClock = timestamp;
      this.frameCounter = 0;
      return;
    }
    if (timestamp < this.hitStopUntil) return;
    const delta = Math.min((timestamp - this.lastFrame) / 1000, 0.05);
    this.lastFrame = timestamp;
    this.elapsed += delta;
    this.pointerSpeed *= Math.exp(-delta * 3.5);

    // Damping exponencial, independiente de la tasa de refresco.
    const easing = 1 - Math.exp(-delta * 3.6);
    this.pointer.lerp(this.targetPointer, easing);
    this.camera.position.x += (this.pointer.x * 0.20 - this.camera.position.x) * easing;
    this.camera.position.y += (0.15 + this.pointer.y * 0.13 - this.camera.position.y) * easing;
    this.camera.lookAt(0, -0.12, 0);

    // Repulsión suave de partículas próximas al cursor sin crear objetos por frame.
    const attribute = this.starGeometry?.getAttribute('position');
    if (attribute && this.originalStars) {
      for (let index = 0; index < attribute.count; index++) {
        const offset = index * 3;
        const homeX = this.originalStars[offset] ?? 0;
        const homeY = this.originalStars[offset + 1] ?? 0;
        const pointerX = this.pointer.x * 5.3;
        const pointerY = this.pointer.y * 2.7;
        const dx = homeX - pointerX;
        const dy = homeY - pointerY;
        const influence = Math.exp(-(dx * dx + dy * dy) / 1.9) * (0.22 + this.pointerSpeed * 0.18);
        const x = homeX + dx * influence + Math.sin(this.elapsed * 0.32 + index) * 0.008;
        const y = homeY + dy * influence;
        attribute.setXY(index, x, y);
      }
      attribute.needsUpdate = true;
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      if (!ripple) continue;
      ripple.age += delta;
      const progress = Math.min(1, ripple.age / 0.72);
      ripple.mesh.scale.setScalar(0.15 + progress * 2.3);
      ripple.mesh.material.opacity = (1 - progress) * 0.58;
      if (progress >= 1) {
        this.scene.remove(ripple.mesh);
        ripple.mesh.geometry.dispose();
        ripple.mesh.material.dispose();
        this.ripples.splice(i, 1);
      }
    }

    this.render();
    this.frameCounter++;
    if (timestamp - this.fpsClock >= 1000) {
      const fps = this.frameCounter * 1000 / (timestamp - this.fpsClock);
      this.zone.run(() => this.monitor.updateFps(fps));
      this.fpsClock = timestamp;
      this.frameCounter = 0;
    }
  };

  private render(): void {
    if (!this.scene || !this.camera || !this.renderer) return;
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  private resize(): void {
    if (!this.host || !this.camera || !this.renderer) return;
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
    if (this.reducedMotion) this.render();
  }

  /** Libera listeners, geometrías, materiales, passes, targets, texturas y contexto GPU. */
  destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.controller?.abort();
    this.controller = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.scene) {
      this.scene.traverse((object: THREE.Object3D) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
        const candidate = object as THREE.Mesh | THREE.Points;
        if (candidate.geometry instanceof THREE.BufferGeometry) candidate.geometry.dispose();
        const materials = Array.isArray(candidate.material) ? candidate.material : [candidate.material];
        for (const material of materials) {
          // Si se agregan texturas a los materiales en el futuro, deben liberarse aquí.
          if (material instanceof THREE.ShaderMaterial) {
            for (const uniform of Object.values(material.uniforms)) {
              if (uniform.value instanceof THREE.Texture) uniform.value.dispose();
            }
          }
          if (material instanceof THREE.MeshStandardMaterial) {
            material.map?.dispose();
            material.normalMap?.dispose();
            material.emissiveMap?.dispose();
          }
          material.dispose();
        }
      });
      this.scene.clear();
    }
    this.bloom?.dispose();
    this.composer?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement.remove();
    this.renderer = null;
    this.composer = null;
    this.bloom = null;
    this.flareMaterial = null;
    this.haloMaterial = null;
    this.starGeometry = null;
    this.originalStars = null;
    this.stars = null;
    this.scene = null;
    this.camera = null;
    this.host = null;
    this.ripples.length = 0;
    this.monitor.updateFps(0);
  }
}
