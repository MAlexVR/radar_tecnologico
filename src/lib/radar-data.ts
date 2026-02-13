import { Ring, Sector, Technology } from "@/types/radar";

// ═══════════════════════════════════════════════════════════════
// RING CONFIGURATION — matches PNG radar exactly
// ═══════════════════════════════════════════════════════════════
export const RINGS: Ring[] = [
  {
    id: "adopt",
    label: "ADOPTAR",
    radius: 110,
    color: "#2E7D32",
    fillColor: "#C8E6C9",
    borderColor: "#81C784",
    labelColor: "#2E7D32",
    desc: "Implementación inmediata",
    trl: "TRL 7-9",
  },
  {
    id: "trial",
    label: "PROBAR",
    radius: 210,
    color: "#558B2F",
    fillColor: "#E1F0C4",
    borderColor: "#AED581",
    labelColor: "#688C36",
    desc: "Pilotos y capacitación",
    trl: "TRL 5-7",
  },
  {
    id: "assess",
    label: "EVALUAR",
    radius: 305,
    color: "#F9A825",
    fillColor: "#FFF3CD",
    borderColor: "#FFD54F",
    labelColor: "#B48C14",
    desc: "Investigación / formación",
    trl: "TRL 3-5",
  },
  {
    id: "monitor",
    label: "MONITOREAR",
    radius: 400,
    color: "#E64A19",
    fillColor: "#FFE0D2",
    borderColor: "#FFAB91",
    labelColor: "#BE643C",
    desc: "Seguimiento largo plazo",
    trl: "TRL 1-3",
  },
];

// ═══════════════════════════════════════════════════════════════
// SECTOR CONFIGURATION (5 Drivers / Direccionadores)
// Each sector spans 72° (360 / 5)
// ═══════════════════════════════════════════════════════════════
export const SECTOR_ANGLE = 72;

export const SECTORS: Sector[] = [
  {
    id: "D1",
    label: "Inteligencia Nativa y IA",
    shortLabel: "D1: Inteligencia Nativa y IA",
    labelLines: ["Inteligencia", "Nativa y IA"],
    startAngle: -18,
    color: "#1565C0",
    bgLight: "#E3F2FD",
    bgDark: "rgba(21,101,192,0.12)",
    icon: "🧠",
  },
  {
    id: "D2",
    label: "Conectividad Next-Gen",
    shortLabel: "D2: Conectividad Next-Gen",
    labelLines: ["Conectividad", "Next-Gen"],
    startAngle: 54,
    color: "#C62828",
    bgLight: "#FFEBEE",
    bgDark: "rgba(198,40,40,0.12)",
    icon: "📡",
  },
  {
    id: "D3",
    label: "Arquitectura Abierta",
    shortLabel: "D3: Arquitectura Abierta",
    labelLines: ["Arquitectura", "Abierta"],
    startAngle: 126,
    color: "#F57F17",
    bgLight: "#FFF3E0",
    bgDark: "rgba(245,127,23,0.12)",
    icon: "☁️",
  },
  {
    id: "D4",
    label: "Modelo de Negocio",
    shortLabel: "D4: Modelo de Negocio",
    labelLines: ["Modelo de", "Negocio"],
    startAngle: 198,
    color: "#6A1B9A",
    bgLight: "#F3E5F5",
    bgDark: "rgba(106,27,154,0.12)",
    icon: "💰",
  },
  {
    id: "D5",
    label: "Confianza y Sostenibilidad",
    shortLabel: "D5: Confianza y Sostenibilidad",
    labelLines: ["Confianza y", "Sostenibilidad"],
    startAngle: 270,
    color: "#00695C",
    bgLight: "#E0F2F1",
    bgDark: "rgba(0,105,92,0.12)",
    icon: "🛡️",
  },
];

// ═══════════════════════════════════════════════════════════════
// TECHNOLOGIES (24 items)
// ring: 0=ADOPTAR, 1=PROBAR, 2=EVALUAR, 3=MONITOREAR
// sector: 0..4 = D1..D5
// angleOff: offset from sector center in degrees
// ═══════════════════════════════════════════════════════════════
export const TECHNOLOGIES: Technology[] = [
  // ── D1: Inteligencia Nativa y IA ──
  {
    id: "T01",
    name: "ML/DL Optimización de Red",
    code: "L04",
    sector: 0,
    ring: 0,
    angleOff: -8,
    trl: 8,
    desc: "Machine Learning y Deep Learning aplicado a optimización y gestión predictiva de redes de telecomunicaciones.",
    impact: "Alto",
    horizon: "Corto (1-2 años)",
  },
  {
    id: "T02",
    name: "Redes Autónomas Zero-Touch",
    code: "L02",
    sector: 0,
    ring: 1,
    angleOff: 10,
    trl: 6,
    desc: "Redes gestionadas de forma autónoma mediante IA/ML sin intervención humana (ZSM - Zero-touch network and Service Management).",
    impact: "Alto",
    horizon: "Medio (2-4 años)",
  },
  {
    id: "T03",
    name: "IA Generativa / LLM",
    code: "L01",
    sector: 0,
    ring: 1,
    angleOff: -5,
    trl: 4,
    desc: "Aplicación de modelos de lenguaje grandes y IA generativa para documentación, atención al cliente y optimización de redes.",
    impact: "Disruptivo",
    horizon: "Medio (2-4 años)",
  },
  {
    id: "T04",
    name: "Gemelo Digital de Red",
    code: "L03",
    sector: 0,
    ring: 2,
    angleOff: 15,
    trl: 3,
    desc: "Réplica virtual de infraestructura de red para simulación, planificación y predicción de fallos.",
    impact: "Alto",
    horizon: "Medio (3-5 años)",
  },
  {
    id: "T05",
    name: "ISAC",
    code: "L05",
    sector: 0,
    ring: 3,
    angleOff: 15,
    trl: 2,
    desc: "Integrated Sensing and Communication: convergencia de radar y comunicación en una misma señal.",
    impact: "Exploratorio",
    horizon: "Largo (5-10 años)",
  },

  // ── D2: Conectividad Next-Gen ──
  {
    id: "T06",
    name: "5G-Advanced",
    code: "L06",
    sector: 1,
    ring: 0,
    angleOff: -22,
    trl: 8,
    desc: "Evolución del estándar 5G (Rel. 18-19) con mejoras en eficiencia espectral, cobertura y latencia ultra-baja.",
    impact: "Alto",
    horizon: "Corto (1-2 años)",
  },
  {
    id: "T07",
    name: "FWA 5G",
    code: "L09",
    sector: 1,
    ring: 0,
    angleOff: 30,
    trl: 7,
    desc: "Fixed Wireless Access sobre 5G como alternativa de última milla para conectividad de alta velocidad.",
    impact: "Medio",
    horizon: "Corto (1-2 años)",
  },
  {
    id: "T08",
    name: "Redes Ópticas F5G",
    code: "L10",
    sector: 1,
    ring: 1,
    angleOff: -8,
    trl: 6,
    desc: "Evolución de redes de fibra óptica hacia capacidades 50G-PON y redes ópticas programables.",
    impact: "Alto",
    horizon: "Medio (2-4 años)",
  },
  {
    id: "T09",
    name: "NTN / LEO",
    code: "L08",
    sector: 1,
    ring: 1,
    angleOff: 18,
    trl: 5,
    desc: "Redes No Terrestres con constelaciones LEO (Starlink, OneWeb) integradas al ecosistema 3GPP.",
    impact: "Disruptivo",
    horizon: "Medio (2-4 años)",
  },
  {
    id: "T10",
    name: "6G / THz / RIS",
    code: "L07",
    sector: 1,
    ring: 3,
    angleOff: 0,
    trl: 2,
    desc: "Sexta generación: comunicaciones THz, superficies inteligentes reconfigurables y tasas Tbps.",
    impact: "Disruptivo",
    horizon: "Largo (2030+)",
  },

  // ── D3: Arquitectura Abierta ──
  {
    id: "T11",
    name: "SDN/NFV Cloud Native",
    code: "L12",
    sector: 2,
    ring: 0,
    angleOff: -8,
    trl: 8,
    desc: "Virtualización de funciones de red y redes definidas por software con arquitectura cloud-native.",
    impact: "Alto",
    horizon: "Corto (1-2 años)",
  },
  {
    id: "T12",
    name: "Open RAN",
    code: "L11",
    sector: 2,
    ring: 1,
    angleOff: 5,
    trl: 6,
    desc: "Desagregación de la red de acceso radio con interfaces abiertas (O-RAN Alliance).",
    impact: "Alto",
    horizon: "Medio (2-4 años)",
  },
  {
    id: "T13",
    name: "Edge / MEC",
    code: "L13",
    sector: 2,
    ring: 1,
    angleOff: -14,
    trl: 5,
    desc: "Multi-access Edge Computing: procesamiento en el borde de la red para baja latencia.",
    impact: "Alto",
    horizon: "Medio (2-3 años)",
  },
  {
    id: "T14",
    name: "Network Slicing",
    code: "L14",
    sector: 2,
    ring: 2,
    angleOff: 15,
    trl: 4,
    desc: "Segmentación dinámica de red en slices lógicas end-to-end con SLA garantizado.",
    impact: "Alto",
    horizon: "Medio (3-5 años)",
  },
  {
    id: "T15",
    name: "Conv. Red-Cómputo",
    code: "L15",
    sector: 2,
    ring: 3,
    angleOff: -12,
    trl: 2,
    desc: "Fusión de recursos de red y cómputo en una plataforma unificada distribuida.",
    impact: "Exploratorio",
    horizon: "Largo (5-8 años)",
  },

  // ── D4: Modelo de Negocio ──
  {
    id: "T16",
    name: "Servicios B2B",
    code: "L17",
    sector: 3,
    ring: 1,
    angleOff: -10,
    trl: 6,
    desc: "Transformación de operadores en Technology Companies con servicios B2B verticales.",
    impact: "Alto",
    horizon: "Medio (2-4 años)",
  },
  {
    id: "T17",
    name: "APIs Red / NaaS",
    code: "L16",
    sector: 3,
    ring: 2,
    angleOff: 8,
    trl: 4,
    desc: "Exposición de capacidades de red mediante APIs (CAMARA/GSMA) y Network-as-a-Service.",
    impact: "Alto",
    horizon: "Medio (3-5 años)",
  },
  {
    id: "T18",
    name: "Inclusión Digital",
    code: "L19",
    sector: 3,
    ring: 1,
    angleOff: 10,
    trl: 5,
    desc: "Estrategias para cerrar la brecha digital: conectividad rural, alfabetización digital y acceso universal.",
    impact: "Social Alto",
    horizon: "Continuo",
  },
  {
    id: "T19",
    name: "XR / Holográfico",
    code: "L20",
    sector: 3,
    ring: 3,
    angleOff: -10,
    trl: 2,
    desc: "Extended Reality y comunicaciones holográficas como nuevos paradigmas de interacción.",
    impact: "Disruptivo",
    horizon: "Largo (5-10 años)",
  },

  // ── D5: Confianza y Sostenibilidad ──
  {
    id: "T20",
    name: "Ciberseguridad Next-Gen",
    code: "L21",
    sector: 4,
    ring: 1,
    angleOff: -4,
    trl: 6,
    desc: "Seguridad basada en IA, Zero Trust Architecture y detección proactiva de amenazas.",
    impact: "Crítico",
    horizon: "Corto (1-2 años)",
  },
  {
    id: "T21",
    name: "Redes Verdes",
    code: "L23",
    sector: 4,
    ring: 1,
    angleOff: 12,
    trl: 4,
    desc: "Diseño de redes energéticamente eficientes y sostenibles (Green-Native Networks).",
    impact: "Alto",
    horizon: "Medio (3-5 años)",
  },
  {
    id: "T22",
    name: "Criptografía PQC",
    code: "L22",
    sector: 4,
    ring: 2,
    angleOff: -10,
    trl: 3,
    desc: "Algoritmos criptográficos resistentes a computación cuántica (PQC — NIST FIPS 203/204).",
    impact: "Crítico",
    horizon: "Medio (3-5 años)",
  },
  {
    id: "T23",
    name: "Gobernanza IA",
    code: "L25",
    sector: 4,
    ring: 2,
    angleOff: 12,
    trl: 2,
    desc: "Marcos regulatorios y éticos para el uso responsable de IA en telecomunicaciones.",
    impact: "Regulatorio",
    horizon: "Medio (2-5 años)",
  },
  {
    id: "T24",
    name: "Blockchain Telecom",
    code: "L24",
    sector: 4,
    ring: 3,
    angleOff: -8,
    trl: 2,
    desc: "Aplicaciones de blockchain en roaming, identidad, SLA y trazabilidad en telecom.",
    impact: "Exploratorio",
    horizon: "Largo (5-8 años)",
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  return {
    x: round4(cx + r * Math.cos(toRad(angleDeg))),
    y: round4(cy + r * Math.sin(toRad(angleDeg))),
  };
}

export function getTechPosition(tech: Technology, cx: number, cy: number) {
  const sectorStart = SECTORS[tech.sector].startAngle;
  const sectorCenter = sectorStart + SECTOR_ANGLE / 2;
  const angleDeg = sectorCenter + tech.angleOff;
  let r: number;
  if (tech.ring === 0) r = RINGS[0].radius * 0.55;
  else if (tech.ring === 1) r = (RINGS[0].radius + RINGS[1].radius) / 2;
  else if (tech.ring === 2) r = (RINGS[1].radius + RINGS[2].radius) / 2;
  else r = (RINGS[2].radius + RINGS[3].radius) / 2;
  return {
    x: round4(cx + r * Math.cos(toRad(angleDeg))),
    y: round4(cy + r * Math.sin(toRad(angleDeg))),
  };
}

export function getTrlColor(trl: number): string {
  if (trl >= 7) return "#C62828";
  if (trl >= 5) return "#E65100";
  if (trl >= 3) return "#FDC300";
  return "#4FC3F7";
}

export function getTrlLabel(trl: number): string {
  if (trl >= 7) return "TRL 7-9 (Alto)";
  if (trl >= 5) return "TRL 5-6 (Medio)";
  if (trl >= 3) return "TRL 3-4 (Bajo)";
  return "TRL 1-2 (Inicial)";
}
