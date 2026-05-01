"use client";

import { useContext } from "react";
import { useStore } from "zustand/react";
import { Technology } from "@/types/radar";
import {
  RINGS,
  SECTORS,
  getTrlColor,
  getTrlLabel,
  TECHNOLOGIES,
} from "@/lib/radar-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Gauge, Lightbulb } from "lucide-react";
import { RadarStoreContext } from "@/core/store";
import { useRadarSelection } from "@/core/hooks";
import type { RadarRing, RadarSector, RadarItem } from "@/core";
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

function convertItem(
  item: RadarItem,
  rings: Ring[],
  sectors: Sector[],
): Technology {
  const ringOrder = rings.map((r) => r.id);
  const sectorOrder = sectors.map((s) => s.id);
  return {
    id: item.id,
    name: item.name as string,
    nameLines: item.nameLines as string[] | undefined,
    code: item.code ?? "",
    sector: sectorOrder.indexOf(item.sectorId),
    ring: ringOrder.indexOf(item.ringId),
    angleOff: item.angleOff,
    labelDy: item.labelDy,
    trl: item.maturity?.value ?? 0,
    desc: (item.description as string) ?? "",
    impact: (item.metadata?.impact as string) ?? "",
    horizon: (item.metadata?.horizon as string) ?? "",
  };
}

/* ── Shared render ──────────────────────────────────────────── */

interface TechDetailRenderProps {
  tech: Technology | null;
  rings: Ring[];
  sectors: Sector[];
  technologies: Technology[];
}

function TechDetailRender({ tech, rings, sectors, technologies }: TechDetailRenderProps) {
  if (!tech) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Target className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-2">
          Selecciona una tecnología
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
          Haz clic en un punto del radar o en la tabla de nomenclaturas para ver
          detalles, madurez (TRL) y recomendaciones.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 w-full mt-6">
          {rings.map((ring, i) => {
            const count = technologies.filter((t) => t.ring === i).length;
            return (
              <div
                key={ring.id}
                className="rounded-lg bg-muted p-3 text-center"
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: ring.color }}
                >
                  {count}
                </span>
                <p className="text-[9px] text-muted-foreground font-medium mt-0.5 truncate">
                  {ring.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const sector = sectors[tech.sector];
  const ring = rings[tech.ring];
  const tempColor = getTrlColor(tech.trl);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div
        className="rounded-xl p-4 border-l-4"
        style={{
          backgroundColor: sector.bgDark,
          borderLeftColor: sector.color,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{sector.icon}</span>
          <Badge
            className="text-[10px]"
            style={{
              backgroundColor: `${sector.color}20`,
              color: sector.color,
              borderColor: `${sector.color}30`,
            }}
          >
            {tech.code}
          </Badge>
        </div>
        <h3 className="font-bold text-base leading-tight">{tech.name}</h3>
        <p className="text-[11px] text-muted-foreground mt-1">{sector.label}</p>
      </div>

      {/* Temperature gauge */}
      <Card className="border-0 bg-muted">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Nivel de TRL
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: tempColor }}>
              {getTrlLabel(tech.trl)}
            </span>
          </div>
          {/* Bar */}
          <div className="h-2 rounded-full bg-background overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(tech.trl / 9) * 100}%`,
                background: `linear-gradient(90deg, #4FC3F7, ${tempColor})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-muted-foreground">TRL 1</span>
            <span className="text-sm font-bold" style={{ color: tempColor }}>
              TRL {tech.trl}
            </span>
            <span className="text-[9px] text-muted-foreground">TRL 9</span>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tech.desc}
        </p>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Fase", value: ring.label, color: ring.labelColor },
          { label: "Impacto", value: tech.impact, color: "#00304d" },
          { label: "Horizonte", value: tech.horizon, color: "#007832" },
          { label: "Madurez", value: `TRL ${tech.trl}`, color: tempColor },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-muted p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
              {item.label}
            </span>
            <span
              className="text-xs font-semibold mt-0.5 block"
              style={{ color: item.color }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Action */}
      <div className="rounded-xl p-3 bg-muted border border-border/50">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-sena-yellow" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-sena-green-dark">
            Acción Recomendada
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {ring.recommendedAction}
        </p>
      </div>
    </div>
  );
}

/* ── Prop-based implementation ──────────────────────────────── */

interface TechDetailProps {
  tech?: Technology | null;
}

function TechDetailPropsImpl({ tech }: TechDetailProps) {
  return (
    <TechDetailRender
      tech={tech ?? null}
      rings={RINGS}
      sectors={SECTORS}
      technologies={TECHNOLOGIES}
    />
  );
}

/* ── Store-based implementation ─────────────────────────────── */

function TechDetailStoreImpl() {
  const { selectedItem } = useRadarSelection();
  const store = useContext(RadarStoreContext);
  const schema = useStore(store!, (state) => state.schema);

  const rings = schema.rings
    .sort((a, b) => a.order - b.order)
    .map(convertRing);
  const sectors = schema.sectors.map(convertSector);
  const technologies = schema.items.map((item) => convertItem(item, rings, sectors));

  const tech = selectedItem ? convertItem(selectedItem, rings, sectors) : null;

  return (
    <TechDetailRender
      tech={tech}
      rings={rings}
      sectors={sectors}
      technologies={technologies}
    />
  );
}

/* ── Public component ───────────────────────────────────────── */

export function TechDetail({ tech }: TechDetailProps = {}) {
  const store = useContext(RadarStoreContext);

  if (tech !== undefined) {
    return <TechDetailPropsImpl tech={tech} />;
  }

  if (store) {
    return <TechDetailStoreImpl />;
  }

  return <TechDetailPropsImpl tech={null} />;
}
