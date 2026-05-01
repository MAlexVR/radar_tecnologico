import type { MaturityScale, MaturityValue, LocalizedString } from "../types";

// ── TRL Scale (Technology Readiness Level) ────────────────────

export const TRL: MaturityScale = {
  id: "trl",
  label: "Technology Readiness Level" as LocalizedString,
  min: 1,
  max: 9,
  buckets: [
    { rangeStart: 1, rangeEnd: 2, label: "TRL 1-2 (Inicial)" as LocalizedString, color: "#4FC3F7" },
    { rangeStart: 3, rangeEnd: 4, label: "TRL 3-4 (Bajo)" as LocalizedString, color: "#FDC300" },
    { rangeStart: 5, rangeEnd: 6, label: "TRL 5-6 (Medio)" as LocalizedString, color: "#E65100" },
    { rangeStart: 7, rangeEnd: 9, label: "TRL 7-9 (Alto)" as LocalizedString, color: "#C62828" },
  ],
  colorFor(value: number): string {
    const bucket = this.buckets.find((b) => value >= b.rangeStart && value <= b.rangeEnd);
    return bucket?.color ?? this.buckets[this.buckets.length - 1].color;
  },
  labelFor(value: number): string {
    const bucket = this.buckets.find((b) => value >= b.rangeStart && value <= b.rangeEnd);
    const label = bucket?.label ?? this.buckets[this.buckets.length - 1].label;
    return typeof label === "string" ? label : label["es"] ?? JSON.stringify(label);
  },
};

// ── NPS Scale (example secondary scale) ───────────────────────

export const NPS: MaturityScale = {
  id: "nps",
  label: "Net Promoter Score" as LocalizedString,
  min: -100,
  max: 100,
  buckets: [
    { rangeStart: -100, rangeEnd: 0, label: "Detractor" as LocalizedString, color: "#C62828" },
    { rangeStart: 1, rangeEnd: 30, label: "Passive" as LocalizedString, color: "#FDC300" },
    { rangeStart: 31, rangeEnd: 100, label: "Promoter" as LocalizedString, color: "#2E7D32" },
  ],
  colorFor(value: number): string {
    const bucket = this.buckets.find((b) => value >= b.rangeStart && value <= b.rangeEnd);
    return bucket?.color ?? this.buckets[0].color;
  },
  labelFor(value: number): string {
    const bucket = this.buckets.find((b) => value >= b.rangeStart && value <= b.rangeEnd);
    const label = bucket?.label ?? this.buckets[0].label;
    return typeof label === "string" ? label : label["es"] ?? JSON.stringify(label);
  },
};

// ── Registry helpers (operate on a per-instance Map) ──────────

export function registerScale(registry: Map<string, MaturityScale>, scale: MaturityScale): void {
  registry.set(scale.id, scale);
}

export function getScale(registry: Map<string, MaturityScale>, id: string): MaturityScale | undefined {
  return registry.get(id);
}

// ── Resolve color/label from MaturityValue ────────────────────

export function resolveMaturityColor(
  maturity: MaturityValue,
  registry: Map<string, MaturityScale>,
): string {
  const scale = getScale(registry, maturity.scaleId);
  if (!scale) return "#9e9e9e";
  return scale.colorFor(maturity.value);
}

export function resolveMaturityLabel(
  maturity: MaturityValue,
  registry: Map<string, MaturityScale>,
): string {
  const scale = getScale(registry, maturity.scaleId);
  if (!scale) return `Unknown scale: ${maturity.scaleId}`;
  return scale.labelFor(maturity.value);
}
