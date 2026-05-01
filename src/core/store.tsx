import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand/react";
import { createContext, useContext, useRef, type ReactNode } from "react";
import type { RadarSchema, MaturityScale } from "./types";
import { TRL, NPS } from "./maturity";

/* ── State & Actions ───────────────────────────────────────── */

export interface RadarState {
  schema: RadarSchema;
  selectedItemId: string | null;
  hoveredItemId: string | null;
  filters: {
    sectors: Set<string>;
    rings: Set<string>;
  };
  zoom: number;
  pan: { x: number; y: number };
  scales: Map<string, MaturityScale>;
}

export interface RadarActions {
  selectItem: (id: string | null) => void;
  hoverItem: (id: string | null) => void;
  toggleSector: (id: string) => void;
  toggleRing: (id: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetView: () => void;
  registerScale: (scale: MaturityScale) => void;
  getScale: (id: string) => MaturityScale | undefined;
}

export type RadarStore = RadarState & RadarActions;

/* ── Factory ───────────────────────────────────────────────── */

export function createRadarStore(schema: RadarSchema): StoreApi<RadarStore> {
  const initialScales = new Map<string, MaturityScale>();
  initialScales.set(TRL.id, TRL);
  initialScales.set(NPS.id, NPS);

  return createStore<RadarStore>((set, get) => ({
    schema,
    selectedItemId: null,
    hoveredItemId: null,
    filters: {
      sectors: new Set<string>(),
      rings: new Set<string>(),
    },
    zoom: 1,
    pan: { x: 0, y: 0 },
    scales: initialScales,

    selectItem: (id) => set({ selectedItemId: id }),
    hoverItem: (id) => set({ hoveredItemId: id }),

    toggleSector: (id) =>
      set((state) => {
        const next = new Set(state.filters.sectors);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { filters: { ...state.filters, sectors: next } };
      }),

    toggleRing: (id) =>
      set((state) => {
        const next = new Set(state.filters.rings);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { filters: { ...state.filters, rings: next } };
      }),

    setZoom: (zoom) => set({ zoom }),
    setPan: (pan) => set({ pan }),

    resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 }, selectedItemId: null, hoveredItemId: null }),

    registerScale: (scale) =>
      set((state) => {
        const next = new Map(state.scales);
        next.set(scale.id, scale);
        return { scales: next };
      }),

    getScale: (id) => get().scales.get(id),
  }));
}

/* ── React Context Provider ────────────────────────────────── */

export const RadarStoreContext = createContext<StoreApi<RadarStore> | null>(null);

export interface RadarProviderProps {
  schema: RadarSchema;
  children: ReactNode;
}

export function RadarProvider({ schema, children }: RadarProviderProps) {
  const storeRef = useRef<StoreApi<RadarStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createRadarStore(schema);
  }
  return (
    <RadarStoreContext.Provider value={storeRef.current}>
      {children}
    </RadarStoreContext.Provider>
  );
}

export function useRadarStoreContext(): StoreApi<RadarStore> {
  const store = useContext(RadarStoreContext);
  if (!store) {
    throw new Error(
      "useRadarStoreContext must be used within a RadarProvider"
    );
  }
  return store;
}
