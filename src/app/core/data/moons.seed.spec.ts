import { describe, expect, it } from 'vitest';
import { FEATURED_MOONS, PLANETS, paletteForPlanet } from './moons.seed';

describe('catálogo lunar de respaldo', () => {
  it('incluye lunas de los seis planetas del catálogo', () => {
    for (const planet of PLANETS) {
      expect(FEATURED_MOONS.some(moon => moon.planet === planet)).toBe(true);
    }
  });
  it('no repite IDs y mantiene propiedades numéricas positivas', () => {
    expect(new Set(FEATURED_MOONS.map(moon => moon.id)).size).toBe(FEATURED_MOONS.length);
    expect(FEATURED_MOONS.every(moon => moon.radiusKm !== null && moon.radiusKm > 0)).toBe(true);
  });
  it('asigna paletas definidas a cada planeta', () => {
    expect(paletteForPlanet('Saturno')).toBe('ice');
    expect(paletteForPlanet('Marte')).toBe('rose');
  });
});
