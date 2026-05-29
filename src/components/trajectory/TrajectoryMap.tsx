"use client";

/**
 * TrajectoryMap — main composition component.
 *
 * Orchestrates:
 *   - Driver selector with Radix Tabs
 *   - CSS Grid of swimlane × horizon-bucket
 *   - Column headers (horizon buckets)
 *   - TrajectoryLane per layer
 *   - TrajectoryLegend sidebar
 *   - Empty state when driver has no items
 *
 * Props: { config, dataset, onSelect? }
 * Internally wraps itself with <TrajectoryProvider> so child components
 * can access config via context without prop-drilling.
 *
 * No domain symbols imported.
 */

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TrajectoryConfig, TrajectoryDataset, TrajectoryItem } from "@/lib/trajectory";
import { byDriver, byLayer } from "@/lib/trajectory";
import { TrajectoryProvider } from "./TrajectoryProvider";
import { TrajectoryLane } from "./TrajectoryLane";
import { TrajectoryLegend } from "./TrajectoryLegend";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryMapProps {
  /** Trajectory configuration (drivers, layers, horizons, color/label fns). */
  config: TrajectoryConfig;
  /** The dataset to visualize. */
  dataset: TrajectoryDataset;
  /** Called when the user clicks a node. */
  onSelect?: (item: TrajectoryItem) => void;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Root component of the trajectory map UI.
 *
 * Renders a driver tab per config.drivers entry.
 * Within each tab, renders one TrajectoryLane per layer (ordered by layer.order).
 * The grid is a CSS Grid with `1 + horizonBuckets.length` columns:
 *   col 0 = lane label, col 1..N = horizon buckets.
 */
export function TrajectoryMap({
  config,
  dataset,
  onSelect,
  className,
}: TrajectoryMapProps) {
  const sortedDrivers = config.drivers; // order preserved from config
  const [activeDriver, setActiveDriver] = useState(sortedDrivers[0]?.key ?? "");

  const sortedLayers = [...config.layers].sort((a, b) => a.order - b.order);
  const sortedBuckets = [...config.horizonBuckets].sort(
    (a, b) => a.order - b.order
  );

  // Number of columns: 1 label column + N horizon bucket columns
  const gridCols = 1 + sortedBuckets.length;

  return (
    <TrajectoryProvider config={config}>
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Driver selector */}
        <Tabs
          value={activeDriver}
          onValueChange={setActiveDriver}
          className="w-full"
        >
          <TabsList className="w-full flex-wrap justify-start h-auto gap-1">
            {sortedDrivers.map((driver) => (
              <TabsTrigger key={driver.key} value={driver.key}>
                {driver.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {sortedDrivers.map((driver) => {
            const driverItems = byDriver(dataset.items, driver.key);
            const layerMap = byLayer(driverItems);
            const isEmpty = driverItems.length === 0;

            return (
              <TabsContent key={driver.key} value={driver.key}>
                <div className="flex gap-4">
                  {/* Main grid */}
                  <div className="flex-1 overflow-x-auto">
                    {isEmpty ? (
                      // Empty state
                      <div
                        data-testid="trajectory-empty-state"
                        className="flex min-h-[12rem] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
                      >
                        No hay ítems para este driver.
                      </div>
                    ) : (
                      <>
                        {/* Desktop grid */}
                        <div
                          role="grid"
                          aria-label={`Mapa de trayectoria — ${driver.label}`}
                          className="hidden md:grid"
                          style={{
                            gridTemplateColumns: `minmax(6rem, 10rem) repeat(${sortedBuckets.length}, minmax(8rem, 1fr))`,
                          }}
                        >
                          {/* Column headers row */}
                          <div
                            role="row"
                            className="contents"
                          >
                            {/* Corner cell: layer label column header */}
                            <div
                              role="columnheader"
                              className="border-b px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                            >
                              <span className="sr-only">Capa</span>
                            </div>
                            {sortedBuckets.map((bucket) => (
                              <div
                                key={bucket.key}
                                role="columnheader"
                                className="border-b px-2 py-1.5 text-center text-xs font-semibold"
                              >
                                {bucket.label}
                              </div>
                            ))}
                          </div>

                          {/* One lane per layer */}
                          {sortedLayers.map((layer) => {
                            const laneItems = layerMap.get(layer.key) ?? [];
                            return (
                              <TrajectoryLane
                                key={layer.key}
                                layerKey={layer.key}
                                items={laneItems}
                                onSelect={onSelect}
                              />
                            );
                          })}
                        </div>

                        {/* Mobile accordion view */}
                        <div className="flex flex-col gap-1 md:hidden">
                          {sortedLayers.map((layer) => {
                            const laneItems = layerMap.get(layer.key) ?? [];
                            return (
                              <TrajectoryLane
                                key={layer.key}
                                layerKey={layer.key}
                                items={laneItems}
                                onSelect={onSelect}
                              />
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Legend sidebar (desktop only) */}
                  <Separator orientation="vertical" className="hidden md:block" />
                  <TrajectoryLegend
                    config={config}
                    className="hidden md:block w-40 shrink-0"
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </TrajectoryProvider>
  );
}

