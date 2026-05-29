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

// ── Paleta SENA / semántica de brecha ────────────────────────────────────────
// Colores SENA institucionales + semántica de estado de brecha.

const GAP_COLORS: Record<string, string> = {
  critica: "bg-red-700 text-white",         // Rojo SENA — brecha crítica (Tabla 11)
  alta: "bg-amber-500 text-white",           // Ámbar — brecha alta (Tabla 11)
  moderada: "bg-green-300 text-green-900",   // Verde claro — brecha moderada
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
    { key: "L1", label: "Tecnologías",      order: 1, color: "#3949AB" }, // índigo
    { key: "L2", label: "Infraestructura",  order: 2, color: "#00897B" }, // teal
    { key: "L3", label: "Talento & I+D+i",  order: 3, color: "#F9A825" }, // ámbar
    { key: "L4", label: "Alianzas",         order: 4, color: "#8E24AA" }, // púrpura
  ],

  // ── Horizon buckets: 5 columnas de tiempo ────────────────────────────────
  horizonBuckets: [
    { key: "ahora",  label: "Ya / Ahora",  order: 1 },
    { key: "corto",  label: "0–12 meses",  order: 2 },
    { key: "medio1", label: "1–3 años",    order: 3 },
    { key: "medio2", label: "3–5 años",    order: 4 },
    { key: "largo",  label: "5–10 años",   order: 5 },
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

/**
 * Construye el TrajectoryDataset para el mapa de trayectoria telecom.
 *
 * Capa L1 — Tecnologías: derivada de TODOS los items de TECHNOLOGIES.
 * Capas L2/L3/L4 — Infraestructura, Talento & I+D+i, Alianzas:
 *   Pobladas solo para D1 y D3 (MVP), transcritas fielmente del GOR.
 *   D2/D4/D5 quedan vacíos (carga incremental futura).
 */
export function buildTelecomTrajectory(): TrajectoryDataset {
  const items: TrajectoryItem[] = [];

  // ── L1: Tecnologías (todos los direccionadores) ───────────────────────────
  // Fuente: TECHNOLOGIES de radar-data.ts
  // El horizonte se normaliza con el helper del motor (normalizeHorizon).
  // Las líneas críticas (L01, L02, L04, L11, L12 per Tabla 11) llevan gap="critica".

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
      gap: isCritical ? "critica" : undefined,
      relatedIds: [],
      source: "Radar CEET",
      meta: { code: tech.code, kind: "tecnologia" },
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
  // JUICIO: el lab AIOps se asigna a D1 porque L04 (ML/DL para redes) es D1. Horizonte 6-18m → medio1.
  items.push({
    id: "d1-l2-lab-aiops",
    layer: "L2",
    driver: "D1",
    horizon: "medio1", // GOR Tabla 11: R-03, 6-18 meses → medio1 (spec A6)
    title: "Lab AIOps con datasets reales y Python",
    detail:
      "Implementar ambiente de aprendizaje para entrenar modelos ML de predicción de tráfico, detección de anomalías y optimización de recursos de red con datasets reales. Requiere GPUs o cloud para entrenamiento.",
    gap: "critica", // Tabla 11 fila 3: brecha Crítica (L04 — sin equipos ni software dedicado)
    source: "GOR Tabla 11 — R-03",
    meta: { kind: "ambiente", priority: "P1", closure: "R-03", line: "L04" },
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
    title: "Capacitación docente: IA/ML para redes (certificaciones Nokia / Ericsson Educate)",
    detail:
      "Plan de formación para instructores en fundamentos de IA/ML aplicados a telecomunicaciones. Certificaciones disponibles en Nokia Academy y Ericsson Educate. Mínimo 2 instructores capacitados.",
    gap: "critica", // Tabla 11: L01/L04 sin formación IA/ML → brecha crítica
    source: "GOR Tabla 8",
    meta: { kind: "talento", priority: "P1" },
  });

  // Tabla 8: "Todos los programas — Formación Transversal —
  //   Incluir módulo transversal de Python + ML básico — P2 (6-24 meses)"
  items.push({
    id: "d1-l3-python-ml-transversal",
    layer: "L3",
    driver: "D1",
    horizon: "medio1", // P2 = 6-24 meses → medio1 (JUICIO: plazo medio del rango)
    title: "Módulo transversal Python + ML básico (todos los programas)",
    detail:
      "Incluir módulo obligatorio de Python y Machine Learning básico como competencia transversal en todos los programas de telecomunicaciones del CEET.",
    gap: "alta", // Tabla 11: ausencia en aprendices pero no en nivel crítico directo
    source: "GOR Tabla 8",
    meta: { kind: "talento", priority: "P2" },
  });

  // Tabla 10, fila D1: "Implementación de laboratorio de IA aplicada a operaciones de red (AIOps)"
  //   Tipo: I+D Aplicada (SENNOVA). Aliado: Nokia / Ericsson Educate.
  //   Objetivo: Diseñar e implementar ambiente ML para predicción de tráfico, detección de anomalías.
  items.push({
    id: "d1-l3-proyecto-aiops-sennova",
    layer: "L3",
    driver: "D1",
    horizon: "medio1", // JUICIO: proyecto SENNOVA, ventana típica 1-2 años → medio1
    title: "Proyecto SENNOVA: Lab IA aplicada a operaciones de red (AIOps)",
    detail:
      "I+D Aplicada SENNOVA: diseñar e implementar ambiente de aprendizaje donde aprendices entrenen modelos ML para predicción de tráfico, detección de anomalías y optimización de recursos de red usando datasets reales. Aliado potencial: Nokia / Ericsson Educate.",
    source: "GOR Tabla 10",
    meta: {
      kind: "proyecto",
      projectType: "I+D Aplicada (SENNOVA)",
      ally: "Nokia / Ericsson Educate",
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
    gap: "critica",
    source: "GOR Tabla 8",
    meta: { kind: "servicio", priority: "P1" },
  });

  // ── D1 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D1 (IA/ML nativa):
  // Nokia Bell Labs, Ericsson, Huawei, Virginia Tech (Walid Saad — redes autónomas)

  items.push({
    id: "d1-l4-nokia",
    layer: "L4",
    driver: "D1",
    horizon: "corto", // JUICIO: alianza de implementación inmediata (certificaciones disponibles)
    title: "Nokia Bell Labs",
    detail:
      "Innovación en gemelo digital, edge computing y óptica. Nokia Academy con programas certificados. Tipo de alianza sugerida: certificaciones y co-creación de contenidos.",
    source: "GOR Tabla 9",
    meta: { kind: "alianza", ally: "Nokia Bell Labs", allyType: "Empresa", country: "Finlandia" },
  });

  items.push({
    id: "d1-l4-ericsson",
    layer: "L4",
    driver: "D1",
    horizon: "corto", // Ericsson Educate con cursos gratuitos → alianza implementable 0-12m
    title: "Ericsson",
    detail:
      "IA agéntica para redes, cloud RAN. Ericsson Educate con cursos gratuitos. Tipo de alianza sugerida: Programa Ericsson Educate / Pasantías.",
    source: "GOR Tabla 9",
    meta: { kind: "alianza", ally: "Ericsson", allyType: "Empresa", country: "Suecia / Col." },
  });

  items.push({
    id: "d1-l4-virginia-tech",
    layer: "L4",
    driver: "D1",
    horizon: "medio1", // JUICIO: alianza académica, acuerdo formal toma 1-2 años
    title: "Virginia Tech (Walid Saad)",
    detail:
      "Referente en redes autónomas y Federated Learning. Tipo de alianza sugerida: intercambio de conocimiento y publicaciones conjuntas.",
    source: "GOR Tabla 9",
    meta: { kind: "alianza", ally: "Virginia Tech", allyType: "Universidad", country: "EE.UU." },
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
    gap: "critica", // Tabla 11 fila 6: L12 brecha Crítica (sin laboratorio SDN/NFV)
    source: "GOR Tabla 11 — R-06 / Tabla 8",
    meta: { kind: "ambiente", priority: "P1", closure: "R-06", line: "L12" },
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
    gap: "critica", // Tabla 11 fila 5: L11 brecha Crítica (no incluido en programas actuales)
    source: "GOR Tabla 11 — R-05",
    meta: { kind: "ambiente", priority: "P1", closure: "R-05", line: "L11" },
  });

  // Tabla 11, fila 4 (L06 / SDR): "R-04: Kit SDR 5G NR + srsRAN (6-18 meses)"
  // Tabla 8: "Laboratorio de Radiocomunicaciones — Adquisición de Tecnología —
  //   Adquirir módulo SDR (USRP B200 + srsRAN) — P1"
  // JUICIO: L06 es D2 pero el kit SDR físico es infraestructura compartida con D3 (Open RAN).
  //   Se coloca en D3 porque el lab SDN/NFV/Open RAN lo integra (Tabla 10 D3 lo menciona).
  //   El ítem tecnológico L06 sigue en D2/L1.
  items.push({
    id: "d3-l2-kit-sdr",
    layer: "L2",
    driver: "D3",
    horizon: "medio1", // GOR Tabla 11: R-04, 6-18 meses → medio1 (spec A6)
    title: "Kit SDR para prácticas 5G NR y Open RAN (USRP B200 + srsRAN)",
    detail:
      "Adquirir módulo SDR (Software Defined Radio) para prácticas de 5G NR y Open RAN. Kit básico: USRP B200 + srsRAN. Sin equipos 5G NR actualmente.",
    gap: "critica", // Tabla 11 fila 4: L06 brecha Crítica (sin equipos 5G NR)
    source: "GOR Tabla 8 / Tabla 11 — R-04",
    meta: {
      kind: "ambiente",
      priority: "P1",
      closure: "R-04",
      line: "L06",
      // JUICIO: el SDR aparece en Tabla 8 bajo "Laboratorio de Radiocomunicaciones"
      //   y en Tabla 10 D3 como parte del lab SDN/NFV/Open RAN. Se asigna a D3.
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
    gap: "critica",
    source: "GOR Tabla 8",
    meta: { kind: "talento", priority: "P1" },
  });

  // Tabla 10, fila D3: "Creación de laboratorio SDN/NFV/Open RAN con herramientas open-source"
  //   Tipo: Modernización de Ambientes. Aliado: O-RAN Alliance / Red Hat.
  items.push({
    id: "d3-l3-proyecto-sdn-nfv-open-ran",
    layer: "L3",
    driver: "D3",
    horizon: "medio1", // JUICIO: modernización de ambientes, ventana típica 1-2 años
    title: "Proyecto: Lab SDN/NFV/Open RAN con herramientas open-source",
    detail:
      "Modernización de Ambientes: desplegar infraestructura virtualizada con GNS3/EVE-NG + Docker + ONOS + simulador O-RAN (OAIC/ns-O-RAN) para prácticas de redes programables, orquestación y desagregación. Aliado potencial: O-RAN Alliance / Red Hat.",
    source: "GOR Tabla 10",
    meta: {
      kind: "proyecto",
      projectType: "Modernización de Ambientes",
      ally: "O-RAN Alliance / Red Hat",
    },
  });

  // Tabla 8: "Instructores — Capacitación Docente — SDN (ONF) — P1 (0-12 meses)"
  items.push({
    id: "d3-l3-capacitacion-sdn-onf",
    layer: "L3",
    driver: "D3",
    horizon: "corto", // P1 = 0-12 meses
    title: "Capacitación docente: SDN/NFV y Open RAN (certificación ONF, O-RAN Alliance)",
    detail:
      "Plan de formación para instructores en SDN (Open Networking Foundation), NFV y Open RAN. Certificaciones disponibles en ONF y O-RAN Alliance. Mínimo 2 instructores capacitados.",
    gap: "critica", // Tabla 11: L12 brecha Crítica (conceptos básicos sin práctica)
    source: "GOR Tabla 8",
    meta: { kind: "talento", priority: "P1" },
  });

  // ── D3 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9 — aliados relevantes a D3 (SDN/NFV, Open RAN, Edge):

  items.push({
    id: "d3-l4-o-ran-alliance",
    layer: "L4",
    driver: "D3",
    horizon: "medio1", // JUICIO: membresía académica, proceso formal 6-12 meses
    title: "O-RAN Alliance",
    detail:
      "Definición de estándares Open RAN. Laboratorios de testing abiertos. Tipo de alianza sugerida: membresía académica y acceso a especificaciones.",
    source: "GOR Tabla 9",
    meta: {
      kind: "alianza",
      ally: "O-RAN Alliance",
      allyType: "Consorcio",
      country: "Global",
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
    source: "GOR Tabla 10",
    meta: {
      kind: "alianza",
      ally: "Red Hat",
      allyType: "Empresa",
      country: "EE.UU.",
    },
  });

  items.push({
    id: "d3-l4-universidad-oulu",
    layer: "L4",
    driver: "D3",
    horizon: "largo", // JUICIO: intercambio académico internacional, ventana 5+ años
    title: "Universidad de Oulu (6G Flagship)",
    detail:
      "Centro líder mundial en investigación 6G (Mehdi Bennis). Tipo de alianza sugerida: intercambio académico, webinars y co-investigación en Open RAN e inteligencia edge.",
    source: "GOR Tabla 9",
    meta: {
      kind: "alianza",
      ally: "Universidad de Oulu (6G Flagship)",
      allyType: "Universidad",
      country: "Finlandia",
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
    source: "GOR Tabla 9",
    meta: {
      kind: "alianza",
      ally: "Universidad de los Andes",
      allyType: "Universidad",
      country: "Colombia",
    },
  });

  return { items };
}
