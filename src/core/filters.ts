import type { RadarSchema, RadarItem, SectorId, RingId } from "./types";

export interface FilterState {
  sectors: Set<SectorId>;
  rings: Set<RingId>;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  sectors: new Set(),
  rings: new Set(),
};

/**
 * Apply filters to a list of items.
 * If a filter set is empty, all items pass for that dimension.
 */
export function applyFilters(
  items: RadarItem[],
  filters: FilterState,
): RadarItem[] {
  return items.filter((item) => {
    const sectorMatch =
      filters.sectors.size === 0 || filters.sectors.has(item.sectorId);
    const ringMatch =
      filters.rings.size === 0 || filters.rings.has(item.ringId);
    return sectorMatch && ringMatch;
  });
}

/**
 * Build a FilterState from a schema that includes ALL sectors and rings.
 * Useful for initializing filters to "everything active".
 */
export function buildFullFilterState(schema: RadarSchema): FilterState {
  return {
    sectors: new Set(schema.sectors.map((s: { id: string }) => s.id)),
    rings: new Set(schema.rings.map((r: { id: string }) => r.id)),
  };
}
