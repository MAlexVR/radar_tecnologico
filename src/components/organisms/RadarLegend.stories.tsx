import type { Meta, StoryObj } from "@storybook/react";
import { RadarLegend } from "./RadarLegend";

const meta = {
  title: "Organisms/RadarLegend",
  component: RadarLegend,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RadarLegend>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
