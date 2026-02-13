# 📡 Radar Tecnológico — Telecomunicaciones CEET 2025-2035

Aplicación web interactiva de vigilancia científico-tecnológica para el área de telecomunicaciones del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) — SENA.

## 🚀 Stack Tecnológico

- **Next.js 15+** con App Router y Turbopack
- **React 19** con Server Components
- **TypeScript 5.7**
- **Tailwind CSS 3.4** con tema institucional SENA
- **shadcn/ui** (Radix UI + CVA)
- **Lucide React** para iconografía
- **Work Sans** como fuente institucional

## 📊 Contenido del Radar

- **24 tecnologías** organizadas en **5 direccionadores del desarrollo (D1-D5)**
- **4 anillos de adopción**: ADOPTAR, PROBAR, EVALUAR, MONITOREAR
- **Indicador de temperatura** basado en niveles TRL (1-9)
- **Tabla de nomenclaturas** completa con códigos L01-L25

### Direccionadores

| ID  | Direccionador              | Tecnologías |
| --- | -------------------------- | ----------- |
| D1  | Inteligencia Nativa y IA   | 5           |
| D2  | Conectividad Next-Gen      | 5           |
| D3  | Arquitectura Abierta       | 5           |
| D4  | Modelo de Negocio          | 4           |
| D5  | Confianza y Sostenibilidad | 5           |

## 🎨 Paleta Institucional SENA

| Color           | Hex       | Uso             |
| --------------- | --------- | --------------- |
| Verde Brillante | `#39A900` | Primario        |
| Verde Oscuro    | `#007832` | Secundario      |
| Azul Marino     | `#00304D` | Acento / Navy   |
| Morado          | `#71277A` | Evaluación      |
| Cyan            | `#50E5F9` | Destacados      |
| Amarillo        | `#FDC300` | Alertas / Solar |

## 🛠️ Instalación

```bash
# Clonar o descomprimir el proyecto
cd radar-tecnologico-web

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css        # Theme CSS con variables SENA
│   ├── layout.tsx         # Root layout con Work Sans
│   └── page.tsx           # Página principal
├── components/
│   ├── atoms/             # Componentes atómicos
│   ├── molecules/         # Componentes moleculares
│   ├── organisms/         # Header, RadarChart, TechDetail, NomenclatureTable, Footer
│   ├── templates/         # RadarTemplate (orquestador principal)
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── utils.ts           # cn() helper
│   └── radar-data.ts      # Datos completos del radar (24 tecnologías)
└── types/
    └── radar.ts           # Tipos TypeScript
```

## 👤 Autor

**Mauricio Alexander Vargas Rodríguez**  
Instructor G14 — Centro de Electricidad, Electrónica y Telecomunicaciones  
SENA, Bogotá D.C. — Colombia

Grupo de Investigación, Innovación y Producción Académica — GICS

## 📄 Fuente

Elaboración propia basada en ejercicio de Vigilancia Científico-Tecnológica CEET-GICS (2025).  
Metodología tipo Gartner Technology Radar.

---

© 2026 SENA — Servicio Nacional de Aprendizaje
