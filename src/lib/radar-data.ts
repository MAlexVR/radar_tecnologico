import schemaJson from "../../public/data/ceet-telecom.json";
import type { RadarSchema } from "@/core";
import type { Ring, Sector, Technology } from "@/types/radar";

// ═══════════════════════════════════════════════════════════════
// NEW: Parsed v5 schema
// ═══════════════════════════════════════════════════════════════
export const schema: RadarSchema = schemaJson as unknown as RadarSchema;

// ═══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY: Old-format exports
// All existing components import these symbols.
// ═══════════════════════════════════════════════════════════════

const RING_ORDER = ["adopt", "trial", "assess", "monitor"];
const SECTOR_ORDER = ["D1", "D2", "D3", "D4", "D5"];

export const RINGS: Ring[] = [...schema.rings]
  .sort((a, b) => a.order - b.order)
  .map((r) => ({
    id: r.id,
    label: r.label as string,
    radius: r.outerRadius,
    color: r.color,
    fillColor: r.fillColor,
    borderColor: r.borderColor,
    labelColor: r.labelColor,
    desc: (r.description as string) ?? "",
    trl: (r.maturityHint as string) ?? "",
    recommendedAction: (r.recommendedAction as string) ?? "",
  }));

export const SECTORS: Sector[] = schema.sectors.map((s) => ({
  id: s.id,
  label: s.label as string,
  shortLabel: (s.shortLabel as string) ?? (s.label as string),
  labelLines: s.labelLines as string[] | undefined,
  startAngle: s.startAngle ?? 0,
  color: s.color,
  bgLight: s.bgLight ?? "",
  bgDark: s.bgDark ?? "",
  icon: s.icon ?? "",
}));

export const TECHNOLOGIES: Technology[] = schema.items.map((item) => {
  const sectorIndex = SECTOR_ORDER.indexOf(item.sectorId);
  const ringIndex = RING_ORDER.indexOf(item.ringId);
  return {
    id: item.id,
    name: item.name as string,
    nameLines: item.nameLines as string[] | undefined,
    code: item.code ?? "",
    sector: sectorIndex,
    ring: ringIndex,
    angleOff: item.angleOff,
    labelDy: item.labelDy,
    trl: item.maturity?.value ?? 0,
    desc: (item.description as string) ?? "",
    impact: (item.metadata?.impact as string) ?? "",
    horizon: (item.metadata?.horizon as string) ?? "",
  };
});

export const SECTOR_ANGLE = 72;

export const RADAR_LAYOUT = {
  viewBoxWidth: schema.layout?.viewBoxWidth ?? 1200,
  viewBoxHeight: schema.layout?.viewBoxHeight ?? 1060,
  centerX: schema.layout?.centerX ?? 600,
  centerY: schema.layout?.centerY ?? 520,
} as const;

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

export const TRL_THRESHOLDS = [
  { min: 7, color: "#C62828", label: "TRL 7-9 (Alto)" },
  { min: 5, color: "#E65100", label: "TRL 5-6 (Medio)" },
  { min: 3, color: "#FDC300", label: "TRL 3-4 (Bajo)" },
  { min: 1, color: "#4FC3F7", label: "TRL 1-2 (Inicial)" },
];

export function getTrlColor(
  trl: number,
  thresholds = TRL_THRESHOLDS,
): string {
  const bucket = thresholds.find((t) => trl >= t.min);
  return bucket?.color ?? thresholds[thresholds.length - 1].color;
}

export function getTrlLabel(
  trl: number,
  thresholds = TRL_THRESHOLDS,
): string {
  const bucket = thresholds.find((t) => trl >= t.min);
  return bucket?.label ?? thresholds[thresholds.length - 1].label;
}

// ═══════════════════════════════════════════════════════════════
// EXCLUDED TECHNOLOGIES (Not mapped on radar)
// ═══════════════════════════════════════════════════════════════
export const EXCLUDED_TECHNOLOGIES =
  schema.excludedItems?.map((e) => ({
    code: e.code,
    name: e.name as string,
    sublines: e.sublines as string[] | undefined,
    justification: (e.justification as string) ?? "",
  })) ?? [];
