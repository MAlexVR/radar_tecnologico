import type { Meta, StoryObj } from "@storybook/react";
import type { TrajectoryConfig, TrajectoryDataset } from "@/lib/trajectory";
import { TrajectoryMap } from "./TrajectoryMap";

// ── Synthetic dataset (domain-agnostic) ───────────────────────────────────────

const syntheticConfig: TrajectoryConfig = {
  drivers: [
    { key: "drvA", label: "Driver Alpha" },
    { key: "drvB", label: "Driver Beta" },
  ],
  layers: [
    { key: "lyr1", label: "Layer 1", order: 1 },
    { key: "lyr2", label: "Layer 2", order: 2 },
    { key: "lyr3", label: "Layer 3", order: 3 },
    { key: "lyr4", label: "Layer 4", order: 4 },
  ],
  horizonBuckets: [
    { key: "ahora",  label: "Now",   order: 1 },
    { key: "corto",  label: "Short", order: 2 },
    { key: "medio1", label: "Mid 1", order: 3 },
    { key: "medio2", label: "Mid 2", order: 4 },
    { key: "largo",  label: "Long",  order: 5 },
  ],
  colorFor: (item) => {
    const palette: Record<string, string> = {
      lyr1: "bg-blue-100 text-blue-900 border-blue-300",
      lyr2: "bg-green-100 text-green-900 border-green-300",
      lyr3: "bg-yellow-100 text-yellow-900 border-yellow-300",
      lyr4: "bg-purple-100 text-purple-900 border-purple-300",
    };
    return palette[item.layer] ?? "bg-gray-100 text-gray-800";
  },
  labelFor: (item) => item.title,
  metricBadge: (item) =>
    item.metric ? `${item.metric.label} ${item.metric.value}` : null,
};

const fullDataset: TrajectoryDataset = {
  items: [
    // drvA — Layer 1
    { id: "a1", layer: "lyr1", driver: "drvA", horizon: "ahora",  title: "Tech Alpha 1", detail: "Deployed tech.", metric: { label: "TRL", value: 9 } },
    { id: "a2", layer: "lyr1", driver: "drvA", horizon: "corto",  title: "Tech Alpha 2", detail: "Near-term tech.", metric: { label: "TRL", value: 6 }, gap: "high" },
    { id: "a3", layer: "lyr1", driver: "drvA", horizon: "medio1", title: "Tech Alpha 3", detail: "Mid-term tech.", metric: { label: "TRL", value: 4 } },
    { id: "a4", layer: "lyr1", driver: "drvA", horizon: "largo",  title: "Tech Alpha 4", detail: "Long-term tech.", metric: { label: "TRL", value: 2 } },
    // drvA — Layer 2
    { id: "a5", layer: "lyr2", driver: "drvA", horizon: "corto",  title: "Env Alpha 1", detail: "Short env change." },
    { id: "a6", layer: "lyr2", driver: "drvA", horizon: "medio2", title: "Env Alpha 2", detail: "Mid-2 env change." },
    // drvA — Layer 3
    { id: "a7", layer: "lyr3", driver: "drvA", horizon: "ahora",  title: "Talent Alpha 1", detail: "Existing role." },
    { id: "a8", layer: "lyr3", driver: "drvA", horizon: "largo",  title: "Talent Alpha 2", detail: "Future role." },
    // drvA — Layer 4
    { id: "a9", layer: "lyr4", driver: "drvA", horizon: "medio1", title: "Alliance Alpha 1", detail: "Strategic alliance." },
    // drvB
    { id: "b1", layer: "lyr1", driver: "drvB", horizon: "medio2", title: "Beta Tech 1", detail: "Mid-2 tech.", metric: { label: "TRL", value: 3 } },
    { id: "b2", layer: "lyr2", driver: "drvB", horizon: "largo",  title: "Beta Env 1",  detail: "Long env change." },
  ],
};

const emptyBetaDataset: TrajectoryDataset = {
  items: fullDataset.items.filter((i) => i.driver === "drvA"),
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TrajectoryMap> = {
  title: "Trajectory/TrajectoryMap",
  component: TrajectoryMap,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof TrajectoryMap>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    config: syntheticConfig,
    dataset: fullDataset,
  },
};

export const EmptyDriverTab: Story = {
  name: "Empty Driver Tab (Beta has no items)",
  args: {
    config: syntheticConfig,
    dataset: emptyBetaDataset,
  },
};
