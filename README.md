# Radar Tecnológico — Telecomunicaciones CEET 2025-2035

![Version](https://img.shields.io/badge/version-2.1.0-39A900?style=flat-square)
![SENA](https://img.shields.io/badge/SENA-CEET-00324D?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000?style=flat-square)

Aplicación web interactiva de vigilancia científico-tecnológica para el área de telecomunicaciones del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) — SENA.

Grupo de Investigación, Innovación y Producción Académica — **GICS**

## Arquitectura

Este proyecto sigue la línea arquitectónica definida en el **Blueprint v5** (`docs/architectural-blueprint-v5.md`), que establece el radar como un **producto de visualización reusable** (no solo una página institucional).

**Fases implementadas:**

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Quick Wins** | ✅ | Extracción de constantes, modelo de datos enriquecido, listeners optimizados |
| **A1 — Schema** | ✅ | Modelo polimórfico (`src/core/`), JSON schema v5, adaptador backward-compat |
| **A2 — Headless** | ✅ | Store Zustand por instancia, hooks (`useRadar*`), Provider composable |
| **A3 — XLSX Pipeline** | ✅ | `tools/ingest-xlsx/` — parser, transformer, CLI para Excel → JSON |
| **A4 — Tema/i18n/Embed** | ✅ | CSS variables, `messages/es.json`, helper i18n, ruta `/embed` |
| **A5 — Accesibilidad** | ✅ | ARIA roles, navegación por teclado, `prefers-reduced-motion` |
| **A6 — Contract Testing** | ✅ | Ejemplo `examples/minimal-consumer/`, infraestructura para api-extractor |

**Principios rectorés:**
- Separación entre modelo de dominio (`src/core/`) y presentación
- Geometría SVG 100% pura y testeable (`src/core/geometry.ts`)
- Componentes preparados para composición (`RadarProvider`, hooks)
- Pipeline de datos XLSX → JSON operativo
- Multi-instancia por diseño (store independiente por Provider)
- Backward compatibility: todos los componentes existentes funcionan sin cambios

Consulta `docs/architectural-blueprint-v5.md` para el plan completo de 6 fases.

## Stack Tecnológico

- **Next.js 16+** con App Router y Turbopack
- **React 19.2** con Server Components
- **TypeScript 5.7**
- **Tailwind CSS 4.2** con configuración CSS-based (`@theme`) — paleta institucional SENA
- **tw-animate-css** para animaciones de componentes Radix UI
- **shadcn/ui** (Radix UI + CVA)
- **Lucide React 0.575** para iconografía
- **Work Sans** como fuente institucional (Google Fonts)
- **jsPDF 4.2** para exportación de documentos

## Contenido del Radar

- **24 tecnologías** organizadas en **5 direccionadores del desarrollo (D1-D5)**
- **4 anillos de adopción**: ADOPTAR, PROBAR, EVALUAR, MONITOREAR
- **Indicador de madurez** basado en niveles TRL (1-9)
- **Tabla de nomenclaturas** completa con códigos L01-L25

### Direccionadores

| ID  | Direccionador                                   | Tecnologías |
| --- | ----------------------------------------------- | ----------- |
| D1  | Inteligencia Nativa y Redes Autónomas           | 5           |
| D2  | Conectividad Extrema y Convergente              | 5           |
| D3  | Arquitectura de Red Desagregada y Plataformas   | 5           |
| D4  | Monetización de Capacidades de Red              | 4           |
| D5  | Seguridad, Resiliencia y Sostenibilidad         | 5           |

## Características

- **Visualización interactiva SVG** con zoom, pan y selección de tecnologías
- **Gestos táctiles**: Navegación intuitiva mediante gestos (pan y pinch-to-zoom)
- **Filtros dinámicos** por direccionador y fase de adopción
- **Exportación**: PNG (3x resolución) y PDF (A4 landscape)
- **Diseño responsivo**: interfaz adaptada a móvil, tablet y escritorio
- **Interfaz institucional**: paleta SENA, logos CEET y GICS, modo claro

## Paleta Institucional SENA

| Color        | Hex       | Uso                        |
| ------------ | --------- | -------------------------- |
| Verde SENA   | `#39A900` | Primario / Header / Footer |
| Azul SENA    | `#00324D` | Títulos / Bordes           |
| Gris Claro   | `#F2F2F2` | Fondos secundarios         |
| Gris Oscuro  | `#333333` | Texto general              |
| Amarillo     | `#FDC300` | Alertas / TRL bajo         |
| Cian         | `#50E5F9` | Acentos                    |

## Instalación

```bash
# Clonar el repositorio
cd radar-tecnologico-web

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build
npm start
```

## Testing & CI/CD

### Tests Unitarios (Vitest)

```bash
# Ejecutar tests
npm run test

# Con UI interactiva
npm run test:ui

# Con cobertura
npx vitest run --coverage
```

**62 tests** cubriendo:
- `src/core/geometry.test.ts` — Geometría SVG pura
- `src/core/validation.test.ts` — Validación Zod de schema
- `src/core/filters.test.ts` — Filtros de items
- `src/core/maturity/index.test.ts` — Escalas de madurez (TRL, NPS)
- `src/core/store.test.ts` — Zustand store por instancia
- Stories (Storybook + Vitest addon)

### Tests E2E (Playwright)

```bash
# Ejecutar E2E
npm run test:e2e
```

Tests en `e2e/radar.spec.ts`:
- Carga de página principal
- Interactividad de puntos del radar
- Navegación por teclado
- Zoom con rueda del mouse
- Modo embed

### CI/CD (GitHub Actions)

Workflow en `.github/workflows/ci.yml`:
- **Lint & TypeCheck**: ESLint + `tsc --noEmit`
- **Test**: Vitest (62 tests)
- **E2E**: Playwright
- **Build**: Next.js production build

## Storybook

Este proyecto utiliza **Storybook** para documentar y desarrollar componentes de forma aislada.

### Ejecutar Storybook

```bash
npm run storybook
```

Storybook se iniciará en `http://localhost:6006`.

### Construir Storybook estático

```bash
npm run build-storybook
```

El resultado se generará en `storybook-static/`.

### Componentes documentados

| Categoría | Componentes |
|-----------|-------------|
| **Organisms** | `RadarChart`, `TechDetail`, `RadarLegend`, `Header`, `Footer` |
| **UI (shadcn/ui)** | `Button`, `Dialog`, `Badge`, `Card`, `Tabs` |

Las historias se encuentran en archivos `.stories.tsx` junto a cada componente. Storybook está configurado con:

- **Framework**: `@storybook/nextjs-vite` (compatibilidad con Next.js 16 + Vite)
- **Addons**: Essentials, A11y, Docs, Vitest, Chromatic
- **Estilos**: Tailwind CSS v4 cargado vía `globals.css` en `.storybook/preview.ts`
- **TypeScript**: Todas las historias están escritas en TypeScript con tipado estricto

## Estructura del Proyecto

```
src/
├── app/
│   ├── embed/
│   │   └── page.tsx         # Vista embed para iframes (Fase A4)
│   ├── globals.css          # Theme CSS + variables del radar (Fase A4)
│   ├── layout.tsx           # Root layout (Work Sans, metadata)
│   └── page.tsx             # Página principal
├── components/
│   ├── molecules/           # AboutModal, HelpModal
│   ├── organisms/           # Header, Footer, RadarChart, TechDetail, NomenclatureTable, RadarLegend
│   ├── radar/               # RadarProvider (Fase A2)
│   ├── templates/           # RadarTemplate (orquestador principal)
│   └── ui/                  # shadcn/ui components (Button, Badge, Dialog, Tabs...)
├── core/                    # Módulo de dominio polimórfico v5 (Fase A1)
│   ├── types.ts             # Tipos: RadarSchema, RadarItem, RadarRing, MaturityScale...
│   ├── errors.ts            # RadarSchemaError
│   ├── geometry.ts          # Funciones puras: polarToXY, getItemPosition
│   ├── store.tsx            # Zustand store por instancia (Fase A2)
│   ├── hooks.ts             # Hooks consumidores: useRadar*, useRadarFilters...
│   └── index.ts             # API pública estable
├── lib/
│   ├── utils.ts             # cn() helper
│   ├── i18n.ts              # Helper i18n minimal (Fase A4)
│   └── radar-data.ts        # Adaptador backward-compat (carga JSON v5)
└── types/
    └── radar.ts             # Interfaces legacy (@deprecated)
public/
├── data/
│   └── ceet-telecom.json    # Schema v5 — fuente de verdad (Fase A1)
└── assets/logos/            # Logos institucionales
tools/
└── ingest-xlsx/             # Pipeline Excel → JSON (Fase A3)
    ├── src/
    │   ├── parser.ts        # Parser ExcelJS
    │   ├── transformer.ts   # Transformador a RadarSchema
    │   └── index.ts         # CLI
    └── README.md
examples/
└── minimal-consumer/        # Ejemplo de consumo externo (Fase A6)
    ├── README.md
    └── package.json
messages/
└── es.json                  # Strings de UI en español (Fase A4)
```

## Changelog

### v2.1.0 — Preparación arquitectónica v5 (2026)
- **Quick wins blueprint v5**: extracción de constantes mágicas a `RADAR_LAYOUT`
- **Datos como modelo**: `recommendedAction` movido desde `TechDetail.tsx` hacia el modelo `Ring`
- **Umbral TRL parametrizable**: `TRL_THRESHOLDS` extraído como constante configurable
- **Listeners condicionales**: `window.mousemove`/`mouseup` solo durante drag activo
- **Documentación**: README actualizado con referencia al blueprint arquitectónico v5

### v2.0.0 — Rediseño UX/UI (2026)
- Migración a **Next.js 16**, **React 19.2** y **Tailwind CSS v4** (config CSS-based, sin `tailwind.config.ts`)
- **Header** institucional: escudo semilleros en círculo blanco, franja azul SENA, menú responsivo
- **Footer** institucional: logos CEET + GICS, texto institucional alineado con identidad SENA
- **AboutModal** con layout full-screen mobile, credenciales completas del autor
- **HelpModal** con descripción accesible (`DialogDescription`), niveles TRL y anillos
- **Paleta SENA** unificada: verde `#39A900`, azul `#00324D`, modo claro exclusivo
- **CSS cascade fix**: `@layer base` para que utilidades Tailwind pisen `border-color` global
- **Accesibilidad**: `suppressHydrationWarning`, `aria` en todos los `DialogContent`
- **Image**: `style={{ width: "auto" }}` en imágenes responsivas (fix Next.js warning)
- Actualizadas todas las dependencias a versiones vigentes

### v1.0.0 — Versión inicial (2025)
- Radar SVG interactivo con 24 tecnologías
- Zoom, pan, filtros y exportación PNG/PDF

## Autor

**Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM.**
Instructor G14 — Centro de Electricidad, Electrónica y Telecomunicaciones
SENA, Bogotá D.C. — Colombia

Grupo de Investigación, Innovación y Producción Académica — GICS

## Fuente

Elaboración propia basada en ejercicio de Vigilancia Científico-Tecnológica CEET-GICS (2025).
Metodología tipo Gartner Technology Radar.

---

© 2026 SENA — Servicio Nacional de Aprendizaje
