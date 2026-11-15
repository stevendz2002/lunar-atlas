# Lunar Atlas — The Celestial Archive

Experiencia web experimental e interactiva sobre **las lunas del sistema solar** con Angular 21, TypeScript estricto, Three.js, shaders GLSL, GSAP y GitHub Actions. Proyecto independiente de pruebas de despliegue; **ya no es un portafolio**.

## Qué ofrece

- Intro cinematográfica: Tierra oscurecida (shader procedural), Luna, destello de horizonte y partículas cósmicas; botón para saltar la introducción.
- Visor de satélites: globo artístico con cráteres, detalles, radio y período orbital cuando están disponibles.
- Catálogo de lunas de Tierra, Marte, Júpiter, Saturno, Urano y Neptuno, con filtros, búsqueda, ordenación, tarjetas y paginación.
- Datos en vivo mediante **Wikidata Query Service / SPARQL**, sin tokens públicos. La información de respaldo funciona si la API no responde, limita solicitudes o la red falla. El estado de la fuente se muestra en la interfaz. Los radios y períodos se muestran como aproximaciones.
- Explorador conceptual e interactivo de las ocho fases de nuestra Luna. **No calcula la fase lunar de hoy.**
- Créditos y enlace al video original de HOYO-MiX. Reproductor HTML nativo opcional para una fuente de audio autorizada.
- Fallback CSS sin WebGL, soporte para `prefers-reduced-motion`, limpieza GPU y render fuera de `NgZone`.
- Pruebas y compilación con GitHub Actions; despliegue opcional y manual a GitHub Pages.

## Instalación en Windows

Recomendado: Node.js 24.13.1, npm 11.10.1. En PowerShell, dentro de la carpeta **lunar-atlas**:

```powershell
npm install
npm start
```

Abrir <http://localhost:4200/>. Para comprobar:

```powershell
npm test
npm run build
npm run typecheck
```

El proyecto incluye **Vitest 4** para evitar el conflicto de dependencias con `@angular/build` 21.2.x.

## Arquitectura

```text
lunar-atlas/
├── .github/workflows/deploy-pages.yml
├── angular.json
├── package.json
├── public/assets/eclipse-reference.png  # Referencia visual aportada por el usuario
└── src/app/
    ├── core/
    │   ├── models/moon.model.ts
    │   ├── data/moons.seed.ts
    │   └── services/
    │       ├── moon-api.service.ts
    │       ├── three-engine.service.ts
    │       └── performance-monitor.service.ts
    ├── features/
    │   ├── hero-eclipse/
    │   ├── moon-gallery/
    │   ├── moon-observatory/
    │   └── moon-soundtrack/
    └── app.component.{ts,html,css}
```

### API: Wikidata

Archivo `src/app/core/services/moon-api.service.ts`. Usa una petición HTTP GET a:

`https://query.wikidata.org/sparql?query=<SPARQL_CODIFICADA>&format=json`

Consulta satélites mediante la propiedad **P397** (cuerpo astronómico principal) para seis planetas. Utiliza **P2120** para radio en kilómetros y **P2146** para período orbital en días, **solo cuando la propiedad informa esas unidades**. Los valores nulos se indican como **—** o **Sin dato**. La fuente y los resultados pueden variar según disponibilidad y cobertura de Wikidata.

Se incluyó un catálogo educativo local de 18 lunas para que el sitio arranque sin conexión. Si se pierde la red después de una carga exitosa, permanece el último catálogo ya obtenido durante esa sesión. No se requiere clave API ni backend.

> Otra API especializada, Solar System OpenData, requiere token bearer desde septiembre de 2025; no se puso una clave privada en una SPA publicada en GitHub Pages.

## Despliegue a GitHub Pages

1. Crea un **nuevo repositorio** independiente en GitHub, por ejemplo `lunar-atlas`.
2. Copia todos los archivos del proyecto en la **raíz** del repositorio (allí debe quedar `package.json`).
3. Ejecuta `npm install` y sube también `package-lock.json`.
4. Confirma los cambios y haz `git push -u origin main`.
5. En GitHub, **Settings → Pages → Build and deployment → Source: GitHub Actions**.
6. En **Actions**, ejecuta el workflow **GitHub Pages (manual)**. El build usa el nombre del repositorio como ruta base.
7. Normalmente estará en `https://<usuario>.github.io/<nombre-del-repo>/`. Solo da por publicado el proyecto después de confirmar el run y la página.

Workflow: `.github/workflows/deploy-pages.yml`.

## Derechos de autor y atribuciones

La pista «Lullaby of the New Moon (I): Somnias a Luna» de HOYO-MiX se acredita y se enlaza a su video original. El repositorio no incluye la grabación. Para habilitar el audio nativo, configura `soundtrackSource` en `moon-soundtrack.component.ts` con una URL directa o ruta relativa a un archivo autorizado. Si el navegador bloquea el inicio automático con sonido, el visitante puede usar el botón Activar música. Ese mismo botón permite silenciarla mientras recorre el sitio.

El archivo `public/assets/eclipse-reference.png` procede de una captura **facilitada por el usuario para la referencia artística**. **No conocemos su licencia de redistribución.** Una nota de copyright de miHoYo NO constituye una licencia que autorice el uso público de imágenes, música o personajes, y la titularidad de cada obra debe confirmarse. Antes de publicar en Pages, sustituye esa imagen por material con licencia compatible o consigue permiso de uso. Puedes retirarla: la escena WebGL y el fallback CSS continúan funcionando.

Esta es una web no oficial; **no está afiliada a miHoYo/HoYoverse**. La información astronómica procede de Wikidata y el catálogo de respaldo es informativo. Reconoce las condiciones de reutilización de Wikidata y de los posibles recursos visuales adicionales si los agregas.
