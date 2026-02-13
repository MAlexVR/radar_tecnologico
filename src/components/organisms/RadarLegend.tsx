"use client";

import { RINGS, SECTORS } from "@/lib/radar-data";
import { Gauge } from "lucide-react";

export function RadarLegend() {
  return (
    <div className="border rounded-xl bg-white dark:bg-card p-4 space-y-4 text-sm">
      {/* Anillos section */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground/80 mb-2.5">
          Anillos (fase de adopción CEET)
        </h4>
        <div className="space-y-1.5">
          {RINGS.map((ring) => (
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
          {SECTORS.map((sector) => (
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

      {/* TRL Bar (Temperature) */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Gauge className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Nivel de TRL
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#4FC3F7] via-[#FDC300] via-[#E65100] to-[#C62828] mb-1.5" />
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>Inicial (1-2)</span>
          <span>Alto (7-9)</span>
        </div>
      </div>
    </div>
  );
}
