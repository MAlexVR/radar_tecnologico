export type ItemId = string;
export type RingId = string;
export type SectorId = string;
export type ScaleId = string;
export type LocalizedString = string | { [locale: string]: string };
export type Degrees = number;

export interface MaturityValue {
  scaleId: ScaleId;
  value: number;
}

export interface MaturityScale {
  id: ScaleId;
  label: LocalizedString;
  min: number;
  max: number;
  buckets: Array<{ rangeStart: number; rangeEnd: number; label: LocalizedString; color: string }>;
  colorFor(value: number): string;
  labelFor(value: number, locale?: string): string;
}

export interface RadarSector {
  id: SectorId;
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
  id: RingId;
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
  id: ItemId;
  name: LocalizedString;
  nameLines?: LocalizedString[];
  code?: string;
  sectorId: SectorId;
  ringId: RingId;
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
