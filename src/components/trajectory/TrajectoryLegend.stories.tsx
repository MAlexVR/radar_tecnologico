import type { Meta, StoryObj } from "@storybook/react";
import type { TrajectoryConfig } from "@/lib/trajectory";
import { TrajectoryLegend } from "./TrajectoryLegend";

// ── Synthetic config ──────────────────────────────────────────────────────────

const syntheticConfig: TrajectoryConfig = {
  drivers: [{ key: "drvA", label: "Driver Alpha" }],
  layers: [
    { key: "lyr1", label: "Technology",  order: 1 },
    { key: "lyr2", label: "Environment", order: 2 },
    { key: "lyr3", label: "Talent",      order: 3 },
    { key: "lyr4", label: "Alliances",   order: 4 },
  ],
  horizonBuckets: [
    { key: "ahora",  label: "Now",    order: 1 },
    { key: "corto",  label: "Short",  order: 2 },
    { key: "medio1", label: "Mid 1",  order: 3 },
    { key: "medio2", label: "Mid 2",  order: 4 },
    { key: "largo",  label: "Long",   order: 5 },
  ],
  colorFor: (item) => {
    const palette: Record<string, string> = {
      lyr1: "bg-blue-200",
      lyr2: "bg-green-200",
      lyr3: "bg-yellow-200",
      lyr4: "bg-purple-200",
    };
    return palette[item.layer] ?? "bg-gray-200";
  },
  labelFor: (item) => item.title,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TrajectoryLegend> = {
  title: "Trajectory/TrajectoryLegend",
  component: TrajectoryLegend,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof TrajectoryLegend>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { config: syntheticConfig },
  decorators: [
    (Story) => (
      <div className="w-48 p-4 border rounded-lg">
        <Story />
      </div>
    ),
  ],
};
