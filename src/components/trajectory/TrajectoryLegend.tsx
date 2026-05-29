"use client";

/**
 * TrajectoryLegend — visual legend derived from TrajectoryConfig.
 *
 * Renders two sections:
 *   1. Layers / swimlanes (label, icon if present)
 *   2. Common gap/state color samples — extracted by calling colorFor
 *      with a representative item for each layer.
 *
 * Fully data-agnostic — no domain symbols imported.
 */

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TrajectoryConfig, TrajectoryItem } from "@/lib/trajectory";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryLegendProps {
  config: TrajectoryConfig;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Legend component showing layers and their associated colors.
 * Colors are sampled by calling `config.colorFor` with a synthetic
 * representative item per layer (horizon = "ahora", no gap by default).
 */
export function TrajectoryLegend({ config, className }: TrajectoryLegendProps) {
  const sortedLayers = [...config.layers].sort((a, b) => a.order - b.order);

  return (
    <aside
      aria-label="Leyenda del mapa de trayectoria"
      className={cn("space-y-4 text-sm", className)}
    >
      {/* Layers section */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Capas
        </h4>
        <ul className="space-y-1.5" role="list">
          {sortedLayers.map((layer) => {
            // Build a representative item to sample the color
            const sample: TrajectoryItem = {
              id: `__legend-${layer.key}`,
              layer: layer.key,
              driver: config.drivers[0]?.key ?? "",
              horizon: "ahora",
              title: layer.label,
              detail: "",
            };
            const colorClass = config.colorFor(sample);

            return (
              <li key={layer.key} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-3 w-3 shrink-0 rounded-sm border",
                    colorClass
                  )}
                />
                <span className="text-xs">{layer.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator />

      {/* Horizon buckets section */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Horizonte
        </h4>
        <ul className="space-y-1.5" role="list">
          {[...config.horizonBuckets]
            .sort((a, b) => a.order - b.order)
            .map((bucket) => (
              <li key={bucket.key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {bucket.order}.
                </span>
                <span className="text-xs">{bucket.label}</span>
              </li>
            ))}
        </ul>
      </section>
    </aside>
  );
}
