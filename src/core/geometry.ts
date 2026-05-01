import { Degrees, RadarItem, RadarSchema } from "./types";
import { RadarSchemaError } from "./errors";

export function polarToXY(cx: number, cy: number, r: number, angleDeg: Degrees) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 10000) / 10000,
    y: Math.round((cy + r * Math.sin(rad)) * 10000) / 10000,
  };
}

export function getItemPosition(item: RadarItem, schema: RadarSchema) {
  const sector = schema.sectors.find((s) => s.id === item.sectorId);
  const ring = schema.rings.find((r) => r.id === item.ringId);
  if (!sector || !ring) {
    throw new RadarSchemaError(
      `Item ${item.id} references unknown sector ${item.sectorId} or ring ${item.ringId}`
    );
  }
  const sectorAngle = 360 / schema.sectors.length;
  const sectorStart =
    sector.startAngle ?? schema.sectors.indexOf(sector) * sectorAngle - sectorAngle / 2;
  const sectorCenter = sectorStart + sectorAngle / 2;
  const angle = sectorCenter + item.angleOff;
  const r = (ring.innerRadius + ring.outerRadius) / 2;
  const layout = schema.layout ?? {
    viewBoxWidth: 1200,
    viewBoxHeight: 1060,
    centerX: 600,
    centerY: 520,
  };
  return polarToXY(layout.centerX, layout.centerY, r, angle);
}

export function computeAllPositions(schema: RadarSchema) {
  const positions = new Map<string, { x: number; y: number }>();
  for (const item of schema.items) {
    positions.set(item.id, getItemPosition(item, schema));
  }
  return positions;
}
