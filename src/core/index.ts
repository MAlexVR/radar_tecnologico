export type {
  RadarSchema,
  RadarItem,
  RadarRing,
  RadarSector,
  MaturityScale,
  MaturityValue,
  RadarLayout,
  ItemId,
  RingId,
  SectorId,
  ScaleId,
  LocalizedString,
  Degrees,
} from "./types";
export { RadarSchemaError } from "./errors";
export { polarToXY, getItemPosition, computeAllPositions } from "./geometry";
export {
  createRadarStore,
  RadarProvider,
  useRadarStoreContext,
  RadarStoreContext,
} from "./store";
export {
  useRadarSchema,
  useRadarSelection,
  useRadarFilters,
  useRadarViewport,
  useRadarItemPosition,
} from "./hooks";

// ── Validation & Migrations ───────────────────────────────────
export {
  validateSchema,
  assertSchemaVersion,
  SUPPORTED_SCHEMA_VERSIONS,
} from "./validation";
export type { ValidationError } from "./validation";
export { migrateSchema } from "./migrations";

// ── Filters ───────────────────────────────────────────────────
export { applyFilters, buildFullFilterState } from "./filters";
export type { FilterState } from "./filters";

// ── Maturity Scales ───────────────────────────────────────────
export {
  TRL,
  NPS,
  registerScale,
  getScale,
  resolveMaturityColor,
  resolveMaturityLabel,
} from "./maturity";

// ── Export (PNG/SVG, no PDF) ──────────────────────────────────
export { svgToCanvas, exportPNG, exportSVG } from "./export";
export type { ExportPngOptions } from "./export";

// ── Events / Telemetry ────────────────────────────────────────
export type { RadarEvent, RadarEventHandler } from "./events";
export { noopEventHandler } from "./events";
