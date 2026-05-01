"use client";

import { useContext } from "react";
import { useStore } from "zustand/react";
import { Technology } from "@/types/radar";
import {
  RINGS,
  SECTORS,
  TECHNOLOGIES,
  EXCLUDED_TECHNOLOGIES,
  getTrlColor,
} from "@/lib/radar-data";
import { RadarStoreContext } from "@/core/store";
import { useRadarSelection, useRadarFilters } from "@/core/hooks";
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

interface NomenclatureTableRenderProps {
  filteredTechs: Technology[];
  selectedTech: Technology | null;
  onSelect: (tech: Technology | null) => void;
  rings: Ring[];
  sectors: Sector[];
  excludedTechnologies: Array<{
    code: string;
    name: string;
    sublines?: string[];
    justification?: string;
  }>;
}

function NomenclatureTableRender({
  filteredTechs,
  selectedTech,
  onSelect,
  rings,
  sectors,
  excludedTechnologies,
}: NomenclatureTableRenderProps) {
  // Group by sector
  const grouped = sectors
    .map((sector, si) => ({
      sector,
      techs: filteredTechs
        .filter((t) => t.sector === si)
        .sort((a, b) => a.ring - b.ring),
    }))
    .filter((g) => g.techs.length > 0);

  return (
    <div className="space-y-2">
      {grouped.map(({ sector, techs }) => (
        <div key={sector.id}>
          {/* Sector header */}
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-1 border-l-3"
            style={{
              backgroundColor: sector.bgDark,
              borderLeftColor: sector.color,
            }}
          >
            <span className="text-xs">{sector.icon}</span>
            <span
              className="text-[10px] font-bold truncate"
              style={{ color: sector.color }}
            >
              {sector.id}: {sector.label}
            </span>
          </div>

          {/* Tech rows — compact 2-column layout */}
          <div className="space-y-px">
            {techs.map((tech) => {
              const isSelected = selectedTech?.id === tech.id;
              const trlColor = getTrlColor(tech.trl);
              return (
                <button
                  key={tech.id}
                  onClick={() => onSelect(isSelected ? null : tech)}
                  className={`
                    w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left
                    transition-all duration-150 border
                    ${
                      isSelected
                        ? "bg-accent/50 border-border shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/50"
                    }
                  `}
                >
                  {/* Dot aligned with first line */}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: trlColor }}
                  />

                  {/* Code aligned with first line */}
                  <span
                    className="text-[9px] font-mono font-bold w-6 flex-shrink-0 mt-0.5"
                    style={{ color: sector.color }}
                  >
                    {tech.code}
                  </span>

                  {/* Name — multiline */}
                  <span className="text-[11px] font-medium flex-1 leading-tight">
                    {tech.name}
                  </span>

                  {/* Ring badge — compact */}
                  <span className="text-[8px] font-semibold px-1 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0 hidden xl:inline self-start mt-0.5">
                    {rings[tech.ring].label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Excluded / Not Mapped Section */}
      {excludedTechnologies && excludedTechnologies.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-1 bg-muted/50">
            <span className="text-xs">🚫</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              No Graficadas / Excluidas
            </span>
          </div>
          <div className="space-y-2 px-2">
            {excludedTechnologies.map((item) => (
              <div
                key={item.code}
                className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/50"
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  <span className="font-mono">{item.code}</span>
                  <span>{item.name}</span>
                </div>
                <div className="text-[9px] italic mb-1.5 opacity-80">
                  {item.justification}
                </div>
                {/* Sublines */}
                {item.sublines && (
                  <ul className="list-disc list-inside space-y-0.5 opacity-70">
                    {item.sublines.map((sub, i) => (
                      <li key={i} className="text-[9px] pl-1 leading-tight">
                        {sub}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Prop-based implementation ──────────────────────────────── */

interface NomenclatureTableProps {
  filteredTechs?: Technology[];
  selectedTech?: Technology | null;
  onSelect?: (tech: Technology | null) => void;
}

function NomenclatureTablePropsImpl({
  filteredTechs,
  selectedTech,
  onSelect,
}: Required<NomenclatureTableProps>) {
  return (
    <NomenclatureTableRender
      filteredTechs={filteredTechs}
      selectedTech={selectedTech}
      onSelect={onSelect}
      rings={RINGS}
      sectors={SECTORS}
      excludedTechnologies={EXCLUDED_TECHNOLOGIES}
    />
  );
}

/* ── Store-based implementation ─────────────────────────────── */

function NomenclatureTableStoreImpl() {
  const { selectedItem, selectItem } = useRadarSelection();
  const { filteredItems } = useRadarFilters();
  const store = useContext(RadarStoreContext);
  const schema = useStore(store!, (state) => state.schema);

  const rings = schema.rings
    .sort((a, b) => a.order - b.order)
    .map(convertRing);
  const sectors = schema.sectors.map(convertSector);

  const filteredTechs = filteredItems.map((item) =>
    convertItem(item, rings, sectors),
  );
  const selectedTech = selectedItem
    ? convertItem(selectedItem, rings, sectors)
    : null;

  const onSelect = (tech: Technology | null) => selectItem(tech?.id ?? null);

  const excludedTechnologies =
    schema.excludedItems?.map((e) => ({
      code: e.code,
      name: e.name as string,
      sublines: e.sublines as string[] | undefined,
      justification: (e.justification as string) ?? "",
    })) ?? [];

  return (
    <NomenclatureTableRender
      filteredTechs={filteredTechs}
      selectedTech={selectedTech}
      onSelect={onSelect}
      rings={rings}
      sectors={sectors}
      excludedTechnologies={excludedTechnologies}
    />
  );
}

/* ── Public component ───────────────────────────────────────── */

export function NomenclatureTable({
  filteredTechs,
  selectedTech,
  onSelect,
}: NomenclatureTableProps = {}) {
  const store = useContext(RadarStoreContext);

  if (filteredTechs !== undefined) {
    return (
      <NomenclatureTablePropsImpl
        filteredTechs={filteredTechs}
        selectedTech={selectedTech ?? null}
        onSelect={onSelect ?? (() => {})}
      />
    );
  }

  if (store) {
    return <NomenclatureTableStoreImpl />;
  }

  return (
    <NomenclatureTablePropsImpl
      filteredTechs={[]}
      selectedTech={null}
      onSelect={() => {}}
    />
  );
}
