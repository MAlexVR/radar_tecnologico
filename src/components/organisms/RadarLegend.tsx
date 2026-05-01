"use client";

import { useContext } from "react";
import { useStore } from "zustand/react";
import { RINGS, SECTORS } from "@/lib/radar-data";
import { RadarStoreContext } from "@/core/store";
import type { RadarRing, RadarSector } from "@/core";
import type { Ring, Sector } from "@/types/radar";

/* ── Conversion helpers ─────────────────────────────────────── */

function convertRing(r: RadarRing): Ring {
  return {
    id: r.id,
    label: r.label as string,
    radius: r.outerRadius,
    color: r.color,
    fillColor: r.fillColor,
    borderColor: r.borderColor,
    labelColor: r.labelColor,
    desc: (r.description as string) ?? "",
    trl: (r.maturityHint as string) ?? "",
    recommendedAction: (r.recommendedAction as string) ?? "",
  };
}

function convertSector(s: RadarSector): Sector {
  return {
    id: s.id,
    label: s.label as string,
    shortLabel: (s.shortLabel as string) ?? (s.label as string),
    labelLines: s.labelLines as string[] | undefined,
    startAngle: s.startAngle ?? 0,
    color: s.color,
    bgLight: s.bgLight ?? "",
    bgDark: s.bgDark ?? "",
    icon: s.icon ?? "",
  };
}

/* ── Shared render ──────────────────────────────────────────── */

interface RadarLegendRenderProps {
  rings: Ring[];
  sectors: Sector[];
}

function RadarLegendRender({ rings, sectors }: RadarLegendRenderProps) {
  return (
    <div className="border rounded-xl bg-card p-4 space-y-4 text-sm">
      {/* Anillos section */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground/80 mb-2.5">
          Anillos (fase de adopción CEET)
        </h4>
        <div className="space-y-1.5">
          {rings.map((ring) => (
            <div key={ring.id} className="flex items-center gap-3">
              <span
                className="w-6 h-4 rounded-sm flex-shrink-0 border"
                style={{
                  backgroundColor: ring.fillColor,
                  borderColor: ring.borderColor,
                }}
              />
              <span className="text-xs">
                <strong style={{ color: ring.labelColor }}>{ring.label}</strong>
                <span className="text-muted-foreground"> — {ring.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sectores section */}
      <div className="border-t pt-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground/80 mb-2.5">
          Sectores (Direccionadores)
        </h4>
        <div className="space-y-1.5">
          {sectors.map((sector) => (
            <div key={sector.id} className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: sector.color }}
              />
              <span className="text-xs">
                <strong style={{ color: sector.color }}>{sector.id}:</strong>{" "}
                <span className="text-muted-foreground">{sector.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Prop-based implementation ──────────────────────────────── */

interface RadarLegendProps {
  rings?: Ring[];
  sectors?: Sector[];
}

function RadarLegendPropsImpl({ rings, sectors }: Required<RadarLegendProps>) {
  return <RadarLegendRender rings={rings} sectors={sectors} />;
}

/* ── Store-based implementation ─────────────────────────────── */

function RadarLegendStoreImpl() {
  const store = useContext(RadarStoreContext);
  const schema = useStore(store!, (state) => state.schema);

  const rings = schema.rings
    .sort((a, b) => a.order - b.order)
    .map(convertRing);
  const sectors = schema.sectors.map(convertSector);

  return <RadarLegendRender rings={rings} sectors={sectors} />;
}

/* ── Public component ───────────────────────────────────────── */

export function RadarLegend({ rings, sectors }: RadarLegendProps = {}) {
  const store = useContext(RadarStoreContext);

  if (rings && sectors) {
    return <RadarLegendPropsImpl rings={rings} sectors={sectors} />;
  }

  if (store) {
    return <RadarLegendStoreImpl />;
  }

  return <RadarLegendRender rings={RINGS} sectors={SECTORS} />;
}
