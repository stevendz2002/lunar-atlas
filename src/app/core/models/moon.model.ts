export type IntroPhase = 'loading' | 'impact' | 'ready';
export type EngineStatus = 'starting' | 'webgl' | 'reduced-motion' | 'fallback';
export type PlanetName = 'Tierra' | 'Marte' | 'Júpiter' | 'Saturno' | 'Urano' | 'Neptuno';
export type MoonPalette = 'silver' | 'ice' | 'ember' | 'gold' | 'rose' | 'blue' | 'sage';
export type MoonSource = 'wikidata' | 'respaldo' | 'sincronizando';

export interface Moon {
  readonly id: string;
  readonly name: string;
  readonly planet: PlanetName;
  /** El radio medio aproximado en kilómetros; null cuando la API no lo informa. */
  readonly radiusKm: number | null;
  readonly orbitalDays: number | null;
  readonly palette: MoonPalette;
  readonly description: string;
  readonly tagline: string;
  readonly wikidataUrl: string | null;
  readonly featured: boolean;
}

export interface SparqlBinding {
  readonly moon: { readonly value: string };
  readonly moonLabel?: { readonly value: string };
  readonly planet?: { readonly value: string };
  readonly radius?: { readonly value: string };
  readonly orbitalDays?: { readonly value: string };
}

export interface SparqlResponse {
  readonly results: { readonly bindings: readonly SparqlBinding[] };
}
