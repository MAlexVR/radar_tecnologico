"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { useStore } from "zustand/react";
import type { RadarSchema, RadarEvent } from "@/core";
import { RadarProvider as CoreRadarProvider, useRadarStoreContext } from "@/core/store";
import { useRadarFilters } from "@/core/hooks";
import {
  RadarChart as DefaultRadarChart,
} from "@/components/organisms/RadarChart";
import { TechDetail } from "@/components/organisms/TechDetail";
import { NomenclatureTable } from "@/components/organisms/NomenclatureTable";
import { RadarLegend as DefaultRadarLegend } from "@/components/organisms/RadarLegend";
import { TECHNOLOGIES, RINGS, SECTORS } from "@/lib/radar-data";
import type { Technology } from "@/types/radar";

/**
 * Composable Radar primitives (Radix-style).
 *
 * Status: usable for the existing CEET radar via the store-aware
 * organisms below. Sub-components consume the RadarStoreContext
 * provided by Radar.Root. They fall back to legacy CEET data
 * when used without controlled props, so embedding remains possible.
 */

// ── Composition Context ───────────────────────────────────────

interface RadarContextValue {
  schema: RadarSchema;
  selectedItemId: string | null;
  hoveredItemId: string | null;
  onSelectItem: (id: string | null, source?: "click" | "table" | "url" | "keyboard") => void;
  onHoverItem: (id: string | null, source?: "pointer" | "keyboard") => void;
  onEvent?: (event: RadarEvent) => void;
}

const RadarContext = createContext<RadarContextValue | null>(null);

export function useRadarContext() {
  const ctx = useContext(RadarContext);
  if (!ctx) throw new Error("useRadarContext must be used within <Radar.Root>");
  return ctx;
}

// ── Root ──────────────────────────────────────────────────────

interface RadarRootProps {
  schema: RadarSchema;
  selectedItemId?: string | null;
  defaultSelectedItemId?: string | null;
  onSelectionChange?: (id: string | null) => void;
  hoveredItemId?: string | null;
  onHoverChange?: (id: string | null) => void;
  onEvent?: (event: RadarEvent) => void;
  children: React.ReactNode;
}

export function RadarRoot({
  schema,
  selectedItemId: controlledSelectedId,
  defaultSelectedItemId = null,
  onSelectionChange,
  hoveredItemId: controlledHoveredId,
  onHoverChange,
  onEvent,
  children,
}: RadarRootProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(defaultSelectedItemId);
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);

  const selectedItemId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const hoveredItemId = controlledHoveredId !== undefined ? controlledHoveredId : internalHoveredId;

  const onSelectItem = useCallback(
    (id: string | null, source: "click" | "table" | "url" | "keyboard" = "click") => {
      if (controlledSelectedId === undefined) setInternalSelectedId(id);
      onSelectionChange?.(id);
      onEvent?.({ type: "item:select", itemId: id, source });
    },
    [controlledSelectedId, onSelectionChange, onEvent],
  );

  const onHoverItem = useCallback(
    (id: string | null, source: "pointer" | "keyboard" = "pointer") => {
      if (controlledHoveredId === undefined) setInternalHoveredId(id);
      onHoverChange?.(id);
      onEvent?.({ type: "item:hover", itemId: id, source });
    },
    [controlledHoveredId, onHoverChange, onEvent],
  );

  return (
    <CoreRadarProvider schema={schema}>
      <RadarContext.Provider
        value={{
          schema,
          selectedItemId,
          hoveredItemId,
          onSelectItem,
          onHoverItem,
          onEvent,
        }}
      >
        {children}
      </RadarContext.Provider>
    </CoreRadarProvider>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function findLegacyTech(id: string | null): Technology | null {
  if (!id) return null;
  return TECHNOLOGIES.find((t) => t.id === id) ?? null;
}

// ── Chart ─────────────────────────────────────────────────────

export function RadarChart({ className }: { className?: string }) {
  const ctx = useRadarContext();
  const store = useRadarStoreContext();
  const filters = useStore(store, (s) => s.filters);

  const sectorIdToIndex = new Map(ctx.schema.sectors.map((s, i) => [s.id, i]));
  const ringIdToIndex = new Map(ctx.schema.rings.map((r, i) => [r.id, i]));

  const activeSectors =
    filters.sectors.size === 0
      ? new Set(ctx.schema.sectors.map((_, i) => i))
      : new Set(
          Array.from(filters.sectors).map((id) => sectorIdToIndex.get(id) ?? -1),
        );
  const activeRings =
    filters.rings.size === 0
      ? new Set(ctx.schema.rings.map((_, i) => i))
      : new Set(
          Array.from(filters.rings).map((id) => ringIdToIndex.get(id) ?? -1),
        );

  const filteredTechs = TECHNOLOGIES.filter(
    (t) => activeSectors.has(t.sector) && activeRings.has(t.ring),
  );

  const selected = findLegacyTech(ctx.selectedItemId);
  const hovered = findLegacyTech(ctx.hoveredItemId);

  return (
    <div className={className}>
      <DefaultRadarChart
        filteredTechs={filteredTechs}
        selectedTech={selected}
        hoveredTech={hovered}
        activeSectors={activeSectors}
        activeRings={activeRings}
        onSelect={(t) => ctx.onSelectItem(t?.id ?? null, "click")}
        onHover={(t) => ctx.onHoverItem(t?.id ?? null, "pointer")}
      />
    </div>
  );
}

// ── Filters ────────────────────────────────────────────────────

export function RadarFilters({ className }: { className?: string }) {
  const { activeSectorIds, activeRingIds, toggleSector, toggleRing } = useRadarFilters();

  return (
    <div className={className}>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase">Direccionadores</p>
        {SECTORS.map((s) => {
          const isOn =
            activeSectorIds.size === 0 || activeSectorIds.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleSector(s.id)}
              className="block text-xs"
              style={{ color: s.color, opacity: isOn ? 1 : 0.4 }}
            >
              {s.id}: {s.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-1 mt-3">
        <p className="text-xs font-bold uppercase">Fase de Adopción</p>
        {RINGS.map((r) => {
          const isOn = activeRingIds.size === 0 || activeRingIds.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => toggleRing(r.id)}
              className="block text-xs"
              style={{ color: r.labelColor, opacity: isOn ? 1 : 0.4 }}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail ────────────────────────────────────────────────────

export function RadarDetail({ className }: { className?: string }) {
  const ctx = useRadarContext();
  const tech = findLegacyTech(ctx.selectedItemId) ?? findLegacyTech(ctx.hoveredItemId);
  return (
    <div className={className}>
      <TechDetail tech={tech} />
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────

export function RadarLegend({ className }: { className?: string }) {
  return (
    <div className={className}>
      <DefaultRadarLegend />
    </div>
  );
}

// ── Nomenclature Table ────────────────────────────────────────

export function RadarNomenclatureTable({ className }: { className?: string }) {
  const ctx = useRadarContext();
  const { filteredItems } = useRadarFilters();
  const filteredTechs = filteredItems
    .map((i) => findLegacyTech(i.id))
    .filter((t): t is Technology => t !== null);
  const selected = findLegacyTech(ctx.selectedItemId);

  return (
    <div className={className}>
      <NomenclatureTable
        filteredTechs={filteredTechs}
        selectedTech={selected}
        onSelect={(t) => ctx.onSelectItem(t?.id ?? null, "table")}
      />
    </div>
  );
}

// ── Namespace export ──────────────────────────────────────────

export const Radar = {
  Root: RadarRoot,
  Chart: RadarChart,
  Filters: RadarFilters,
  Detail: RadarDetail,
  Legend: RadarLegend,
  NomenclatureTable: RadarNomenclatureTable,
};
