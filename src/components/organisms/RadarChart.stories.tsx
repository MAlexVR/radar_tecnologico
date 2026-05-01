import type { Meta, StoryObj } from "@storybook/react";
import { RadarChart } from "./RadarChart";
import { TECHNOLOGIES, RINGS, SECTORS } from "@/lib/radar-data";
import type { Technology } from "@/types/radar";
import { useState } from "react";
import React from "react";

const meta: Meta<typeof RadarChart> = {
  title: "Organisms/RadarChart",
  component: RadarChart,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

function RadarChartWrapper({
  filteredTechs,
  preselectedTech,
}: {
  filteredTechs: Technology[];
  preselectedTech?: Technology | null;
}) {
  const [selectedTech, setSelectedTech] = useState<Technology | null>(
    preselectedTech ?? null
  );
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);

  return (
    <div className="w-full h-[80vh] bg-background p-4">
      <RadarChart
        filteredTechs={filteredTechs}
        selectedTech={selectedTech}
        hoveredTech={hoveredTech}
        activeSectors={new Set(SECTORS.map((_, i) => i))}
        activeRings={new Set(RINGS.map((_, i) => i))}
        onSelect={setSelectedTech}
        onHover={setHoveredTech}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <RadarChartWrapper filteredTechs={TECHNOLOGIES} />,
};

export const Filtered: Story = {
  render: () => (
    <RadarChartWrapper
      filteredTechs={TECHNOLOGIES.filter((t) => t.sector === 0 || t.sector === 1)}
    />
  ),
};

export const WithSelectedItem: Story = {
  render: () => (
    <RadarChartWrapper
      filteredTechs={TECHNOLOGIES}
      preselectedTech={TECHNOLOGIES[0]}
    />
  ),
};
