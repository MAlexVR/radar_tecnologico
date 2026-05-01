"use client";

import { Separator } from "@/components/ui/separator";
import { SECTORS, RINGS, TECHNOLOGIES } from "@/lib/radar-data";
import type { ActiveFilters } from "@/types/radar";
import { Filter, Gauge } from "lucide-react";

interface MobileFiltersProps {
  filters: ActiveFilters;
  toggleSector: (i: number) => void;
  toggleRing: (i: number) => void;
  filteredCount: number;
}

export function MobileFilters({
  filters,
  toggleSector,
  toggleRing,
  filteredCount,
}: MobileFiltersProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Sector chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Direccionadores
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((s, i) => {
            const isOn = filters.sectors.has(i);
            return (
              <button
                key={s.id}
                onClick={() => toggleSector(i)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all border shadow-sm ${
                  isOn
                    ? "border-current bg-background"
                    : "border-transparent bg-muted opacity-50"
                }`}
                style={{
                  color: s.color,
                  borderColor: isOn ? s.color : undefined,
                }}
              >
                <span>{s.icon}</span>
                {s.id}: {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Ring chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
          Fase de Adopción
        </span>
        <div className="flex flex-wrap gap-1.5">
          {RINGS.map((r, i) => {
            const isOn = filters.rings.has(i);
            return (
              <button
                key={r.id}
                onClick={() => toggleRing(i)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all border shadow-sm ${
                  isOn ? "border-border bg-background" : "border-transparent bg-muted/50 opacity-50"
                }`}
              >
                <span
                  className="w-3 h-2 rounded-sm border"
                  style={{
                    backgroundColor: r.fillColor,
                    borderColor: r.borderColor,
                  }}
                />
                {r.label}
                <span className="text-[9px] text-muted-foreground ml-1">({r.trl})</span>
              </button>
            );
          })}
          <span className="text-[10px] text-muted-foreground self-center ml-auto">
            {filteredCount} / {TECHNOLOGIES.length}
          </span>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* TRL Bar */}
      <div className="rounded-lg bg-muted/40 p-3 border">
        <div className="flex items-center gap-1.5 mb-2">
          <Gauge className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Nivel de TRL
          </span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-[#4FC3F7] via-[#FDC300] via-[#E65100] to-[#C62828] mb-1.5" />
        <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
          <span>Inicial (1-2)</span>
          <span>Alto (7-9)</span>
        </div>
      </div>
    </div>
  );
}
