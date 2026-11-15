import type { Moon, MoonPalette, PlanetName } from '../models/moon.model';

/** Catálogo de respaldo para iniciar sin conexión; radios y períodos son aproximados. */
const items: ReadonlyArray<readonly [string, PlanetName, number, number | null, MoonPalette, string, string]> = [
  ['Luna', 'Tierra', 1737.4, 27.32, 'silver', 'Nuestra compañera nocturna', 'El único satélite natural de la Tierra. Su superficie conserva un registro de impactos de miles de millones de años.'],
  ['Europa', 'Júpiter', 1560.8, 3.55, 'ice', 'Un océano bajo el hielo', 'Una corteza helada cubre un posible océano global de agua líquida, convirtiéndola en objetivo clave de la exploración.'],
  ['Ío', 'Júpiter', 1821.6, 1.77, 'ember', 'El mundo de los volcanes', 'La intensa gravedad de Júpiter y las demás lunas galileanas provoca una actividad volcánica extraordinaria.'],
  ['Ganímedes', 'Júpiter', 2634.1, 7.15, 'silver', 'Más grande que Mercurio', 'Es la luna más grande del sistema solar y tiene su propio campo magnético.'],
  ['Calisto', 'Júpiter', 2410.3, 16.69, 'gold', 'La memoria de los impactos', 'Su superficie densamente craterizada permite estudiar una historia antigua de colisiones.'],
  ['Titán', 'Saturno', 2574.7, 15.95, 'gold', 'Mares de metano', 'Posee una atmósfera densa y lagos y mares de hidrocarburos en la superficie.'],
  ['Encélado', 'Saturno', 252.1, 1.37, 'ice', 'Géiseres en el vacío', 'Desde su región polar sur surgen chorros de hielo y vapor asociados con un océano subterráneo.'],
  ['Tritón', 'Neptuno', 1353.4, 5.88, 'blue', 'Una órbita al revés', 'Orbita Neptuno en dirección retrógrada, una pista de su posible captura gravitacional.'],
  ['Fobos', 'Marte', 11.27, 0.32, 'rose', 'La luna que se acerca', 'Un pequeño satélite irregular que orbita Marte a una distancia sorprendentemente cercana.'],
  ['Deimos', 'Marte', 6.2, 1.26, 'silver', 'El compañero distante', 'Pequeña luna marciana de forma irregular y superficie cubierta por material fragmentado.'],
  ['Rea', 'Saturno', 763.8, 4.52, 'silver', 'La luna de las cicatrices', 'Satélite helado de Saturno con una superficie antigua marcada por grandes cráteres.'],
  ['Dione', 'Saturno', 561.4, 2.74, 'ice', 'Acantilados de hielo', 'Presenta extensas fracturas brillantes que revelan una compleja historia geológica.'],
  ['Mimas', 'Saturno', 198.2, 0.94, 'silver', 'El ojo del cráter', 'Su enorme cráter Herschel domina una parte considerable de su superficie.'],
  ['Jápeto', 'Saturno', 734.5, 79.32, 'gold', 'Dos caras opuestas', 'Sus hemisferios presentan un contraste de brillo extremadamente marcado.'],
  ['Titania', 'Urano', 788.9, 8.71, 'sage', 'La reina de Urano', 'La mayor luna de Urano muestra cañones y rasgos que sugieren una historia tectónica.'],
  ['Miranda', 'Urano', 235.8, 1.41, 'rose', 'Un mundo reconstruido', 'Acantilados y terrenos de apariencia fragmentada componen un paisaje geológico desconcertante.'],
  ['Ariel', 'Urano', 578.9, 2.52, 'ice', 'Valles de otro mundo', 'Su superficie combina grandes cañones, llanuras y terrenos relativamente jóvenes.'],
  ['Oberón', 'Urano', 761.4, 13.46, 'silver', 'El guardián distante', 'Luna exterior de Urano con una superficie oscura y craterizada.']
];

export const FEATURED_MOONS: readonly Moon[] = items.map(([name, planet, radiusKm, orbitalDays, palette, tagline, description]) => ({
  id: `${planet}-${name}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
  name, planet, radiusKm, orbitalDays, palette, tagline, description, featured: true, wikidataUrl: null
}));
export const PLANETS: readonly PlanetName[] = ['Tierra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'];

export function paletteForPlanet(planet: PlanetName): MoonPalette {
  const palettes: Record<PlanetName, MoonPalette> = {
    Tierra: 'silver', Marte: 'rose', 'Júpiter': 'gold', Saturno: 'ice', Urano: 'sage', Neptuno: 'blue'
  };
  return palettes[planet];
}
