import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { FEATURED_MOONS, paletteForPlanet } from '../data/moons.seed';
import type { Moon, MoonSource, PlanetName, SparqlResponse } from '../models/moon.model';

/** Wikidata Query Service: datos astronómicos públicos, sin token en el navegador. */
const QUERY = `
SELECT DISTINCT ?moon ?moonLabel ?planet ?radius ?orbitalDays WHERE {
  VALUES ?planet { wd:Q2 wd:Q111 wd:Q319 wd:Q193 wd:Q324 wd:Q332 }
  ?moon wdt:P397 ?planet.
  OPTIONAL {
    ?moon p:P2120/psv:P2120 ?rNode.
    ?rNode wikibase:quantityAmount ?radius;
           wikibase:quantityUnit wd:Q828224.
  }
  OPTIONAL {
    ?moon p:P2146/psv:P2146 ?oNode.
    ?oNode wikibase:quantityAmount ?orbitalDays;
           wikibase:quantityUnit wd:Q573.
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,es". }
}
LIMIT 350`;

const PLANET_ITEMS: Record<string, PlanetName> = {
  Q2: 'Tierra', Q111: 'Marte', Q319: 'Júpiter', Q193: 'Saturno', Q324: 'Urano', Q332: 'Neptuno'
};
const ALIASES: Record<string, string> = {
  moon: 'luna', io: 'ío', ganymede: 'ganímedes', callisto: 'calisto', enceladus: 'encélado',
  titan: 'titán', triton: 'tritón', phobos: 'fobos', deimos: 'deimos', rhea: 'rea', iapetus: 'jápeto', oberon: 'oberón'
};
function normal(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}
function finiteNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function mergeWikidata(response: SparqlResponse): Moon[] {
  const list = new Map<string, Moon>();
  for (const moon of FEATURED_MOONS) list.set(`${moon.planet}:${normal(moon.name)}`, moon);
  for (const row of response.results.bindings) {
    const planetId = row.planet?.value.split('/').pop() ?? '';
    const planet = PLANET_ITEMS[planetId];
    const label = row.moonLabel?.value.trim();
    if (!planet || !label || /^Q\d+$/.test(label) || label.length > 45) continue;
    const normalized = normal(ALIASES[label.toLowerCase()] ?? label);
    const key = `${planet}:${normalized}`;
    const featured = list.get(key);
    const id = row.moon.value.split('/').pop() ?? '';
    if (!/^Q\d+$/.test(id)) continue;
    const radius = finiteNumber(row.radius?.value);
    const period = finiteNumber(row.orbitalDays?.value);
    const moon: Moon = {
      id: featured?.id ?? id,
      name: featured?.name ?? label,
      planet,
      radiusKm: radius ?? featured?.radiusKm ?? null,
      orbitalDays: period ?? featured?.orbitalDays ?? null,
      palette: featured?.palette ?? paletteForPlanet(planet),
      description: featured?.description ?? `Satélite natural asociado a ${planet}. Explora su ficha astronómica y sus propiedades orbitales.`,
      tagline: featured?.tagline ?? 'Un mundo por descubrir',
      featured: Boolean(featured),
      wikidataUrl: `https://www.wikidata.org/wiki/${id}`
    };
    const old = list.get(key);
    if (!old || (old.radiusKm === null && radius !== null) || !old.wikidataUrl) list.set(key, moon);
  }
  return [...list.values()].sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es'));
}

@Injectable({ providedIn: 'root' })
export class MoonApiService {
  private readonly http = inject(HttpClient);
  readonly moons = signal<readonly Moon[]>(FEATURED_MOONS);
  readonly source = signal<MoonSource>('respaldo');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastSync = signal<Date | null>(null);

  async refresh(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.source.set('sincronizando');
    this.error.set(null);
    try {
      const uri = `https://query.wikidata.org/sparql?query=${encodeURIComponent(QUERY)}&format=json`;
      const result = await firstValueFrom(this.http.get<SparqlResponse>(uri).pipe(timeout(14000)));
      if (!result?.results?.bindings?.length) throw new Error('La consulta no devolvió satélites');
      const merged = mergeWikidata(result);
      if (!merged.some(m => m.wikidataUrl)) throw new Error('No llegaron resultados válidos');
      this.moons.set(merged);
      this.source.set('wikidata');
      this.lastSync.set(new Date());
    } catch {
      this.source.set('respaldo');
      this.error.set('Wikidata no está disponible. Se muestran datos de referencia sin conexión.');
    } finally {
      this.loading.set(false);
    }
  }
}
