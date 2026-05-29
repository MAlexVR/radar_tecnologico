import type { Meta, StoryObj } from "@storybook/react";
import type { TrajectoryConfig, TrajectoryItem } from "@/lib/trajectory";
import { TrajectoryProvider } from "./TrajectoryProvider";
import { TrajectoryNode } from "./TrajectoryNode";

// ── Synthetic config ──────────────────────────────────────────────────────────

const syntheticConfig: TrajectoryConfig = {
  drivers: [{ key: "drvA", label: "Driver Alpha" }],
  layers: [
    { key: "lyr1", label: "Layer 1", order: 1 },
    { key: "lyr2", label: "Layer 2", order: 2 },
  ],
  horizonBuckets: [
    { key: "ahora",  label: "Now",   order: 1 },
    { key: "corto",  label: "Short", order: 2 },
    { key: "medio1", label: "Mid 1", order: 3 },
    { key: "medio2", label: "Mid 2", order: 4 },
    { key: "largo",  label: "Long",  order: 5 },
  ],
  colorFor: (item) =>
    item.gap === "critical"
      ? "bg-red-100 text-red-900 border-red-300"
      : "bg-blue-100 text-blue-900 border-blue-300",
  labelFor: (item) => item.title,
  metricBadge: (item) =>
    item.metric ? `${item.metric.label} ${item.metric.value}` : null,
};

const baseItem: TrajectoryItem = {
  id: "node-001",
  layer: "lyr1",
  driver: "drvA",
  horizon: "corto",
  title: "Quantum Networking",
  detail: "Next-gen networking technology in early research phase.",
  metric: { label: "TRL", value: 4 },
};

// ── Decorator wraps with provider ────────────────────────────────────────────

const withProvider = (Story: React.ComponentType) => (
  <TrajectoryProvider config={syntheticConfig}>
    <div className="p-4 max-w-xs">
      <Story />
    </div>
  </TrajectoryProvider>
);

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TrajectoryNode> = {
  title: "Trajectory/TrajectoryNode",
  component: TrajectoryNode,
  decorators: [withProvider],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof TrajectoryNode>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { item: baseItem },
};

export const WithGap: Story = {
  name: "Critical Gap",
  args: {
    item: { ...baseItem, gap: "critical", title: "Critical Technology Gap" },
  },
};

export const NoMetric: Story = {
  name: "No Metric Badge",
  args: {
    item: { ...baseItem, metric: undefined, title: "No Metric Node" },
  },
};

export const LongTitle: Story = {
  name: "Long Title (line-clamp)",
  args: {
    item: {
      ...baseItem,
      title:
        "A Very Long Technology Name That Should Be Clamped After Two Lines Maximum",
    },
  },
};
