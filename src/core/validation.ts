import { z } from "zod";
import { RadarSchemaError } from "./errors";

// ── LocalizedString: string | { [locale: string]: string }
const LocalizedStringSchema = z.union([z.string(), z.record(z.string(), z.string())]);

// ── MaturityScale (JSON representation without methods)
const MaturityScaleSchema = z.object({
  id: z.string(),
  label: LocalizedStringSchema,
  min: z.number(),
  max: z.number(),
  buckets: z.array(
    z.object({
      rangeStart: z.number(),
      rangeEnd: z.number(),
      label: LocalizedStringSchema,
      color: z.string(),
    }),
  ),
});

// ── RadarSector
const RadarSectorSchema = z.object({
  id: z.string(),
  label: LocalizedStringSchema,
  shortLabel: LocalizedStringSchema.optional(),
  labelLines: z.array(LocalizedStringSchema).optional(),
  startAngle: z.number().optional(),
  color: z.string(),
  bgLight: z.string().optional(),
  bgDark: z.string().optional(),
  icon: z.string().optional(),
});

// ── RadarRing
const RadarRingSchema = z.object({
  id: z.string(),
  label: LocalizedStringSchema,
  order: z.number().int().min(0),
  innerRadius: z.number().min(0),
  outerRadius: z.number().min(0),
  color: z.string(),
  fillColor: z.string(),
  borderColor: z.string(),
  labelColor: z.string(),
  description: LocalizedStringSchema.optional(),
  recommendedAction: LocalizedStringSchema.optional(),
  maturityHint: LocalizedStringSchema.optional(),
});

// ── RadarItem
const RadarItemSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  nameLines: z.array(LocalizedStringSchema).optional(),
  code: z.string().optional(),
  sectorId: z.string(),
  ringId: z.string(),
  angleOff: z.number(),
  labelDy: z.number().optional(),
  maturity: z
    .object({
      scaleId: z.string(),
      value: z.number(),
    })
    .optional(),
  description: LocalizedStringSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ── RadarLayout
const RadarLayoutSchema = z.object({
  viewBoxWidth: z.number().positive(),
  viewBoxHeight: z.number().positive(),
  centerX: z.number(),
  centerY: z.number(),
  outerRadius: z.number().positive().optional(),
});

// ── RadarSchema (top-level)
export const RadarSchemaSchema = z.object({
  $schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  id: z.string(),
  title: LocalizedStringSchema,
  subtitle: LocalizedStringSchema.optional(),
  attribution: LocalizedStringSchema.optional(),
  rings: z.array(RadarRingSchema).min(2, "At least 2 rings required"),
  sectors: z.array(RadarSectorSchema).min(1, "At least 1 sector required"),
  items: z.array(RadarItemSchema),
  scales: z.array(MaturityScaleSchema).optional(),
  layout: RadarLayoutSchema.optional(),
  excludedItems: z
    .array(
      z.object({
        code: z.string(),
        name: LocalizedStringSchema,
        sublines: z.array(LocalizedStringSchema).optional(),
        justification: LocalizedStringSchema.optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ValidationError = {
  path: string;
  message: string;
};

export function validateSchema(input: unknown): { valid: true; data: z.infer<typeof RadarSchemaSchema> } | { valid: false; errors: ValidationError[] } {
  const result = RadarSchemaSchema.safeParse(input);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return { valid: false, errors };
}

export const SUPPORTED_SCHEMA_VERSIONS = ["1.0.0"];

export function assertSchemaVersion(version: string): void {
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(version)) {
    throw new RadarSchemaError(
      `Unsupported schema version: ${version}. Supported: ${SUPPORTED_SCHEMA_VERSIONS.join(", ")}`,
      "UNSUPPORTED_SCHEMA_VERSION",
    );
  }
}
