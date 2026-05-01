import type {
  RadarSchema,
  RadarRing,
  RadarSector,
  RadarItem,
  MaturityScale,
  IngestError,
  IngestWarning,
} from "./types";
import type { ParsedRows } from "./parser";

function parseNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = Number(val.replace(/,/g, "."));
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function parseOptionalString(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}

function generateNameLines(name: string): string[] | undefined {
  if (!name) return undefined;
  // Simple heuristic: split on " / " or " para " to match existing data pattern
  if (name.includes(" / ")) {
    const parts = name.split(" / ");
    if (parts.length === 2) {
      return [parts[0] + " /", parts[1]];
    }
  }
  if (name.includes(" para ")) {
    const idx = name.indexOf(" para ");
    return [name.slice(0, idx).trim(), "para " + name.slice(idx + 6).trim()];
  }
  if (name.includes(" (")) {
    const idx = name.indexOf(" (");
    return [name.slice(0, idx).trim(), name.slice(idx + 1).trim()];
  }
  if (name.length > 40) {
    const mid = Math.floor(name.length / 2);
    const spaceIdx = name.lastIndexOf(" ", mid);
    if (spaceIdx > 0) {
      return [name.slice(0, spaceIdx).trim(), name.slice(spaceIdx + 1).trim()];
    }
  }
  return undefined;
}

function transformRings(raw: Record<string, unknown>[], errors: IngestError[]): RadarRing[] {
  return raw
    .map((row, idx) => {
      const id = parseOptionalString(row.id);
      if (!id) {
        errors.push({ row: idx + 2, sheet: "rings", message: "Missing id" });
        return null;
      }
      return {
        id,
        label: parseOptionalString(row.label) || id,
        order: parseNumber(row.order, 0),
        innerRadius: parseNumber(row.innerRadius, 0),
        outerRadius: parseNumber(row.outerRadius, 100),
        color: parseOptionalString(row.color) || "#000000",
        fillColor: parseOptionalString(row.fillColor) || "#FFFFFF",
        borderColor: parseOptionalString(row.borderColor) || "#CCCCCC",
        labelColor: parseOptionalString(row.labelColor) || "#000000",
        description: parseOptionalString(row.description),
        recommendedAction: parseOptionalString(row.recommendedAction),
        maturityHint: parseOptionalString(row.maturityHint),
      } satisfies RadarRing;
    })
    .filter((r) => r !== null) as RadarRing[];
}

function transformSectors(raw: Record<string, unknown>[], errors: IngestError[]): RadarSector[] {
  return raw
    .map((row, idx) => {
      const id = parseOptionalString(row.id);
      if (!id) {
        errors.push({ row: idx + 2, sheet: "sectors", message: "Missing id" });
        return null;
      }
      const label = parseOptionalString(row.label) || id;
      return {
        id,
        label,
        shortLabel: parseOptionalString(row.shortLabel),
        labelLines: generateNameLines(label),
        startAngle: parseNumber(row.startAngle, 0),
        color: parseOptionalString(row.color) || "#000000",
        bgLight: parseOptionalString(row.bgLight),
        bgDark: parseOptionalString(row.bgDark),
        icon: parseOptionalString(row.icon),
      } satisfies RadarSector;
    })
    .filter((s) => s !== null) as RadarSector[];
}

function transformItems(raw: Record<string, unknown>[], errors: IngestError[]): RadarItem[] {
  return raw
    .map((row, idx) => {
      const id = parseOptionalString(row.id);
      if (!id) {
        errors.push({ row: idx + 2, sheet: "items", message: "Missing id" });
        return null;
      }
      const name = parseOptionalString(row.name) || id;
      const trlValue = parseNumber(row.trlValue, 0);
      const impact = parseOptionalString(row.impact);
      const horizon = parseOptionalString(row.horizon);
      const metadata: Record<string, unknown> = {};
      if (impact) metadata.impact = impact;
      if (horizon) metadata.horizon = horizon;

      return {
        id,
        name,
        nameLines: generateNameLines(name),
        code: parseOptionalString(row.code),
        sectorId: parseOptionalString(row.sectorId) || "",
        ringId: parseOptionalString(row.ringId) || "",
        angleOff: parseNumber(row.angleOff, 0),
        maturity: { scaleId: "trl", value: trlValue },
        description: parseOptionalString(row.description),
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      } satisfies RadarItem;
    })
    .filter((i) => i !== null) as RadarItem[];
}

function generateTrlScale(items: RadarItem[]): MaturityScale[] {
  const values = items.map((i) => i.maturity?.value ?? 0);
  const min = values.length > 0 ? Math.min(...values) : 1;
  const max = values.length > 0 ? Math.max(...values) : 9;

  return [
    {
      id: "trl",
      label: "TRL — Technology Readiness Level",
      min: 1,
      max: 9,
      buckets: [
        { rangeStart: 1, rangeEnd: 2, label: "TRL 1-2 (Inicial)", color: "#4FC3F7" },
        { rangeStart: 3, rangeEnd: 4, label: "TRL 3-4 (Bajo)", color: "#FDC300" },
        { rangeStart: 5, rangeEnd: 6, label: "TRL 5-6 (Medio)", color: "#E65100" },
        { rangeStart: 7, rangeEnd: 9, label: "TRL 7-9 (Alto)", color: "#C62828" },
      ],
    },
  ];
}

export interface TransformResult {
  schema: RadarSchema;
  errors: IngestError[];
  warnings: IngestWarning[];
}

export function transform(parsed: ParsedRows): TransformResult {
  const errors: IngestError[] = [...parsed.errors];
  const warnings: IngestWarning[] = [...parsed.warnings];

  const rings = transformRings(parsed.rings, errors);
  const sectors = transformSectors(parsed.sectors, errors);
  const items = transformItems(parsed.items, errors);

  // Validation cross-references
  const ringIds = new Set(rings.map((r) => r.id));
  const sectorIds = new Set(sectors.map((s) => s.id));

  items.forEach((item, idx) => {
    if (item.ringId && !ringIds.has(item.ringId)) {
      warnings.push({
        row: idx + 2,
        sheet: "items",
        message: `Item references unknown ringId: ${item.ringId}`,
      });
    }
    if (item.sectorId && !sectorIds.has(item.sectorId)) {
      warnings.push({
        row: idx + 2,
        sheet: "items",
        message: `Item references unknown sectorId: ${item.sectorId}`,
      });
    }
  });

  const schema: RadarSchema = {
    $schemaVersion: "1.0.0",
    id: "generated-radar",
    title: "Radar Tecnológico",
    rings,
    sectors,
    items,
    scales: generateTrlScale(items),
    layout: {
      viewBoxWidth: 1200,
      viewBoxHeight: 1060,
      centerX: 600,
      centerY: 520,
      outerRadius: 400,
    },
  };

  return { schema, errors, warnings };
}
