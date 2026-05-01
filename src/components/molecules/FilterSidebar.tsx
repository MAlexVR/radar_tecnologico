"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Gauge, FileImage, FileText } from "lucide-react";
import { RINGS, SECTORS, TECHNOLOGIES } from "@/lib/radar-data";
import { RadarLegend } from "@/components/organisms/RadarLegend";
import type { ActiveFilters } from "@/types/radar";

interface FilterSidebarProps {
  filters: ActiveFilters;
  toggleSector: (i: number) => void;
  toggleRing: (i: number) => void;
  filteredCount: number;
  onExportPNG: () => void;
  onExportPDF: () => void;
  exporting: boolean;
}

export function FilterSidebar({
  filters,
  toggleSector,
  toggleRing,
  filteredCount,
  onExportPNG,
  onExportPDF,
  exporting,
}: FilterSidebarProps) {
  return (
    <aside className="w-[220px] flex-shrink-0 border-r bg-card/50 p-3 space-y-4 overflow-y-auto">
      <div className="text-[10px] text-muted-foreground leading-relaxed italic">
        Aplicación web interactiva de vigilancia científico-tecnológica para
        el área de telecomunicaciones del Centro de Electricidad,
        Electrónica y Telecomunicaciones (CEET) — SENA.
      </div>

      <Separator />

      <div className="text-[11px] text-muted-foreground bg-accent/20 p-2.5 rounded-md border border-accent/30 leading-snug">
        <p className="font-bold text-foreground mb-1.5 text-xs">Guía de Navegación</p>
        <ul className="list-disc list-inside space-y-1 opacity-80">
          <li><span className="font-medium">Zoom:</span> Rueda del mouse</li>
          <li><span className="font-medium">Mover:</span> Arrastra el lienzo</li>
          <li><span className="font-medium">Detalles:</span> Clic en los puntos</li>
        </ul>
      </div>

      <Separator />

      {/* Sector filters */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Direccionadores
          </span>
        </div>
        {SECTORS.map((s, i) => {
          const isOn = filters.sectors.has(i);
          const count = TECHNOLOGIES.filter((t) => t.sector === i).length;
          return (
            <button
              key={s.id}
              onClick={() => toggleSector(i)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg mb-1 transition-all duration-150 text-left border-l-[3px] ${
                isOn
                  ? "bg-accent/30 border-l-current"
                  : "bg-transparent border-l-transparent opacity-40 hover:opacity-60"
              }`}
              style={{ color: s.color }}
            >
              <span className="text-xs">{s.icon}</span>
              <span className="text-[11px] font-medium flex-1 leading-tight">
                {s.id}: {s.label}
              </span>
              <span className="text-[9px] font-mono opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Ring filters */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
          Fase de Adopción
        </span>
        {RINGS.map((r, i) => {
          const isOn = filters.rings.has(i);
          return (
            <button
              key={r.id}
              onClick={() => toggleRing(i)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1 transition-all duration-150 text-left ${
                isOn ? "bg-muted" : "opacity-35 hover:opacity-50"
              }`}
            >
              <span
                className="w-4 h-3 rounded-sm flex-shrink-0 border"
                style={{
                  backgroundColor: r.fillColor,
                  borderColor: r.borderColor,
                  opacity: isOn ? 1 : 0.3,
                }}
              />
              <span
                className="text-[11px] font-medium flex-1"
                style={{ color: isOn ? r.labelColor : undefined }}
              >
                {r.label}
              </span>
              <span className="text-[8px] text-muted-foreground">{r.trl}</span>
            </button>
          );
        })}
      </div>

      <Separator />

      {/* TRL legend */}
      <div className="rounded-lg bg-muted p-3">
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

      {/* Export */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
          Exportar
        </span>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={onExportPNG}
          disabled={exporting}
        >
          <FileImage className="w-3.5 h-3.5" />
          Guardar como PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={onExportPDF}
          disabled={exporting}
        >
          <FileText className="w-3.5 h-3.5" />
          Guardar como PDF
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        {filteredCount} / {TECHNOLOGIES.length} tecnologías
      </p>
    </aside>
  );
}
