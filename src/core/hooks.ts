import { useStore } from "zustand/react";
import { useRadarStoreContext } from "./store";
import { getItemPosition } from "./geometry";

export function useRadarSchema() {
  const store = useRadarStoreContext();
  return useStore(store, (state) => state.schema);
}

export function useRadarSelection() {
  const store = useRadarStoreContext();
  const schema = useStore(store, (state) => state.schema);
  const selectedItemId = useStore(store, (state) => state.selectedItemId);
  const hoveredItemId = useStore(store, (state) => state.hoveredItemId);
  const selectItem = useStore(store, (state) => state.selectItem);
  const hoverItem = useStore(store, (state) => state.hoverItem);

  const selectedItem =
    selectedItemId != null
      ? (schema.items.find((i) => i.id === selectedItemId) ?? null)
      : null;

  const hoveredItem =
    hoveredItemId != null
      ? (schema.items.find((i) => i.id === hoveredItemId) ?? null)
      : null;

  return { selectedItem, selectItem, hoveredItem, hoverItem };
}

export function useRadarFilters() {
  const store = useRadarStoreContext();
  const schema = useStore(store, (state) => state.schema);
  const filters = useStore(store, (state) => state.filters);
  const toggleSector = useStore(store, (state) => state.toggleSector);
  const toggleRing = useStore(store, (state) => state.toggleRing);

  const filteredItems = schema.items.filter((item) => {
    const sectorActive =
      filters.sectors.size === 0 || filters.sectors.has(item.sectorId);
    const ringActive =
      filters.rings.size === 0 || filters.rings.has(item.ringId);
    return sectorActive && ringActive;
  });

  return {
    activeSectorIds: filters.sectors,
    activeRingIds: filters.rings,
    toggleSector,
    toggleRing,
    filteredItems,
  };
}

export function useRadarViewport() {
  const store = useRadarStoreContext();
  const zoom = useStore(store, (state) => state.zoom);
  const pan = useStore(store, (state) => state.pan);
  const setZoom = useStore(store, (state) => state.setZoom);
  const setPan = useStore(store, (state) => state.setPan);
  const resetView = useStore(store, (state) => state.resetView);

  return { zoom, pan, setZoom, setPan, resetView };
}

export function useRadarItemPosition(itemId: string): { x: number; y: number } {
  const store = useRadarStoreContext();
  const schema = useStore(store, (state) => state.schema);
  const item = schema.items.find((i) => i.id === itemId);

  if (!item) {
    throw new Error(
      `useRadarItemPosition: item "${itemId}" not found in schema`
    );
  }

  return getItemPosition(item, schema);
}
