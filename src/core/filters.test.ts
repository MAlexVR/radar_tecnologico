import { describe, it, expect } from "vitest";
import { applyFilters, buildFullFilterState, DEFAULT_FILTER_STATE } from "./filters";
import type { RadarSchema, RadarItem } from "./types";

const ITEMS: RadarItem[] = [
  { id: "i1", name: "A", sectorId: "s1", ringId: "r1", angleOff: 0 },
  { id: "i2", name: "B", sectorId: "s1", ringId: "r2", angleOff: 0 },
  { id: "i3", name: "C", sectorId: "s2", ringId: "r1", angleOff: 0 },
  { id: "i4", name: "D", sectorId: "s2", ringId: "r2", angleOff: 0 },
];

describe("applyFilters", () => {
  it("returns all items when filters are empty", () => {
    const result = applyFilters(ITEMS, DEFAULT_FILTER_STATE);
    expect(result).toHaveLength(4);
  });

  it("filters by sector", () => {
    const result = applyFilters(ITEMS, { sectors: new Set(["s1"]), rings: new Set() });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.sectorId === "s1")).toBe(true);
  });

  it("filters by ring", () => {
    const result = applyFilters(ITEMS, { sectors: new Set(), rings: new Set(["r2"]) });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.ringId === "r2")).toBe(true);
  });

  it("filters by both sector and ring", () => {
    const result = applyFilters(ITEMS, { sectors: new Set(["s1"]), rings: new Set(["r1"]) });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("i1");
  });
});

describe("buildFullFilterState", () => {
  it("includes all sectors and rings from schema", () => {
    const schema: RadarSchema = {
      $schemaVersion: "1.0.0",
      id: "test",
      title: "Test",
      rings: [
        { id: "r1", label: "R1", order: 0, innerRadius: 0, outerRadius: 100, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
        { id: "r2", label: "R2", order: 1, innerRadius: 100, outerRadius: 200, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
      ],
      sectors: [
        { id: "s1", label: "S1", color: "#f00" },
        { id: "s2", label: "S2", color: "#0f0" },
      ],
      items: [],
    };
    const filters = buildFullFilterState(schema);
    expect(filters.sectors.has("s1")).toBe(true);
    expect(filters.sectors.has("s2")).toBe(true);
    expect(filters.rings.has("r1")).toBe(true);
    expect(filters.rings.has("r2")).toBe(true);
  });
});
