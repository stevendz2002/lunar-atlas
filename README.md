# 🌙 Lunar Atlas — The Celestial Archive

**An Interactive Lunar Observatory**

Una experiencia web inmersiva para descubrir las lunas del sistema solar, combinando astronomía, visualizaciones interactivas y una estética cinematográfica inspirada en el cosmos.

Desarrollada con **Angular 21, TypeScript, Three.js, WebGL y GSAP**, Lunar Atlas transforma la exploración astronómica en una experiencia visual que mezcla ciencia, tecnología y arte digital.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GitHub Actions](https://github.com/stevendz2002/lunar-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/stevendz2002/lunar-atlas/actions/workflows/ci.yml)

**Repositorio:** https://github.com/stevendz2002/lunar-atlas

**Sitio web:** https://lunar-atlas.stevendz.tech/

---

## ✨ Acerca del proyecto

La Tierra no es el único mundo acompañado por una luna. Nuestro sistema solar alberga cientos de satélites naturales con características extraordinarias: océanos ocultos bajo superficies congeladas, volcanes activos, atmósferas densas y paisajes marcados por impactos cósmicos.

**Lunar Atlas** es una aplicación web experimental que permite explorar estos mundos mediante una interfaz visual interactiva.

El proyecto también funciona como laboratorio técnico para implementar animaciones WebGL, arquitectura modular en Angular y automatización de integración y despliegue continuo mediante GitHub Actions.

## 🚀 Características principales

### 🌌 Experiencia cinematográfica

- Escena tridimensional con la Tierra oscurecida y una Luna iluminada.
- Destello anamórfico en el horizonte terrestre.
- Shaders GLSL personalizados para efectos atmosféricos y luminosos.
- Partículas cósmicas y movimientos de cámara con parallax.
- Efectos de postprocesamiento mediante Bloom.
- Introducción animada con opción de omitirla.
- Indicadores de FPS y estado del renderizador.

### 🪐 Catálogo interactivo de lunas

Explora satélites naturales de seis planetas:

- Tierra
- Marte
- Júpiter
- Saturno
- Urano
- Neptuno

El catálogo incluye búsqueda por nombre, filtros por planeta, ordenación y navegación entre resultados.

Cada ficha presenta información como el planeta al que pertenece, radio aproximado, período orbital y características destacadas.

Las representaciones visuales son artísticas y no constituyen fotografías científicas ni modelos a escala.

### 🔭 Datos astronómicos mediante API

La aplicación consulta **Wikidata Query Service** utilizando SPARQL para obtener información de satélites naturales.

Características de la integración:

- Consultas HTTP desde Angular.
- Información astronómica obtenida de Wikidata.
- Estado de la fuente visible en la interfaz.
- Actualización manual de datos.
- Catálogo local de respaldo con 18 lunas destacadas.
- Funcionamiento del catálogo incluso cuando la API no está disponible.

No requiere una clave privada de API ni un backend propio.

### 🌗 Laboratorio de fases lunares

Explorador interactivo que presenta las ocho fases principales del ciclo lunar.

El usuario puede seleccionar una fase y visualizar su representación junto con una explicación.

> Este módulo es educativo y conceptual. No calcula la fase astronómica correspondiente a la fecha actual.

### 🎼 Experiencia musical

La aplicación incluye una sección dedicada a **Lullaby of the New Moon (I): Somnias a Luna**, de HOYO-MiX.

La implementación actual utiliza un archivo de audio local e intenta iniciar la reproducción automáticamente. Los navegadores pueden bloquearla hasta que exista una interacción del usuario.

La interfaz ofrece controles de sonido y un enlace al [video original en YouTube](https://www.youtube.com/watch?v=rX8kBUIT5dE).

La música y los elementos asociados a Genshin Impact pertenecen a sus respectivos titulares. Su incorporación no implica una licencia de redistribución; cualquier publicación del archivo de audio debe contar con la autorización correspondiente.

---

## 🛠️ Stack tecnológico

| Tecnología | Propósito |
|---|---|
| Angular 21 | Framework frontend |
| TypeScript 5.9 | Desarrollo con tipado estricto |
| Three.js | Renderizado tridimensional |
| WebGL / GLSL | Shaders y efectos visuales |
| GSAP | Animaciones y transiciones |
| RxJS | Gestión de operaciones asíncronas |
| Angular Signals | Estado reactivo |
| Wikidata SPARQL | Fuente de datos astronómicos |
| Vitest 4 | Pruebas automatizadas |
| GitHub Actions | Integración y despliegue continuo |
| GitHub Pages | Publicación estática |

## 🏗️ Arquitectura del proyecto

La aplicación utiliza una organización modular por funcionalidades, separando los modelos y servicios compartidos de los componentes visuales.

```text
lunar-atlas/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── assets/
│       ├── eclipse-reference.png
│       └── somnias-a-luna.mp3
├── src/
│   └── app/
│       ├── core/
│       │   ├── models/
│       │   │   └── moon.model.ts
│       │   ├── data/
│       │   │   └── moons.seed.ts
│       │   └── services/
│       │       ├── moon-api.service.ts
│       │       ├── three-engine.service.ts
│       │       └── performance-monitor.service.ts
│       ├── features/
│       │   ├── hero-eclipse/
│       │   ├── moon-gallery/
│       │   ├── moon-observatory/
│       │   └── moon-soundtrack/
│       └── app.component.ts
├── angular.json
├── package.json
└── README.md
```

### Responsabilidades

**Core:** modelos de dominio, catálogo local, integración con Wikidata, motor gráfico y monitoreo de rendimiento.

**Features:** módulos independientes responsables de la presentación y de las interacciones del usuario.

**ThreeEngineService:** administra la escena, cámara, shaders, postprocesamiento, animaciones y liberación de recursos gráficos.

La aplicación utiliza componentes standalone, Signals e inyección de dependencias mediante `inject()`.

El renderizado continuo de Three.js se ejecuta fuera de la zona de detección de cambios de Angular para reducir actualizaciones innecesarias.

---

## 💻 Instalación y ejecución

### Requisitos

Entorno recomendado:

- Node.js 24.13.1
- npm 11.10.1
- Git
- Navegador moderno con soporte WebGL

### 1. Clonar el repositorio

```bash
git clone https://github.com/stevendz2002/lunar-atlas.git
cd lunar-atlas
```

### 2. Instalar dependencias

```bash
npm ci
```

### 3. Iniciar el servidor local

```bash
npm start
```

Abre:

http://localhost:4200/

### 4. Verificar el proyecto

Comprobación de tipos:

```bash
npm run typecheck
```

Pruebas automatizadas:

```bash
npm test
```

Compilación de producción:

```bash
npm run build
```

Los archivos compilados se generan en:

```text
dist/lunar-atlas/browser/
```

---

## 🔄 CI/CD — GitHub Actions

El proyecto incorpora un pipeline en `.github/workflows/ci.yml` que automatiza las comprobaciones y el despliegue de la aplicación.

### Flujo de integración y despliegue

```text
Push / Pull Request
        │
        ▼
GitHub Actions
        │
        ▼
Checkout del repositorio
        │
        ▼
Configurar Node.js 24
        │
        ▼
npm ci
        │
        ▼
TypeScript Typecheck
        │
        ▼
Vitest
        │
        ▼
¿Push a main o ejecución manual en main?
        │
       Sí
        │
        ▼
Compilación Angular
        │
        ▼
Publicar artefacto en GitHub Pages
        │
        ▼
Despliegue
        │
        ▼
Verificación HTTP del sitio
```

### Activadores

- **Pull request hacia `main`:** ejecuta las comprobaciones sin publicar la aplicación.
- **Push a `main`:** ejecuta las verificaciones, compila y despliega.
- **Workflow manual:** permite ejecutar el pipeline desde GitHub Actions.

### Publicación en GitHub Pages

El pipeline utiliza las acciones oficiales de GitHub Pages:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

La configuración contempla la ruta base pública de Pages.

Para habilitar el despliegue, selecciona **GitHub Actions** en `Settings → Pages → Build and deployment → Source`.

El workflow también realiza una petición HTTP para comprobar la respuesta del sitio publicado y busca el identificador de Lunar Atlas en el documento HTML.

**Dominio previsto:** `lunar-atlas.stevendz.tech`

La configuración DNS y la disponibilidad del dominio deben verificarse independientemente del pipeline.

---

## ⚡ Rendimiento y accesibilidad

El proyecto incorpora medidas para reducir la carga gráfica y mejorar la experiencia:

- Renderizado WebGL fuera de `NgZone`.
- Liberación de geometrías, materiales y recursos GPU.
- Monitoreo de FPS.
- Adaptación a pantallas de distintos tamaños.
- Fallback visual cuando WebGL no está disponible.
- Respeto a la preferencia `prefers-reduced-motion`.
- Controles para omitir la introducción.
- Elementos de navegación y controles accesibles mediante teclado.

El rendimiento final depende del dispositivo, navegador y capacidad gráfica del visitante. No se garantiza una tasa fija de FPS.

## 🌍 Fuentes de información

Los datos astronómicos se obtienen de:

**Wikidata**

- https://www.wikidata.org/
- https://query.wikidata.org/
- https://www.wikidata.org/wiki/Wikidata:Data_access

La información puede ser incompleta o variar según la cobertura de cada elemento astronómico.

Los radios y períodos del catálogo local son aproximaciones de referencia.

## ⚖️ Derechos de autor y atribuciones

Lunar Atlas es un proyecto experimental, educativo y no oficial.

La música **Lullaby of the New Moon (I): Somnias a Luna**, de HOYO-MiX, y los elementos visuales de terceros conservan sus respectivos derechos de propiedad intelectual.

*© All rights reserved by miHoYo. Other properties and any right, title, and interest thereof and therein (intellectual property rights included) not derived from Genshin Impact belong to their respective owners.*

Este proyecto no está afiliado, patrocinado ni respaldado por miHoYo o HoYoverse.

Los avisos de atribución no sustituyen las autorizaciones necesarias para utilizar o redistribuir obras protegidas.

Los datos de Wikidata se utilizan conforme a las condiciones de reutilización de dicha plataforma.

---

## 👨‍💻 Desarrollo

**Jhon Edward Steven Loaiza Díaz**

Estudiante de Ingeniería de Sistemas — Unidad Central del Valle del Cauca (UCEVA).

- GitHub: [@stevendz2002](https://github.com/stevendz2002)
- Web: [stevendz.tech](https://stevendz.tech)

---

*“There is more than one moon.”*

**Lunar Atlas — Explore the worlds that orbit other worlds.**
