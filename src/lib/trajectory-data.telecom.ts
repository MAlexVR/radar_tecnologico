/**
 * Adaptador de dominio telecom para el motor de trayectoria.
 *
 * Este archivo ES el límite de dominio: puede importar @/lib/radar-data
 * y las Tablas GOR. El motor (src/lib/trajectory/ y src/components/trajectory/)
 * NO importa este archivo — la dependencia es unidireccional:
 *   dominio → adaptador → motor
 *
 * Fuentes de datos:
 *   - radar-data.ts: TECHNOLOGIES (L01–L25), SECTORS (D1–D5)
 *   - GOR-F-012_V03: Tabla 8 (formación/infraestructura), Tabla 9 (aliados),
 *     Tabla 10 (proyectos por direccionador), Tabla 11 (brechas y cierres).
 *
 * REGLA ANTI-FABRICACIÓN: solo se transcriben textos presentes en las tablas
 * del GOR o en radar-data. Los juicios de mapeo están marcados // JUICIO:.
 */

import { TECHNOLOGIES, SECTORS } from "@/lib/radar-data";
import { normalizeHorizon } from "@/lib/trajectory";
import type {
  TrajectoryConfig,
  TrajectoryDataset,
  TrajectoryItem,
} from "@/lib/trajectory";

// ── Constante: título oficial del documento GOR ───────────────────────────────
// Fuente: GOR-F-012_V03_Formato_de_Vigilancia_Cientifico_Tecnologica.md
// Nombre del documento: "Vigilancia científico-tecnológica y prospectiva del área
//   de telecomunicaciones 2025 - 2035" (GOR-F-012 V03)
const FUENTE_GOR =
  "Vigilancia científico-tecnológica y prospectiva del área de telecomunicaciones 2025-2035 (GOR-F-012 V03)";

// ── Paleta SENA / semántica de brecha ────────────────────────────────────────
// Colores SENA institucionales + semántica de estado de brecha.
// Las claves usan la forma capitalizada (con tilde) que va en los datos.

const GAP_COLORS: Record<string, string> = {
  "Crítica":  "bg-red-700 text-white",         // Rojo SENA — brecha crítica (Tabla 11)
  "Alta":     "bg-amber-500 text-white",        // Ámbar — brecha alta (Tabla 11)
  "Moderada": "bg-green-300 text-green-900",    // Verde claro — brecha moderada
};

const DRIVER_COLORS: Record<string, string> = {
  D1: "bg-blue-100 text-blue-900",
  D2: "bg-red-100 text-red-900",
  D3: "bg-orange-100 text-orange-900",
  D4: "bg-purple-100 text-purple-900",
  D5: "bg-teal-100 text-teal-900",
};

const NEUTRAL_COLOR = "bg-gray-100 text-gray-800";

// ── telecomConfig: TrajectoryConfig ──────────────────────────────────────────

/**
 * Configuración del mapa de trayectoria para el dominio telecom CEET.
 * Los strings son en español; el motor es agnóstico.
 */
export const telecomConfig: TrajectoryConfig = {
  // ── Drivers: derivados de SECTORS (D1..D5) con color institucional ───────
  // Colores del radar (SECTORS[i].color) para coherencia visual entre radar y mapa.
  // Orden SECTOR_ORDER: D1, D2, D3, D4, D5.
  drivers: SECTORS.map((s) => ({
    key: s.id,          // "D1" .. "D5"
    label: s.shortLabel, // e.g. "D1: Inteligencia Nativa y Redes Autónomas"
    icon: s.icon,
    color: s.color,     // hex del radar — coherencia visual entre módulos
  })),

  // ── Layers: 4 swimlanes fijadas por la spec con paleta profesional ────────
  // Paleta distintiva para identificar cada capa a simple vista.
  layers: [
    { key: "L1", label: "Tecnologías",      order: 1, color: "#1565C0" }, // azul SENA
    { key: "L2", label: "Infraestructura",  order: 2, color: "#2E7D32" }, // verde SENA
    { key: "L3", label: "Talento & I+D+i",  order: 3, color: "#6A1B9A" }, // púrpura
    { key: "L4", label: "Alianzas",         order: 4, color: "#00838F" }, // cian/teal
  ],

  // ── Horizon buckets: 5 columnas de tiempo con continuo frío vívido ──────
  // Gradiente secuencial teal → azul → índigo → violeta → púrpura.
  // Se lee como progresión temporal (no categórico) y evita:
  //   - colores de capa (azul-oscuro/verde/púrpura-oscuro/cian) → tono y luminosidad distintos
  //   - colores de brecha (rojo #C62828, ámbar #F9A825) → hue completamente diferente
  horizonBuckets: [
    { key: "ahora",  label: "Ya / Ahora",  order: 1, color: "#14B8A6" }, // teal
    { key: "corto",  label: "0–12 meses",  order: 2, color: "#3B82F6" }, // azul
    { key: "medio1", label: "1–3 años",    order: 3, color: "#6366F1" }, // índigo
    { key: "medio2", label: "3–5 años",    order: 4, color: "#8B5CF6" }, // violeta
    { key: "largo",  label: "5–10 años",   order: 5, color: "#A855F7" }, // púrpura
  ],

  // ── colorFor: por gap (semántica de brecha); L1 por driver si no hay gap ─
  colorFor: (item) => {
    if (item.gap && GAP_COLORS[item.gap]) return GAP_COLORS[item.gap];
    // Para tecnologías sin gap explícito, color por driver
    if (item.layer === "L1") {
      return DRIVER_COLORS[item.driver] ?? NEUTRAL_COLOR;
    }
    return NEUTRAL_COLOR;
  },

  // ── labelFor: devuelve item.title ─────────────────────────────────────────
  labelFor: (item) => item.title,

  // ── metricBadge: solo para L1 (TRL) ──────────────────────────────────────
  metricBadge: (item) => {
    if (item.metric && item.layer === "L1") {
      return `TRL ${item.metric.value}`;
    }
    return null;
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convierte sector index (0-based) a clave de driver "D1".."D5".
 */
function driverKey(sectorIndex: number): string {
  return `D${sectorIndex + 1}`;
}

// ── buildTelecomTrajectory ────────────────────────────────────────────────────

/*
 * ────────────────────────────────────────────────────────────────────────────
 * MATRIZ DE COBERTURA (driver × capa → número de ítems L2/L3/L4)
 * ────────────────────────────────────────────────────────────────────────────
 *        L2    L3    L4   | total cap.
 * D1      1     4     3   |     8
 * D2      3     3     4   |    10
 * D3      3     3     4   |    10
 * D4      1     2     3   |     6
 * D5      2     3     3   |     8
 * ────────────────────────────────────────────────────────────────────────────
 * L1 (tecnologías): 24 ítems transversales derivados de TECHNOLOGIES.
 * Total ítems L2-L4: 42 ítems.  Total general: 66 ítems.
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * Construye el TrajectoryDataset para el mapa de trayectoria telecom.
 *
 * Capa L1 — Tecnologías: derivada de TODOS los items de TECHNOLOGIES.
 * Capas L2/L3/L4 — Infraestructura, Talento & I+D+i, Alianzas:
 *   Pobladas para TODOS los direccionadores D1–D5, transcritas fielmente del GOR.
 */
export function buildTelecomTrajectory(): TrajectoryDataset {
  const items: TrajectoryItem[] = [];

  // ── L1: Tecnologías (todos los direccionadores) ───────────────────────────
  // Fuente: TECHNOLOGIES de radar-data.ts
  // El horizonte se normaliza con el helper del motor (normalizeHorizon).
  // Las líneas críticas (L01, L02, L04, L11, L12 per Tabla 11) llevan gap="Crítica".

  const CRITICAL_LINES = new Set(["L01", "L02", "L04", "L06", "L11", "L12", "L21"]);
  // L06 y L21 también están en Tabla 11 con brecha crítica.

  for (const tech of TECHNOLOGIES) {
    const driver = driverKey(tech.sector);
    const horizon = normalizeHorizon(tech.horizon);
    const isCritical = CRITICAL_LINES.has(tech.code);

    items.push({
      id: `tech-${tech.code}`,
      layer: "L1",
      driver,
      horizon,
      title: tech.name,
      detail: tech.desc,
      metric: { label: "TRL", value: tech.trl },
      gap: isCritical ? "Crítica" : undefined,
      relatedIds: [],
      source: `${FUENTE_GOR}, Radar tecnológico`,
      meta: { Código: tech.code, Tipo: "tecnologia" },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // D1: Inteligencia Nativa y Redes Autónomas
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D1 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 3 (L04): "R-03: Lab AIOps con datasets reales y Python (6-18 meses)"
  // Tabla 8: "Laboratorio de Redes — Adquisición de Tecnología — Implementar plataforma SDN/NFV
  //   con GNS3/EVE-NG + Docker + ONOS. Kit de ciberseguridad: Wireshark, Snort, Suricata — P1"
  // Fundamento: el lab AIOps se asigna a D1 porque L04 (ML/DL para redes) es D1. Horizonte
  //   ajustado a corto: proyectos SENNOVA duran 12 meses (convocatoria anual SENA/SENNOVA);
  //   IA en redes validada como tendencia central por CRC Monitoreo Tendencias 2025.
  items.push({
    id: "d1-l2-lab-aiops",
    layer: "L2",
    driver: "D1",
    horizon: "corto", // Fundamento: ciclo SENNOVA 12 meses (SENA/SENNOVA conv. anual); CRC Tendencias 2025
    title: "Lab AIOps con datasets reales y Python",
    detail:
      "Implementar ambiente de aprendizaje para entrenar modelos ML de predicción de tráfico, detección de anomalías y optimización de recursos de red con datasets reales. Requiere GPUs o cloud para entrenamiento.",
    gap: "Crítica", // Tabla 11 fila 3: brecha Crítica (L04 — sin equipos ni software dedicado)
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "ambiente",
      Prioridad: "P1",
      Cierre: "R-03",
      Línea: "L04",
      Fundamento: "Ciclo SENNOVA 12 meses — SENA/SENNOVA convocatoria anual; CRC Monitoreo Tendencias 2025",
    },
  });

  // Tabla 8: "Laboratorio de Radiocomunicaciones — Adquisición de Tecnología —
  //   Adquirir módulo SDR (USRP B200 + srsRAN) — P1"
  // JUICIO: SDR para 5G NR (L06) es D2, pero el kit SDR también es infraestructura base
  //   para IA/ML en radio (D1). No duplicar: el ítem SDR principal va en D2.
  //   En D1 solo incluimos lo explícitamente relacionado con AIOps/IA.

  // ── D1 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Instructores de Telecomunicaciones — Capacitación Docente —
  //   Plan de formación: certificaciones en 5G (Nokia/Ericsson), SDN (ONF), ciberseguridad
  //   (CompTIA Security+). Mínimo 2 instructores por tecnología. — P1 (0-12 meses)"
  // JUICIO: Se aplica a todos los drivers pero se registra en D1 el aspecto IA/ML.
  items.push({
    id: "d1-l3-capacitacion-ia-ml",
    layer: "L3",
    driver: "D1",
    horizon: "corto", // GOR Tabla 8: P1 = implementación 0-12 meses
    title: "Formación a instructores: IA/ML para redes (certificaciones Nokia / Ericsson Educate)",
    detail:
      "Plan de formación para instructores en fundamentos de IA/ML aplicados a telecomunicaciones. Certificaciones disponibles en Nokia Academy y Ericsson Educate. Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11: L01/L04 sin formación IA/ML → brecha crítica
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "talento", Prioridad: "P1" },
  });

  // Tabla 8: "Todos los programas — Formación Transversal —
  //   Incluir módulo transversal de Python + ML básico — P2 (6-24 meses)"
  // Fundamento: MinTIC+Fedesoft proyectan 85.000 talentos digitales adicionales a 2030
  //   (https://www.eltiempo.com 2024); SENA Digital con 30.000 cupos activos en datos/IA;
  //   demanda inmediata confirma horizonte ahora (competencia ya requerida por mercado).
  items.push({
    id: "d1-l3-python-ml-transversal",
    layer: "L3",
    driver: "D1",
    horizon: "ahora", // Fundamento: MinTIC+Fedesoft 85K talentos 2030; SENA Digital 30K cupos activos
    title: "Módulo transversal Python + ML básico (todos los programas)",
    detail:
      "Incluir módulo obligatorio de Python y Machine Learning básico como competencia transversal en todos los programas de telecomunicaciones del CEET.",
    gap: "Alta", // Tabla 11: ausencia en aprendices pero no en nivel crítico directo
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "talento",
      Prioridad: "P2",
      Fundamento: "MinTIC+Fedesoft: 85K talentos digitales a 2030; SENA Digital 30K cupos ciberseg/datos activos — MinTIC/Fedesoft 2024",
    },
  });

  // Tabla 10, fila D1: "Implementación de laboratorio de IA aplicada a operaciones de red (AIOps)"
  //   Tipo: I+D Aplicada (SENNOVA). Aliado: Nokia / Ericsson Educate.
  //   Objetivo: Diseñar e implementar ambiente ML para predicción de tráfico, detección de anomalías.
  // Fundamento: proyectos SENNOVA duran 12 meses (convocatoria anual SENA/SENNOVA).
  //   Horizonte corto = 0-12 meses, alineado al ciclo de convocatoria.
  items.push({
    id: "d1-l3-proyecto-aiops-sennova",
    layer: "L3",
    driver: "D1",
    horizon: "corto", // Fundamento: ciclo SENNOVA 12 meses — SENA/SENNOVA convocatoria anual
    title: "Proyecto SENNOVA: Lab IA aplicada a operaciones de red (AIOps)",
    detail:
      "I+D Aplicada SENNOVA: diseñar e implementar ambiente de aprendizaje donde aprendices entrenen modelos ML para predicción de tráfico, detección de anomalías y optimización de recursos de red usando datasets reales. Aliado potencial: Nokia / Ericsson Educate.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "proyecto",
      Programa: "I+D Aplicada (SENNOVA)",
      Aliado: "Nokia / Ericsson Educate",
      Fundamento: "Ciclo SENNOVA 12 meses — SENA/SENNOVA convocatoria anual",
    },
  });

  // Tabla 8: "Tecnólogo en Gestión de Redes — Actualización Curricular —
  //   Incluir módulos de 5G NR (L06), SDN/NFV con labs Docker+Mininet (L12),
  //   fundamentos de IA/ML para redes (L04). — P1"
  items.push({
    id: "d1-l3-actualizacion-curricular-gestion-redes",
    layer: "L3",
    driver: "D1",
    horizon: "corto", // P1 = 0-12 meses
    title: "Actualización curricular: Tecnólogo en Gestión de Redes (IA/ML para redes L04)",
    detail:
      "Incluir módulos de fundamentos de IA/ML para redes (L04) en el Tecnólogo en Gestión de Redes de Telecomunicaciones. Incorporar prácticas con Open RAN simulado.",
    gap: "Crítica",
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "servicio", Prioridad: "P1" },
  });

  // ── D1 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D1 (IA/ML nativa):
  // Nokia Bell Labs, Ericsson, Huawei, Virginia Tech (Walid Saad — redes autónomas)

  // Fundamento: no hay convenio SENA-Nokia documentado en fuentes primarias colombianas
  //   (investigación web 2025-2026). GOR Tabla 9 la sugiere; sin convenio vigente confirmado.
  //   Horizonte medio2 (3-5 años) para gestión y formalización del convenio.
  items.push({
    id: "d1-l4-nokia",
    layer: "L4",
    driver: "D1",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin convenio SENA-Nokia vigente confirmado
    title: "Nokia Bell Labs",
    detail:
      "Innovación en gemelo digital, edge computing y óptica. Nokia Academy con programas certificados. Tipo de alianza sugerida: certificaciones y co-creación de contenidos.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Nokia Bell Labs",
      "Tipo de aliado": "Empresa",
      País: "Finlandia",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin convenio vigente confirmado)`,
    },
  });

  // Fundamento: no hay convenio SENA-Ericsson documentado en fuentes primarias colombianas
  //   (investigación web 2025-2026). GOR Tabla 9 la sugiere; sin convenio vigente confirmado.
  items.push({
    id: "d1-l4-ericsson",
    layer: "L4",
    driver: "D1",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin convenio SENA-Ericsson vigente confirmado
    title: "Ericsson",
    detail:
      "IA agéntica para redes, cloud RAN. Ericsson Educate con cursos gratuitos. Tipo de alianza sugerida: Programa Ericsson Educate / Pasantías.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Ericsson",
      "Tipo de aliado": "Empresa",
      País: "Suecia / Col.",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin convenio vigente confirmado)`,
    },
  });

  // Fundamento: no hay fuente primaria Colombia-específica para alianza SENA-Virginia Tech
  //   (investigación web 2025-2026). GOR Tabla 9 la sugiere como referencia académica plausible.
  //   Colaboración académica internacional típica: 3-5 años para formalización.
  items.push({
    id: "d1-l4-virginia-tech",
    layer: "L4",
    driver: "D1",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin fuente primaria Colombia-específica
    title: "Virginia Tech (Walid Saad)",
    detail:
      "Referente en redes autónomas y Federated Learning. Tipo de alianza sugerida: intercambio de conocimiento y publicaciones conjuntas.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Virginia Tech",
      "Tipo de aliado": "Universidad",
      País: "EE.UU.",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin convenio vigente confirmado)`,
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D3: Arquitectura de Red Desagregada y Plataformas de Cómputo Distribuido
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D3 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 6 (L12): "R-06: Mininet + Docker + ONOS + EVE-NG (0-12 meses)"
  // Tabla 8: "Laboratorio de Redes — Adquisición de Tecnología — Implementar plataforma
  //   SDN/NFV con GNS3/EVE-NG + Docker + ONOS — P1"
  items.push({
    id: "d3-l2-lab-sdn-nfv",
    layer: "L2",
    driver: "D3",
    horizon: "corto", // GOR Tabla 11: R-06, 0-12 meses / Tabla 8: P1
    title: "Lab SDN/NFV: Mininet + Docker + ONOS + EVE-NG",
    detail:
      "Implementar plataforma SDN/NFV con GNS3/EVE-NG + Docker + ONOS. Kit de laboratorio: Mininet, Docker, ONOS, EVE-NG. Sin laboratorio SDN/NFV actualmente en el CEET.",
    gap: "Crítica", // Tabla 11 fila 6: L12 brecha Crítica (sin laboratorio SDN/NFV)
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "ambiente", Prioridad: "P1", Cierre: "R-06", Línea: "L12" },
  });

  // Tabla 11, fila 5 (L11): "R-05: Lab Open RAN virtualizado con ns-O-RAN (6-24 meses)"
  items.push({
    id: "d3-l2-lab-open-ran",
    layer: "L2",
    driver: "D3",
    horizon: "medio2", // GOR Tabla 11: R-05, 6-24 meses → medio2 (spec A6: 6-24m → medio2)
    title: "Lab Open RAN virtualizado (ns-O-RAN)",
    detail:
      "Desplegar simulador O-RAN (OAIC/ns-O-RAN) para prácticas de arquitectura O-RAN, RIC, xApps/rApps. Sin infraestructura Open RAN actualmente en el CEET.",
    gap: "Crítica", // Tabla 11 fila 5: L11 brecha Crítica (no incluido en programas actuales)
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "ambiente", Prioridad: "P1", Cierre: "R-05", Línea: "L11" },
  });

  // Tabla 11, fila 4 (L06 / SDR): "R-04: Kit SDR 5G NR + srsRAN (6-18 meses)"
  // Tabla 8: "Laboratorio de Radiocomunicaciones — Adquisición de Tecnología —
  //   Adquirir módulo SDR (USRP B200 + srsRAN) — P1"
  // Fundamento: L06 es D2 pero el kit SDR físico es infraestructura compartida con D3 (Open RAN).
  //   Se coloca en D3 porque Tabla 10 D3 lo integra en el lab SDN/NFV/Open RAN.
  //   El ítem tecnológico L06 sigue en D2/L1.
  //   Open RAN con hardware real → medio1: sin piloto Open RAN 5G confirmado en Colombia a 2026;
  //   solo pruebas 4G en sandbox CRC (CRC/colombiainteligente.org 2024).
  items.push({
    id: "d3-l2-kit-sdr",
    layer: "L2",
    driver: "D3",
    horizon: "medio1", // Fundamento: sin piloto Open RAN 5G confirmado en Colombia a 2026 — CRC Sandbox 2024
    title: "Kit SDR para prácticas 5G NR y Open RAN (USRP B200 + srsRAN)",
    detail:
      "Adquirir módulo SDR (Software Defined Radio) para prácticas de 5G NR y Open RAN. Kit básico: USRP B200 + srsRAN. Sin equipos 5G NR actualmente.",
    gap: "Crítica", // Tabla 11 fila 4: L06 brecha Crítica (sin equipos 5G NR)
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "ambiente",
      Prioridad: "P1",
      Cierre: "R-04",
      Línea: "L06",
      Fundamento: "Sin piloto Open RAN 5G confirmado en Colombia a 2026; solo 4G sandbox CRC — CRC Sandbox Regulatorio / colombiainteligente.org 2024",
    },
  });

  // ── D3 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Tecnólogo en Implementación de Redes — Actualización Curricular —
  //   Agregar Open RAN (L11), ciberseguridad Zero Trust (L21), redes ópticas coherentes (L10).
  //   Incluir NTN/LEO conceptual. — P1 (0-12 meses)"
  items.push({
    id: "d3-l3-actualizacion-curricular-impl-redes",
    layer: "L3",
    driver: "D3",
    horizon: "corto", // P1 = 0-12 meses
    title: "Actualización curricular: Tecnólogo en Implementación de Redes (Open RAN L11, SDN/NFV L12)",
    detail:
      "Agregar contenidos de Open RAN (L11), ciberseguridad Zero Trust (L21) y redes ópticas coherentes (L10). Incluir NTN/LEO conceptual. Incorporar prácticas con Open RAN simulado.",
    gap: "Crítica",
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "talento", Prioridad: "P1" },
  });

  // Tabla 10, fila D3: "Creación de laboratorio SDN/NFV/Open RAN con herramientas open-source"
  //   Tipo: Modernización de Ambientes. Aliado: O-RAN Alliance / Red Hat.
  // Fundamento: SDN/NFV identificados como tendencia central en CRC Monitoreo Tendencias 2025
  //   → corto; Open RAN (hardware real) sin piloto 5G confirmado en Colombia → medio1.
  //   El proyecto integra ambos → horizonte conservador medio1 para el conjunto.
  items.push({
    id: "d3-l3-proyecto-sdn-nfv-open-ran",
    layer: "L3",
    driver: "D3",
    horizon: "medio1", // Fundamento: SDN/NFV → corto (CRC 2025); Open RAN 5G → medio1 (CRC Sandbox); conjunto = medio1
    title: "Proyecto: Lab SDN/NFV/Open RAN con herramientas open-source",
    detail:
      "Modernización de Ambientes: desplegar infraestructura virtualizada con GNS3/EVE-NG + Docker + ONOS + simulador O-RAN (OAIC/ns-O-RAN) para prácticas de redes programables, orquestación y desagregación. Aliado potencial: O-RAN Alliance / Red Hat.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "proyecto",
      Programa: "Modernización de Ambientes",
      Aliado: "O-RAN Alliance / Red Hat",
      Fundamento: "SDN/NFV: tendencia central CRC Monitoreo Tendencias 2025; Open RAN 5G: sin piloto confirmado Colombia — CRC Sandbox 2024",
    },
  });

  // Tabla 8: "Instructores — Capacitación Docente — SDN (ONF) — P1 (0-12 meses)"
  items.push({
    id: "d3-l3-capacitacion-sdn-onf",
    layer: "L3",
    driver: "D3",
    horizon: "corto", // P1 = 0-12 meses
    title: "Formación a instructores: SDN/NFV y Open RAN (certificación ONF, O-RAN Alliance)",
    detail:
      "Plan de formación para instructores en SDN (Open Networking Foundation), NFV y Open RAN. Certificaciones disponibles en ONF y O-RAN Alliance. Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11: L12 brecha Crítica (conceptos básicos sin práctica)
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "talento", Prioridad: "P1" },
  });

  // ── D3 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D3 (SDN/NFV, Open RAN, Edge):

  // Fundamento: sin membresía Colombia documentada en O-RAN Alliance a 2026
  //   (investigación web 2025-2026). GOR Tabla 9 sugiere la alianza. Rango global de madurez
  //   Open RAN en Colombia 2026-2028 → medio2.
  items.push({
    id: "d3-l4-o-ran-alliance",
    layer: "L4",
    driver: "D3",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin membresía Colombia confirmada
    title: "O-RAN Alliance",
    detail:
      "Definición de estándares Open RAN. Laboratorios de testing abiertos. Tipo de alianza sugerida: membresía académica y acceso a especificaciones.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "O-RAN Alliance",
      "Tipo de aliado": "Consorcio",
      País: "Global",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin membresía Colombia confirmada)`,
    },
  });

  items.push({
    id: "d3-l4-red-hat",
    layer: "L4",
    driver: "D3",
    // JUICIO: Red Hat no está listado explícitamente en Tabla 9, pero sí en Tabla 10 D3
    //   como aliado potencial del proyecto. Se transcribe de Tabla 10.
    horizon: "medio1",
    title: "Red Hat",
    detail:
      "Plataforma OpenShift y Ansible para virtualización de funciones de red y automatización. Aliado potencial para el proyecto de Lab SDN/NFV/Open RAN (Tabla 10 D3).",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "alianza",
      Aliado: "Red Hat",
      "Tipo de aliado": "Empresa",
      País: "EE.UU.",
    },
  });

  // Fundamento: sin fuente primaria Colombia-específica para alianza SENA-U. Oulu a 2026.
  //   GOR Tabla 9 la sugiere como referencia académica plausible. Ajustado a medio2 (3-5 años)
  //   para formalización de convenio de colaboración internacional.
  items.push({
    id: "d3-l4-universidad-oulu",
    layer: "L4",
    driver: "D3",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin fuente primaria Colombia-específica
    title: "Universidad de Oulu (6G Flagship)",
    detail:
      "Centro líder mundial en investigación 6G (Mehdi Bennis). Tipo de alianza sugerida: intercambio académico, webinars y co-investigación en Open RAN e inteligencia edge.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Universidad de Oulu (6G Flagship)",
      "Tipo de aliado": "Universidad",
      País: "Finlandia",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin convenio vigente confirmado)`,
    },
  });

  // Aliados comunes D1 y D3 también referenciados en Tabla 9:
  items.push({
    id: "d3-l4-u-andes",
    layer: "L4",
    driver: "D3",
    horizon: "medio1", // Alianza local colombiana, formalizable en 6-12 meses
    title: "Universidad de los Andes",
    detail:
      "Grupo de telecomunicaciones con investigación en IoT y espectro. Tipo de alianza sugerida: I+D conjunta, pasantías y semilleros compartidos.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Universidad de los Andes",
      "Tipo de aliado": "Universidad",
      País: "Colombia",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D2: Conectividad Extrema y Convergente (5G/6G/NTN/Óptica)
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D2 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 4 (L06): "R-04: Kit SDR 5G NR + srsRAN (6-18 meses)"
  // Tabla 8: "Laboratorio de Radiocomunicaciones — Adquisición de Tecnología —
  //   Adquirir módulo SDR (Software Defined Radio) para prácticas 5G NR y NTN. Kit básico: USRP B200 + srsRAN. — P1"
  // JUICIO: el kit SDR físico está listado en Tabla 8 bajo D2 (5G NR, NTN).
  //   El ítem d3-l2-kit-sdr también lo referencia porque Tabla 10 D3 lo integra.
  //   Aquí se coloca el ítem de D2 con énfasis en la celda base 5G NR.
  // Fundamento: 5G NR comercial en Colombia desde feb 2024 (subasta IMT-2023);
  //   3.063 estaciones/184 municipios a dic-2025; Bogotá 69,2% cobertura 5G (sede CEET).
  //   Infraestructura 5G ya desplegada → brecha del laboratorio CEET es ahora urgente.
  //   (MinTIC/CRC 2025: https://mintic.gov.co/portal/715/w3-article-428676.html)
  items.push({
    id: "d2-l2-lab-radiocomunicaciones-sdr",
    layer: "L2",
    driver: "D2",
    horizon: "ahora", // Fundamento: 5G comercial Colombia desde feb 2024; 70,1% cobertura nac., 69,2% Bogotá — MinTIC/CRC 2025
    title: "Lab Radiocomunicaciones: módulo SDR para 5G NR y NTN (USRP B200 + srsRAN)",
    detail:
      "Adquirir módulo SDR (Software Defined Radio) para prácticas 5G NR y NTN. Kit básico: USRP B200 + srsRAN. Habilita prácticas de capa física, configuración de red y pruebas de desempeño alineadas con Tabla 10 D2.",
    gap: "Crítica", // Tabla 11 fila 4: L06 brecha Crítica (sin equipos 5G NR)
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "ambiente",
      Prioridad: "P1",
      Cierre: "R-04",
      Línea: "L06",
      Fundamento: "5G comercial Colombia desde feb 2024; 3.063 estaciones/184 municipios dic-2025, Bogotá 69,2% — MinTIC/CRC 2025",
    },
  });

  // Tabla 8: "Laboratorio de Fibra Óptica — Actualización de Equipos —
  //   Evolucionar de GPON a prácticas con WDM y conceptos de óptica coherente.
  //   Adquirir OTDR avanzado y kit de empalme para fibra monomodo de alta densidad. — P2 (6-24 meses)"
  // Tabla 11, fila 10 (L10): "Actualizar lab fibra: OTDR avanzado + kits WDM (6-18 meses)"
  items.push({
    id: "d2-l2-lab-fibra-optica",
    layer: "L2",
    driver: "D2",
    horizon: "medio1", // Tabla 8: P2 = 6-24 meses; Tabla 11: 6-18 meses → medio1
    title: "Lab Fibra Óptica: OTDR avanzado + kits WDM y óptica coherente",
    detail:
      "Evolucionar de GPON a prácticas con WDM y conceptos de óptica coherente. Adquirir OTDR avanzado y kit de empalme para fibra monomodo de alta densidad. OTDR básico existente en el CEET.",
    gap: "Alta", // Tabla 11 fila 10: L10 brecha Alta (FTTH/GPON básico sin óptica coherente)
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "ambiente", Prioridad: "P2", Línea: "L10" },
  });

  // Tabla 11, fila 8 (L07): "Seminarios de actualización y monitoreo (12-24 meses)"
  // Tabla 11, fila 9 (L08): "Módulo conceptual + simulación (12-24 meses)"
  // Fundamento: 6G/THz → largo (5-10 años). Política de Espectro Nacional 2029 de MinTIC/ANE
  //   en consulta pública dic-2025 incluye preparación 6G; tecnología pre-comercial.
  //   NTN/LEO (D2D) en Política de Espectro 2029 → también largo para el aspecto satelital futuro.
  //   (MinTIC/ANE: https://mobiletime.la/noticias/03/12/2025/colombia-politica-de-espectro/)
  items.push({
    id: "d2-l2-modulo-ntn-leo-conceptual",
    layer: "L2",
    driver: "D2",
    horizon: "largo", // Fundamento: 6G pre-comercial; Política Espectro 2029 MinTIC/ANE (consulta dic-2025)
    title: "Módulo conceptual NTN/LEO y 6G/THz (sin requerimiento de equipos)",
    detail:
      "NTN/LEO: protocolos NTN, Direct-to-Device, constelaciones LEO (Tabla 11: sin equipos satelitales). 6G/THz: conceptos THz, RIS, MIMO holográfico (Tabla 11: no incluido, tecnología pre-comercial). Implementable mediante simuladores y seminarios.",
    gap: "Alta", // Tabla 11 filas 8+9: brechas Alta
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "ambiente",
      Prioridad: "P2",
      Líneas: "L07,L08",
      Fundamento: "6G/THz pre-comercial; Política Espectro Nacional 2029 (consulta pública dic-2025) — MinTIC/ANE",
    },
  });

  // ── D2 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Instructores de Telecomunicaciones — Capacitación Docente —
  //   Plan de formación: certificaciones en 5G (Nokia/Ericsson), SDN (ONF),
  //   ciberseguridad (CompTIA Security+). Mínimo 2 instructores por tecnología. — P1"
  // JUICIO: capacitación 5G (Nokia/Ericsson) se asigna a D2 como aspecto dominante.
  // Fundamento: 5G NR comercial en Colombia desde feb 2024; 3.063 estaciones/184 municipios
  //   a dic-2025; demanda inmediata de instructores capacitados en 5G NR ya activa.
  //   GOR P1 + evidencia de despliegue 5G en Bogotá (sede CEET) → ahora.
  //   (MinTIC/CRC 2025: https://mintic.gov.co/portal/715/w3-article-428676.html)
  items.push({
    id: "d2-l3-capacitacion-5g-nokia-qualcomm",
    layer: "L3",
    driver: "D2",
    horizon: "ahora", // Fundamento: 5G comercial Colombia desde feb 2024; demanda inmediata instructores — MinTIC/CRC 2025
    title: "Formación a instructores: 5G NR (certificaciones Nokia/Ericsson, Qualcomm Academy)",
    detail:
      "Plan de formación para instructores en 5G NR: capa física, NTN, RedCap, MIMO. Certificaciones disponibles en Nokia Academy, Ericsson Educate y Qualcomm Academy. Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11 fila 4: L06 brecha Crítica (contenido 4G sin 5G NR)
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "talento",
      Prioridad: "P1",
      Fundamento: "5G comercial Colombia desde feb 2024; 3.063 estaciones/184 municipios dic-2025 — MinTIC/CRC 2025",
    },
  });

  // Tabla 8: "Tecnólogo en Gestión de Redes — Actualización Curricular —
  //   Incluir módulos de 5G NR (L06), SDN/NFV con labs Docker+Mininet (L12),
  //   fundamentos de IA/ML para redes (L04). — P1"
  // JUICIO: el aspecto 5G NR (L06) de este programa se registra en D2.
  items.push({
    id: "d2-l3-actualizacion-curricular-gestion-redes-5g",
    layer: "L3",
    driver: "D2",
    horizon: "corto", // P1 = 0-12 meses
    title: "Actualización curricular: Tecnólogo en Gestión de Redes (5G NR L06 + NTN L08)",
    detail:
      "Incluir módulos de 5G NR (L06: capa física, NTN, RedCap, MIMO mejorado) en el Tecnólogo en Gestión de Redes de Telecomunicaciones. Incorporar NTN/LEO conceptual.",
    gap: "Crítica",
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "talento", Prioridad: "P1" },
  });

  // Tabla 10, fila D2: "Piloto de estación base 5G NR con SDR para formación en radiocomunicaciones avanzadas"
  //   Tipo: Modernización de Ambientes.
  //   Aliado: Qualcomm / MinTIC.
  //   Objetivo: celda 5G NR funcional con USRP + srsRAN; prácticas de capa física, NTN.
  // Fundamento: 5G NR comercial en Colombia desde feb 2024 (subasta IMT-2023);
  //   3.063 estaciones en 184 municipios a dic-2025, 70,1% cobertura poblacional,
  //   Bogotá 69,2% (MinTIC/CRC 2025). Infraestructura 5G ya desplegada en ciudad sede del CEET.
  //   Proyectos SENNOVA duran 12 meses → horizonte corto.
  items.push({
    id: "d2-l3-proyecto-5g-nr-sdr",
    layer: "L3",
    driver: "D2",
    horizon: "corto", // Fundamento: 5G comercial Colombia desde 2024; ciclo SENNOVA 12 meses — MinTIC/CRC 2025
    title: "Proyecto: Piloto estación base 5G NR con SDR (USRP + srsRAN)",
    detail:
      "Modernización de Ambientes: implementar una celda 5G NR funcional usando USRP + srsRAN para prácticas de capa física, configuración de red y pruebas de desempeño. Incluir conceptos NTN. Aliado potencial: Qualcomm / MinTIC.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "proyecto",
      Programa: "Modernización de Ambientes",
      Aliado: "Qualcomm / MinTIC",
      Fundamento: "5G comercial Colombia desde feb 2024; 3.063 estaciones/184 municipios dic-2025 — MinTIC/CRC 2025; ciclo SENNOVA 12 meses",
    },
  });

  // ── D2 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D2 (5G/6G, NTN, óptica):

  // Fundamento: no hay convenio SENA-Qualcomm documentado en fuentes primarias colombianas
  //   (investigación web 2025-2026). GOR Tabla 9 la sugiere. Ajustado a medio2 (3-5 años).
  items.push({
    id: "d2-l4-qualcomm",
    layer: "L4",
    driver: "D2",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin convenio SENA-Qualcomm vigente confirmado
    title: "Qualcomm",
    detail:
      "Líder en chipsets 5G. Qualcomm Academy con programa para universidades. Tipo de alianza sugerida: kits de desarrollo, becas y cursos.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Qualcomm",
      "Tipo de aliado": "Empresa",
      País: "EE.UU.",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin convenio vigente confirmado)`,
    },
  });

  items.push({
    id: "d2-l4-mintIC",
    layer: "L4",
    driver: "D2",
    horizon: "corto", // MinTIC Colombia — regulador local, alianza inmediata viable
    title: "MinTIC Colombia",
    detail:
      "Regulador colombiano. Programas de conectividad rural y transformación digital. Tipo de alianza sugerida: proyectos de inclusión digital y financiamiento. Aliado citado en Tabla 10 D2.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: { Tipo: "alianza", Aliado: "MinTIC Colombia", "Tipo de aliado": "Gobierno", País: "Colombia" },
  });

  items.push({
    id: "d2-l4-operadores-colombianos",
    layer: "L4",
    driver: "D2",
    horizon: "corto", // Operadores con 5G en despliegue — alianza inmediata para prácticas
    title: "Claro / Movistar / WOM Colombia",
    detail:
      "Operadores con despliegue 5G comercial en curso en Colombia. Demanda de talento técnico. Tipo de alianza sugerida: validación de perfiles, pasantías y prácticas en red viva.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Claro / Movistar / WOM Colombia",
      "Tipo de aliado": "Operadores",
      País: "Colombia",
    },
  });

  // Fundamento: sin fuente primaria Colombia-específica para alianza SENA-U. Oulu a 2026.
  //   GOR Tabla 9 la sugiere. Ajustado a medio2 (3-5 años) para formalización de convenio.
  items.push({
    id: "d2-l4-universidad-oulu",
    layer: "L4",
    driver: "D2",
    horizon: "medio2", // Fundamento: GOR Tabla 9 (sugerida); sin fuente primaria Colombia-específica
    title: "Universidad de Oulu (6G Flagship)",
    detail:
      "Centro líder mundial en investigación 6G (Mehdi Bennis). Tipo de alianza sugerida: intercambio académico, webinars y co-investigación en 6G, edge intelligence y Open RAN.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Universidad de Oulu (6G Flagship)",
      "Tipo de aliado": "Universidad",
      País: "Finlandia",
      Procedencia: `${FUENTE_GOR}, Tabla 9 (sugerida, sin convenio vigente confirmado)`,
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D4: Monetización de Capacidades de Red y Transformación B2B
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D4 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 13 (L16): "Módulo APIs + hackathon con operadores (12-24 meses)"
  // JUICIO: el entorno de desarrollo para APIs (L16) es la infraestructura de D4.
  //   "Requiere entorno de desarrollo" (Tabla 11); no se menciona equipamiento especial.
  items.push({
    id: "d4-l2-entorno-desarrollo-apis",
    layer: "L2",
    driver: "D4",
    horizon: "medio2", // Tabla 11 fila 13: 12-24 meses → medio2
    title: "Entorno de desarrollo para APIs de red / NaaS (GSMA Open Gateway)",
    detail:
      "Configurar entorno de desarrollo que permita consumir APIs de GSMA Open Gateway (QoD, NumberVerify, Device Location) sobre red simulada. Requiere entorno de desarrollo (sin hardware especial). Base para Tabla 10 D4.",
    gap: "Alta", // Tabla 11 fila 13: L16 brecha Alta (no incluido en currículo actual)
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "ambiente", Prioridad: "P2", Línea: "L16" },
  });

  // ── D4 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Todos los programas — Formación Transversal —
  //   Incluir módulo transversal de Python + ML básico — P2 (6-24 meses)"
  // JUICIO: el aspecto de APIs/desarrollo de D4 se refuerza con Python transversal.
  //   Se registra en D4 el énfasis en desarrollo de aplicaciones sobre APIs de red.
  items.push({
    id: "d4-l3-formacion-transversal-python-apis",
    layer: "L3",
    driver: "D4",
    horizon: "medio1", // Tabla 8: P2 = 6-24 meses → medio1 (JUICIO: plazo medio del rango)
    title: "Módulo transversal Python + desarrollo de APIs de red (todos los programas)",
    detail:
      "Incluir módulo transversal de Python y desarrollo de APIs como competencia obligatoria para todos los programas de telecomunicaciones. Base para perfil emergente desarrollador telecom.",
    gap: "Alta", // Tabla 11: ausencia de competencias en programación en aprendices
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "talento", Prioridad: "P2" },
  });

  // Tabla 10, fila D4: "Desarrollo de prototipo de API de red para monetización de capacidades 5G"
  //   Tipo: I+D+i Aplicada (Semillero).
  //   Aliado: Operadores colombianos / GSMA.
  //   Objetivo: app web que consuma APIs GSMA Open Gateway; casos de uso B2B.
  // Fundamento: mercado network slicing USD 1,92B (2025) → USD 13,49B (2030);
  //   NaaS emergente identificado por CRC Monitoreo Tendencias 2025;
  //   5G SA y APIs de red como próxima fase de los operadores colombianos.
  //   Semillero + SENNOVA 12 meses → horizonte medio1 (1-3 años).
  items.push({
    id: "d4-l3-proyecto-api-naas-semillero",
    layer: "L3",
    driver: "D4",
    horizon: "medio1", // Fundamento: NaaS emergente CRC Tendencias 2025; mercado slicing creciente; SENNOVA 12m
    title: "Proyecto Semillero: prototipo API de red para monetización de capacidades 5G",
    detail:
      "I+D+i Aplicada (Semillero): desarrollar una aplicación web que consuma APIs de GSMA Open Gateway (QoD, Device Location) sobre una red simulada, demostrando casos de uso B2B. Perfil profesional emergente: desarrollador telecom. Aliado potencial: operadores colombianos / GSMA.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "proyecto",
      Programa: "I+D+i Aplicada (Semillero)",
      Aliado: "Operadores colombianos / GSMA",
      Fundamento: "NaaS emergente CRC Monitoreo Tendencias 2025; mercado slicing USD 1,92B→13,49B 2025-2030",
    },
  });

  // ── D4 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D4 (APIs, NaaS, slicing, B2B):

  // Fundamento: operadores colombianos (Claro, Movistar, Tigo) son miembros GSMA;
  //   Open Gateway como marco de APIs de red para el sector. No hay convenio SENA-GSMA específico
  //   documentado; acceso a informes inmediato pero capacitación formal 6-12m → medio1.
  items.push({
    id: "d4-l4-gsma",
    layer: "L4",
    driver: "D4",
    horizon: "medio1", // Fundamento: operadores colombianos en GSMA (2016+); convenio SENA-GSMA no documentado
    title: "GSMA",
    detail:
      "Open Gateway, estudios de mercado, programas de capacitación. Más de 50 operadores adheridos a Open Gateway. Tipo de alianza sugerida: acceso a informes, capacitación y eventos.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "GSMA",
      "Tipo de aliado": "Asociación",
      País: "Global",
      Fundamento: "Operadores colombianos miembros GSMA; convenio específico SENA-GSMA no documentado en fuentes primarias",
    },
  });

  items.push({
    id: "d4-l4-ccit",
    layer: "L4",
    driver: "D4",
    horizon: "corto", // CCIT Colombia — gremio local, alianza inmediata viable
    title: "Cámara Colombiana de Informática y Telecom (CCIT)",
    detail:
      "Agrupador del sector TIC en Colombia. Estudios de demanda laboral. Tipo de alianza sugerida: validación de perfiles de egreso y participación en eventos sectoriales.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Cámara Colombiana de Informática y Telecom (CCIT)",
      "Tipo de aliado": "Gremio",
      País: "Colombia",
    },
  });

  items.push({
    id: "d4-l4-operadores-d4",
    layer: "L4",
    driver: "D4",
    horizon: "medio1", // JUICIO: alianza para hackathon y prácticas en red viva, 6-12m
    title: "Claro / Movistar / WOM Colombia (APIs y B2B)",
    detail:
      "Operadores colombianos con despliegue 5G y adopción de GSMA Open Gateway. Demanda de talento en perfil desarrollador telecom. Tipo de alianza sugerida: hackathon con APIs reales y prácticas en red viva.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "alianza",
      Aliado: "Operadores colombianos",
      "Tipo de aliado": "Operadores",
      País: "Colombia",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D5: Seguridad, Resiliencia y Sostenibilidad
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D5 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 7 (L21): "R-07: Kit ciberseg (Wireshark, Snort, Suricata) + diplomado (0-12 meses)"
  // Tabla 8: "Laboratorio de Redes — Adquisición de Tecnología —
  //   Kit de ciberseguridad: Wireshark, Snort, Suricata — P1"
  // Fundamento: Colombia absorbió 36M eventos maliciosos 2024 (25% de LATAM), déficit de
  //   5.000 profesionales en ciberseguridad (CCIT 2024); SENA con 30.000 cupos activos
  //   (SENA Digital); alianzas Fortinet/Cisco/MNEMO ya activas → acción inmediata = ahora.
  //   (https://www.ccit.org.co/noticias/balance-de-ciberseguridad-2024-...)
  items.push({
    id: "d5-l2-kit-ciberseguridad",
    layer: "L2",
    driver: "D5",
    horizon: "ahora", // Fundamento: 36M eventos 2024, déficit 5K profesionales — CCIT 2024; SENA 30K cupos
    title: "Kit de ciberseguridad: Wireshark + Snort + Suricata (Lab de Redes)",
    detail:
      "Implementar kit de ciberseguridad en el Laboratorio de Redes: Wireshark, Snort, Suricata. Sin laboratorio de ciberseguridad actualmente. Cierre de brecha R-07.",
    gap: "Crítica", // Tabla 11 fila 7: L21 brecha Crítica (solo fundamentos básicos de seguridad)
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "ambiente",
      Prioridad: "P1",
      Cierre: "R-07",
      Línea: "L21",
      Fundamento: "36M eventos maliciosos Colombia 2024, déficit 5.000 profesionales ciberseg — CCIT 2024; SENA Digital 30K cupos activos",
    },
  });

  // Tabla 11, fila 14 (L22): "Módulo conceptual en todos los programas de redes (6-18 meses)"
  // Fundamento: PQC no requiere hardware especial (Tabla 11). Infraestructura = entorno conceptual/simulación.
  //   Horizonte medio1 conserva el rango GOR (6-18 meses). Sin fuente colombiana específica adicional;
  //   estándares CRYSTALS-Kyber/Dilithium del NIST publicados 2024 como base técnica.
  items.push({
    id: "d5-l2-entorno-pqc-gobernanza",
    layer: "L2",
    driver: "D5",
    horizon: "medio1", // Fundamento: Tabla 11 fila 14 (6-18 meses); NIST PQC estándares 2024
    title: "Entorno formativo: PQC y Gobernanza IA (sin requerimiento de hardware especial)",
    detail:
      "Criptografía PQC (L22): CRYSTALS-Kyber/Dilithium, QKD conceptual — sin requerimiento hardware especial (Tabla 11). Gobernanza IA (L25): explicabilidad, auditoría, ética IA — sin requerimiento especial. Implementable mediante módulos conceptuales y simuladores.",
    gap: "Alta", // Tabla 11 filas 14+16: brechas Alta
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "ambiente", Prioridad: "P2", Líneas: "L22,L25" },
  });

  // ── D5 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Programa nuevo: Ciberseguridad en Telecomunicaciones — Diseño Curricular —
  //   Crear tecnólogo o especialización tecnológica en ciberseguridad de redes.
  //   Perfil: Zero Trust, PQC, detección de amenazas con IA. — P2 (6-24 meses)"
  items.push({
    id: "d5-l3-nuevo-programa-ciberseguridad",
    layer: "L3",
    driver: "D5",
    horizon: "medio1", // Tabla 8: P2 = 6-24 meses → medio1 (JUICIO: plazo medio del rango)
    title: "Nuevo programa: Tecnólogo/Especialización en Ciberseguridad de Redes Telecom",
    detail:
      "Diseñar tecnólogo o especialización tecnológica en ciberseguridad de redes. Perfil: Zero Trust 5G/6G, criptografía PQC, detección de amenazas con IA, auditoría de seguridad en redes. Demanda laboral validada (CCIT, 2024).",
    gap: "Alta", // Tabla 11: demanda laboral insatisfecha; brecha Alta
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "talento", Prioridad: "P2" },
  });

  // Tabla 8: "Instructores — Capacitación Docente — ciberseguridad (CompTIA Security+) — P1"
  // Fundamento: demanda crítica inmediata — 36M eventos Colombia 2024, déficit 5K profesionales
  //   (CCIT 2024); Fortinet y Cisco con programas de certificación activos en SenaTIC 2025.
  //   GOR P1 + respaldo de fuentes primarias colombianas → ahora.
  items.push({
    id: "d5-l3-capacitacion-ciberseguridad",
    layer: "L3",
    driver: "D5",
    horizon: "ahora", // Fundamento: déficit 5K profesionales CCIT 2024; Fortinet/Cisco activos SenaTIC 2025
    title: "Formación a instructores: ciberseguridad (CompTIA Security+, Cisco, Fortinet NSE)",
    detail:
      "Plan de formación para instructores en ciberseguridad de redes: Zero Trust, PQC, detección IA de amenazas. Certificaciones: CompTIA Security+, Cisco CyberOps, Fortinet NSE. Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11 fila 7: L21 brecha Crítica
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "talento",
      Prioridad: "P1",
      Fundamento: "Déficit 5.000 profesionales ciberseg Colombia — CCIT 2024; Fortinet/Cisco activos en SenaTIC 2025",
    },
  });

  // Tabla 10, fila D5: "Cursos complementarios en Ciberseguridad de Redes con certificación"
  //   Tipo: Cursos complementarios.
  //   Aliado: Cisco / Fortinet / Palo Alto.
  //   Objetivo: ruta 120h — Zero Trust 5G, PQC, detección IA, auditoría; prácticas Wireshark/Snort/Suricata.
  // Fundamento: demanda crítica e inmediata — 36M eventos maliciosos 2024, déficit 5K profesionales
  //   (CCIT 2024); SENA Digital 30K cupos activos; alianzas Cisco/Fortinet/MNEMO ya activas en SenaTIC 2025.
  //   Los cursos complementarios pueden iniciarse de inmediato → ahora.
  items.push({
    id: "d5-l3-proyecto-cursos-ciberseguridad",
    layer: "L3",
    driver: "D5",
    horizon: "ahora", // Fundamento: 36M eventos 2024, déficit 5K prof., Cisco/Fortinet activos SenaTIC 2025 — CCIT/MinTIC
    title: "Proyecto: Cursos complementarios Ciberseguridad de Redes Telecom (ruta 120h)",
    detail:
      "Cursos complementarios: ruta de 120h que cubra Zero Trust para 5G, criptografía PQC, detección de amenazas con IA y auditoría de seguridad en redes. Incluir prácticas con Wireshark, Snort, Suricata. Aliado potencial: Cisco / Fortinet / Palo Alto.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "proyecto",
      Programa: "Cursos complementarios",
      Aliado: "Cisco / Fortinet / Palo Alto",
      Fundamento: "36M eventos maliciosos Colombia 2024, déficit 5K profesionales — CCIT 2024; Cisco/Fortinet activos en SenaTIC 2025",
    },
  });

  // ── D5 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D5 (ciberseguridad, sostenibilidad, PQC):
  // Nota: Cisco, Fortinet y Palo Alto están listados en Tabla 10 D5 como aliados potenciales.
  // Huawei también está en Tabla 9 y cubre D5 parcialmente.

  // Fundamento: Cisco Networking Academy activa con SENA desde décadas; SenaTIC 2025
  //   (MinTIC+SENA+OIT) incluye Cisco; convenio vigente confirmado → ahora.
  //   (https://mintic.gov.co/portal/715/w3-article-400043.html; SenaTIC 2025)
  items.push({
    id: "d5-l4-cisco",
    layer: "L4",
    driver: "D5",
    horizon: "ahora", // Fundamento: Cisco Networking Academy con SENA activa; SenaTIC 2025 — MinTIC/SenaTIC 2025
    title: "Cisco Systems",
    detail:
      "Intent-based networking, SD-WAN, SASE. Programas educativos Cisco Networking Academy. Aliado potencial en Tabla 10 D5. Tipo de alianza sugerida: Cisco Networking Academy + CyberOps Associate.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "alianza",
      Aliado: "Cisco Systems",
      "Tipo de aliado": "Empresa",
      País: "EE.UU.",
      Fundamento: "Cisco Networking Academy con SENA activa (décadas); SenaTIC 2025 — MinTIC/SenaTIC 2025",
    },
  });

  // Fundamento: Fortinet participa en SenaTIC 2025 (Seguridad Digital); alianza SENA-MNEMO
  //   ciberseguridad activa desde 2020 (meta 23K aprendices 2024).
  //   (https://www.infobae.com/america/colombia/2020/10/23/...; SenaTIC 2025)
  items.push({
    id: "d5-l4-fortinet",
    layer: "L4",
    driver: "D5",
    horizon: "ahora", // Fundamento: Fortinet en SenaTIC 2025 (Seg. Digital); alianza MNEMO-SENA 2020 — SenaTIC 2025
    title: "Fortinet",
    detail:
      "Ciberseguridad de redes, NGFW, SD-WAN. Fortinet NSE con cursos y certificaciones disponibles. Aliado potencial en Tabla 10 D5. Tipo de alianza sugerida: Fortinet NSE Training Institute.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "alianza",
      Aliado: "Fortinet",
      "Tipo de aliado": "Empresa",
      País: "EE.UU.",
      Fundamento: "Fortinet en SenaTIC 2025 (Seguridad Digital); alianza SENA-MNEMO ciberseg activa desde 2020 — SenaTIC 2025",
    },
  });

  items.push({
    id: "d5-l4-palo-alto",
    layer: "L4",
    driver: "D5",
    horizon: "medio1", // JUICIO: Palo Alto con presencia regional; alianza formal 6-12m
    title: "Palo Alto Networks",
    detail:
      "Zero Trust, SASE/SSE, detección de amenazas con IA. Aliado potencial en Tabla 10 D5. Tipo de alianza sugerida: Palo Alto Networks Academy + prácticas en entorno virtualizado.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: { Tipo: "alianza", Aliado: "Palo Alto Networks", "Tipo de aliado": "Empresa", País: "EE.UU." },
  });

  return { items };
}
