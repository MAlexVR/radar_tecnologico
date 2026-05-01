import { describe, it, expect } from "vitest";
import { polarToXY, getItemPosition, computeAllPositions } from "./geometry";
import type { RadarSchema, RadarItem } from "./types";

const TEST_SCHEMA: RadarSchema = {
  $schemaVersion: "1.0.0",
  id: "test",
  title: "Test Radar",
  rings: [
    { id: "inner", label: "Inner", order: 0, innerRadius: 0, outerRadius: 100, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
    { id: "outer", label: "Outer", order: 1, innerRadius: 100, outerRadius: 200, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
  ],
  sectors: [
    { id: "s1", label: "Sector 1", startAngle: 0, color: "#f00" },
  ],
  items: [
    { id: "i1", name: "Item 1", sectorId: "s1", ringId: "inner", angleOff: 0 },
    { id: "i2", name: "Item 2", sectorId: "s1", ringId: "outer", angleOff: 10 },
  ],
  layout: { viewBoxWidth: 400, viewBoxHeight: 400, centerX: 200, centerY: 200 },
};

describe("polarToXY", () => {
  it("converts polar to cartesian at 0 degrees", () => {
    const pos = polarToXY(0, 0, 100, 0);
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(0);
  });

  it("converts polar to cartesian at 90 degrees", () => {
    const pos = polarToXY(0, 0, 100, 90);
    expect(pos.x).toBeCloseTo(0, 5);
    expect(pos.y).toBeCloseTo(100, 5);
  });

  it("converts polar to cartesian at 180 degrees", () => {
    const pos = polarToXY(0, 0, 100, 180);
    expect(pos.x).toBeCloseTo(-100, 5);
    expect(pos.y).toBeCloseTo(0, 5);
  });
});

describe("getItemPosition", () => {
  it("calculates position for inner ring item", () => {
    const pos = getItemPosition(TEST_SCHEMA.items[0], TEST_SCHEMA);
    // Inner ring midpoint radius = 50, sector center = 0 + 360/2 = 180
    // x = 200 + 50 * cos(180°) = 200 - 50 = 150
    // y = 200 + 50 * sin(180°) = 200 + 0 = 200
    expect(pos.x).toBeCloseTo(150, 0);
    expect(pos.y).toBeCloseTo(200, 0);
  });

  it("throws for unknown sector", () => {
    const badItem: RadarItem = { ...TEST_SCHEMA.items[0], sectorId: "unknown" };
    expect(() => getItemPosition(badItem, TEST_SCHEMA)).toThrow();
  });

  it("throws for unknown ring", () => {
    const badItem: RadarItem = { ...TEST_SCHEMA.items[0], ringId: "unknown" };
    expect(() => getItemPosition(badItem, TEST_SCHEMA)).toThrow();
  });
});

describe("computeAllPositions", () => {
  it("computes positions for all items", () => {
    const positions = computeAllPositions(TEST_SCHEMA);
    expect(positions.size).toBe(2);
    expect(positions.has("i1")).toBe(true);
    expect(positions.has("i2")).toBe(true);
  });
});
