"use client";

import { Technology } from "@/types/radar";
import { RINGS, SECTORS, TECHNOLOGIES, getTrlColor } from "@/lib/radar-data";

interface NomenclatureTableProps {
  filteredTechs: Technology[];
  selectedTech: Technology | null;
  onSelect: (tech: Technology | null) => void;
}

export function NomenclatureTable({
  filteredTechs,
  selectedTech,
  onSelect,
}: NomenclatureTableProps) {
  // Group by sector
  const grouped = SECTORS.map((sector, si) => ({
    sector,
    techs: filteredTechs
      .filter((t) => t.sector === si)
      .sort((a, b) => a.ring - b.ring),
  })).filter((g) => g.techs.length > 0);

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
                    w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left
                    transition-all duration-150 border
                    ${
                      isSelected
                        ? "bg-accent/50 border-border shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/50"
                    }
                  `}
                >
                  {/* Dot */}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: trlColor }}
                  />

                  {/* Code */}
                  <span
                    className="text-[9px] font-mono font-bold w-6 flex-shrink-0"
                    style={{ color: sector.color }}
                  >
                    {tech.code}
                  </span>

                  {/* Name — takes remaining space, truncates */}
                  <span className="text-[11px] font-medium flex-1 truncate min-w-0">
                    {tech.name}
                  </span>

                  {/* Ring badge — compact */}
                  <span className="text-[8px] font-semibold px-1 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0 hidden xl:inline">
                    {RINGS[tech.ring].label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
