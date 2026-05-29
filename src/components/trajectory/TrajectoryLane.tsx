"use client";

/**
 * TrajectoryLane — one swimlane (row) in the trajectory grid.
 *
 * Desktop: a CSS Grid row with cells per horizon bucket.
 * Mobile: a native <details>/<summary> accordion (no Radix Accordion dep).
 *
 * Receives items already filtered to this layer. Renders one column cell
 * per bucket in config.horizonBuckets, showing nodes for each cell.
 *
 * No domain symbols imported.
 */

import { cn } from "@/lib/utils";
import type { TrajectoryItem } from "@/lib/trajectory";
import { useTrajectoryConfig } from "./TrajectoryProvider";
import { TrajectoryNode } from "./TrajectoryNode";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryLaneProps {
  /** The layer key this lane represents. */
  layerKey: string;
  /** Items that belong to this layer (pre-filtered by the parent). */
  items: TrajectoryItem[];
  /** Forwarded from TrajectoryMap to each node. */
  onSelect?: (item: TrajectoryItem) => void;
  /** ID of the currently selected item — used to highlight the active node. */
  selectedId?: string | null;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * One horizontal swimlane row.
 *
 * On desktop (`md+`): renders as a grid sub-row where each column aligns
 * with a horizon bucket column (grid-cols set by parent on wrapper element).
 *
 * On mobile (`< md`): wraps in a native `<details>` accordion to keep the
 * timeline scannable without horizontal overflow.
 */
export function TrajectoryLane({ layerKey, items, onSelect, selectedId, className }: TrajectoryLaneProps) {
  const config = useTrajectoryConfig();

  const layer = config.layers.find((l) => l.key === layerKey);
  const layerLabel = layer?.label ?? layerKey;

  const sortedBuckets = [...config.horizonBuckets].sort(
    (a, b) => a.order - b.order
  );

  // Group items by horizon bucket for efficient lookup
  const byBucket = new Map<string, TrajectoryItem[]>();
  for (const item of items) {
    const existing = byBucket.get(item.horizon);
    if (existing) {
      existing.push(item);
    } else {
      byBucket.set(item.horizon, [item]);
    }
  }

  const layerColor = (layer as { color?: string } & typeof layer)?.color;

  // The grid cells (one per horizon bucket) — tinted with layer color when available
  const cells = sortedBuckets.map((bucket, i) => {
    const cellItems = byBucket.get(bucket.key) ?? [];
    return (
      <div
        key={bucket.key}
        role="gridcell"
        aria-label={`${layerLabel} — ${bucket.label}`}
        className={cn(
          "min-h-[3rem] space-y-1 p-1 border-b",
          i < sortedBuckets.length - 1 && "border-r border-r-border/30"
        )}
        style={layerColor ? { backgroundColor: `${layerColor}05` } : undefined}
      >
        {cellItems.map((item) => (
          <TrajectoryNode
            key={item.id}
            item={item}
            onSelect={onSelect}
            selected={selectedId === item.id}
          />
        ))}
      </div>
    );
  });

  // ── Mobile: <details> accordion with layer color accent ──────────────────
  const mobileView = (
    <details className="md:hidden">
      <summary
        className="cursor-pointer select-none rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent"
        style={
          layerColor
            ? {
                borderLeft: `4px solid ${layerColor}`,
                color: layerColor,
              }
            : undefined
        }
      >
        {layerLabel}
        {items.length > 0 && (
          <span className="ml-2 text-xs opacity-60">
            ({items.length})
          </span>
        )}
      </summary>
      <div className="mt-1 grid grid-cols-1 gap-1 pl-2 sm:grid-cols-2">
        {items.map((item) => (
          <TrajectoryNode
            key={item.id}
            item={item}
            onSelect={onSelect}
            selected={selectedId === item.id}
          />
        ))}
      </div>
    </details>
  );

  // ── Desktop: grid row with layer color label cell ─────────────────────────
  const desktopView = (
    <div
      role="row"
      aria-label={`Capa: ${layerLabel}`}
      className={cn("hidden md:contents", className)}
    >
      {/* Lane label cell (first column) — tinted bg + left border in layer color */}
      <div
        role="rowheader"
        className="flex items-center px-2 py-2 text-xs font-semibold border-b border-r"
        style={
          layerColor
            ? {
                backgroundColor: `${layerColor}12`,
                borderLeft: `4px solid ${layerColor}`,
                color: layerColor,
              }
            : undefined
        }
      >
        {layerLabel}
      </div>
      {/* Horizon cells (tinted in cells[] above) */}
      {cells}
    </div>
  );

  return (
    <>
      {desktopView}
      {mobileView}
    </>
  );
}
