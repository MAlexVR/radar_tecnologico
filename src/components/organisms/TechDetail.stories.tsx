import type { Meta, StoryObj } from "@storybook/react";
import { TechDetail } from "./TechDetail";
import { TECHNOLOGIES } from "@/lib/radar-data";

const meta = {
  title: "Organisms/TechDetail",
  component: TechDetail,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof TechDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {
  args: {
    tech: null,
  } as any,
};

export const SelectedTechnology: Story = {
  args: {
    tech: TECHNOLOGIES[0],
  } as any,
};

export const AnotherTechnology: Story = {
  args: {
    tech: TECHNOLOGIES.find((t) => t.ring === 3) ?? TECHNOLOGIES[1],
  } as any,
};
