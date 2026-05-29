import type { Meta, StoryObj } from "@storybook/react";
import type { TrajectoryConfig, TrajectoryItem } from "@/lib/trajectory";
import { TrajectoryDetail } from "./TrajectoryDetail";

// ── Synthetic config ──────────────────────────────────────────────────────────

const syntheticConfig: TrajectoryConfig = {
  drivers: [{ key: "drvA", label: "Driver Alpha" }],
  layers: [
    { key: "lyr1", label: "Technology",  order: 1 },
    { key: "lyr2", label: "Environment", order: 2 },
  ],
  horizonBuckets: [
    { key: "ahora",  label: "Now",   order: 1 },
    { key: "corto",  label: "Short", order: 2 },
    { key: "medio1", label: "Mid 1", order: 3 },
    { key: "medio2", label: "Mid 2", order: 4 },
    { key: "largo",  label: "Long",  order: 5 },
  ],
  colorFor: () => "bg-blue-100 text-blue-900",
  labelFor: (item) => item.title,
};

// ── Synthetic items ───────────────────────────────────────────────────────────

const fullItem: TrajectoryItem = {
  id: "item-001",
  layer: "lyr1",
  driver: "drvA",
  horizon: "corto",
  title: "Advanced Photonic Switching",
  detail:
    "Next-generation optical switching technology enabling sub-millisecond latency at terabit scale. Currently in laboratory validation phase.",
  metric: { label: "TRL", value: 4 },
  gap: "critical",
  source: "GOR-F-012 Tabla 8 — Revisión 2025",
  meta: {
    kind: "tecnologia",
    priority: "P1",
    organization: "SENA Research Division",
  },
};

const minimalItem: TrajectoryItem = {
  id: "item-002",
  layer: "lyr2",
  driver: "drvA",
  horizon: "largo",
  title: "Regulatory Framework Update",
  detail: "Updated spectrum regulation for mmWave deployment.",
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TrajectoryDetail> = {
  title: "Trajectory/TrajectoryDetail",
  component: TrajectoryDetail,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TrajectoryDetail>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Full: Story = {
  name: "Full Item (all fields)",
  args: { item: fullItem, config: syntheticConfig },
};

export const WithClose: Story = {
  name: "Full Item — with onClose button",
  args: {
    item: fullItem,
    config: syntheticConfig,
    onClose: () => console.log("closed"),
  },
};

export const Minimal: Story = {
  name: "Minimal Item (required fields only)",
  args: { item: minimalItem, config: syntheticConfig },
};

export const NoItem: Story = {
  name: "Null item (nothing rendered)",
  args: { item: null, config: syntheticConfig },
};

export const WithCustomRenderer: Story = {
  name: "Custom detailRenderer override",
  args: {
    item: fullItem,
    config: {
      ...syntheticConfig,
      detailRenderer: (item) => (
        <div className="rounded-lg bg-amber-50 p-4 text-sm">
          <strong>Custom renderer for: {item.title}</strong>
          <p className="mt-1 text-amber-700">
            This slot is controlled by the domain adapter.
          </p>
        </div>
      ),
    },
  },
};
