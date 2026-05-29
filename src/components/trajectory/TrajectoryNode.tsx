"use client";

/**
 * TrajectoryNode — a single cell/button in the trajectory grid.
 *
 * Presentational and data-agnostic. Reads styling/label logic from
 * TrajectoryConfig via context. The aria-label is fully descriptive so
 * screen readers don't need to infer meaning from position alone.
 *
 * No domain symbols imported here.
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TrajectoryItem } from "@/lib/trajectory";
import { useTrajectoryConfig } from "./TrajectoryProvider";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryNodeProps {
  /** The item this node represents. */
  item: TrajectoryItem;
  /** Called when the user clicks the node. */
  onSelect?: (item: TrajectoryItem) => void;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders a trajectory item as an accessible `<button>`.
 *
 * - Color and label are derived from `config.colorFor` / `config.labelFor`.
 * - Optional metric badge from `config.metricBadge`.
 * - aria-label format: "[LayerLabel] | [HorizonLabel] | [Title] | [gap?]"
 */
export function TrajectoryNode({ item, onSelect, className }: TrajectoryNodeProps) {
  const config = useTrajectoryConfig();

  // Resolve human-readable layer and horizon labels from config
  const layerLabel =
    config.layers.find((l) => l.key === item.layer)?.label ?? item.layer;
  const horizonLabel =
    config.horizonBuckets.find((h) => h.key === item.horizon)?.label ??
    item.horizon;

  const colorClass = config.colorFor(item);
  const label = config.labelFor(item);
  const badge = config.metricBadge ? config.metricBadge(item) : null;

  // Build a fully descriptive aria-label
  const ariaLabel = [
    layerLabel,
    horizonLabel,
    label,
    item.gap ? item.gap : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "group relative flex w-full flex-col items-start gap-1 rounded-md border p-2 text-left text-xs",
        "transition-all duration-150",
        "hover:shadow-md hover:ring-2 hover:ring-ring hover:ring-offset-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        colorClass,
        className
      )}
      onClick={() => onSelect?.(item)}
    >
      {/* Node title */}
      <span className="line-clamp-2 font-medium leading-snug">{label}</span>

      {/* Metric badge */}
      {badge && (
        <Badge
          variant="secondary"
          className="pointer-events-none mt-auto text-[0.65rem] leading-none"
        >
          {badge}
        </Badge>
      )}
    </button>
  );
}
