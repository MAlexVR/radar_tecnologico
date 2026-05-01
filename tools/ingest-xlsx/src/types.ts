export interface IngestOptions {
  input: string;  // path to xlsx
  output: string; // path to json
  verbose?: boolean;
}

export interface IngestError {
  row: number;
  sheet: string;
  message: string;
}

export interface IngestWarning {
  row: number;
  sheet: string;
  message: string;
}

export interface IngestReport {
  success: boolean;
  itemsProcessed: number;
  ringsProcessed: number;
  sectorsProcessed: number;
  errors: IngestError[];
  warnings: IngestWarning[];
}

// Minimal re-declarations of core schema types (path aliases don't resolve from tools/)
// These mirror src/core/types.ts exactly.

export type LocalizedString = string | { [locale: string]: string };
export type Degrees = number;

export interface MaturityValue {
  scaleId: string;
  value: number;
}

export interface MaturityScale {
  id: string;
  label: LocalizedString;
  min: number;
  max: number;
  buckets: Array<{ rangeStart: number; rangeEnd: number; label: LocalizedString; color: string }>;
}

export interface RadarSector {
  id: string;
  label: LocalizedString;
  shortLabel?: LocalizedString;
  labelLines?: LocalizedString[];
  startAngle?: Degrees;
  color: string;
  bgLight?: string;
  bgDark?: string;
  icon?: string;
}

export interface RadarRing {
  id: string;
  label: LocalizedString;
  order: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
  fillColor: string;
  borderColor: string;
  labelColor: string;
  description?: LocalizedString;
  recommendedAction?: LocalizedString;
  maturityHint?: LocalizedString;
}

export interface RadarItem {
  id: string;
  name: LocalizedString;
  nameLines?: LocalizedString[];
  code?: string;
  sectorId: string;
  ringId: string;
  angleOff: Degrees;
  labelDy?: number;
  maturity?: MaturityValue;
  description?: LocalizedString;
  metadata?: Record<string, unknown>;
}

export interface RadarLayout {
  viewBoxWidth: number;
  viewBoxHeight: number;
  centerX: number;
  centerY: number;
  outerRadius?: number;
}

export interface RadarSchema {
  $schemaVersion: string;
  id: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  attribution?: LocalizedString;
  rings: RadarRing[];
  sectors: RadarSector[];
  items: RadarItem[];
  scales?: MaturityScale[];
  layout?: RadarLayout;
  excludedItems?: Array<{ code: string; name: LocalizedString; sublines?: LocalizedString[]; justification?: LocalizedString }>;
  metadata?: Record<string, unknown>;
}
