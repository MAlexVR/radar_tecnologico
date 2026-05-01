"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RadarChart } from "@/components/organisms/RadarChart";
import { RadarProvider } from "@/components/radar/RadarProvider";
import { TECHNOLOGIES } from "@/lib/radar-data";
import type { Technology } from "@/types/radar";
import schemaJson from "../../../public/data/ceet-telecom.json";

function EmbedContent() {
  const searchParams = useSearchParams();

  const schemaParam = searchParams.get("schema") || "ceet-telecom";
  const theme = searchParams.get("theme") || "sena";
  const locale = searchParams.get("locale") || "es";
  const filtersParam = searchParams.get("filters");
  const sizeParam = searchParams.get("size") || "800x600";

  const [w, h] = sizeParam.split("x").map((n) => parseInt(n, 10));
  const width = Number.isFinite(w) ? w : 800;
  const height = Number.isFinite(h) ? h : 600;

  const activeSectors = new Set<number>([0, 1, 2, 3, 4]);
  const activeRings = new Set<number>([0, 1, 2, 3]);

  if (filtersParam) {
    const parts = filtersParam.split(";");
    for (const part of parts) {
      const [key, values] = part.split(":");
      if (key === "sectors" && values) {
        activeSectors.clear();
        values.split(",").forEach((v) => {
          const idx = parseInt(v.replace("D", ""), 10) - 1;
          if (idx >= 0 && idx <= 4) activeSectors.add(idx);
        });
      }
      if (key === "rings" && values) {
        activeRings.clear();
        values.split(",").forEach((v) => {
          const map: Record<string, number> = { adopt: 0, trial: 1, assess: 2, monitor: 3 };
          if (v in map) activeRings.add(map[v]);
        });
      }
    }
  }

  const filteredTechs = TECHNOLOGIES.filter(
    (t) => activeSectors.has(t.sector) && activeRings.has(t.ring),
  );

  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);

  const schema = schemaJson as unknown as Parameters<typeof RadarProvider>[0]["schema"];

  return (
    <RadarProvider schema={schema}>
      <div
        className="bg-white"
        style={{ width, height }}
        data-theme={theme}
        data-locale={locale}
        data-schema={schemaParam}
      >
        <RadarChart
          filteredTechs={filteredTechs}
          selectedTech={selectedTech}
          hoveredTech={hoveredTech}
          activeSectors={activeSectors}
          activeRings={activeRings}
          onSelect={setSelectedTech}
          onHover={setHoveredTech}
        />
      </div>
    </RadarProvider>
  );
}

export default function EmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          Cargando radar...
        </div>
      }
    >
      <EmbedContent />
    </Suspense>
  );
}
