import { describe, it, expect } from "vitest";
import { createRadarStore } from "./store";
import type { RadarSchema } from "./types";

const TEST_SCHEMA: RadarSchema = {
  $schemaVersion: "1.0.0",
  id: "test",
  title: "Test",
  rings: [
    { id: "r1", label: "R1", order: 0, innerRadius: 0, outerRadius: 100, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
    { id: "r2", label: "R2", order: 1, innerRadius: 100, outerRadius: 200, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
  ],
  sectors: [{ id: "s1", label: "S1", color: "#f00" }],
  items: [
    { id: "i1", name: "Item 1", sectorId: "s1", ringId: "r1", angleOff: 0 },
    { id: "i2", name: "Item 2", sectorId: "s1", ringId: "r2", angleOff: 0 },
  ],
};

describe("createRadarStore", () => {
  it("creates independent stores", () => {
    const store1 = createRadarStore(TEST_SCHEMA);
    const store2 = createRadarStore(TEST_SCHEMA);

    store1.getState().selectItem("i1");
    expect(store1.getState().selectedItemId).toBe("i1");
    expect(store2.getState().selectedItemId).toBeNull();
  });

  it("selects and deselects items", () => {
    const store = createRadarStore(TEST_SCHEMA);
    store.getState().selectItem("i1");
    expect(store.getState().selectedItemId).toBe("i1");

    store.getState().selectItem(null);
    expect(store.getState().selectedItemId).toBeNull();
  });

  it("toggles sectors", () => {
    const store = createRadarStore(TEST_SCHEMA);
    expect(store.getState().filters.sectors.has("s1")).toBe(false);

    store.getState().toggleSector("s1");
    expect(store.getState().filters.sectors.has("s1")).toBe(true);

    store.getState().toggleSector("s1");
    expect(store.getState().filters.sectors.has("s1")).toBe(false);
  });

  it("toggles rings", () => {
    const store = createRadarStore(TEST_SCHEMA);
    store.getState().toggleRing("r1");
    expect(store.getState().filters.rings.has("r1")).toBe(true);
  });

  it("updates zoom and pan", () => {
    const store = createRadarStore(TEST_SCHEMA);
    store.getState().setZoom(2);
    expect(store.getState().zoom).toBe(2);

    store.getState().setPan({ x: 10, y: 20 });
    expect(store.getState().pan).toEqual({ x: 10, y: 20 });
  });

  it("resets view", () => {
    const store = createRadarStore(TEST_SCHEMA);
    store.getState().setZoom(2);
    store.getState().setPan({ x: 10, y: 20 });
    store.getState().selectItem("i1");

    store.getState().resetView();
    expect(store.getState().zoom).toBe(1);
    expect(store.getState().pan).toEqual({ x: 0, y: 0 });
    expect(store.getState().selectedItemId).toBeNull();
  });

  it("stores the schema", () => {
    const store = createRadarStore(TEST_SCHEMA);
    expect(store.getState().schema.id).toBe("test");
  });

  it("has TRL and NPS scales pre-registered", () => {
    const store = createRadarStore(TEST_SCHEMA);
    expect(store.getState().getScale("trl")).toBeDefined();
    expect(store.getState().getScale("nps")).toBeDefined();
  });

  it("registers custom scales per instance", () => {
    const store1 = createRadarStore(TEST_SCHEMA);
    const store2 = createRadarStore(TEST_SCHEMA);

    const customScale = {
      id: "custom",
      label: "Custom",
      min: 0,
      max: 10,
      buckets: [{ rangeStart: 0, rangeEnd: 10, label: "All", color: "#000" }],
      colorFor: () => "#000",
      labelFor: () => "All",
    };

    store1.getState().registerScale(customScale);
    expect(store1.getState().getScale("custom")).toBe(customScale);
    expect(store2.getState().getScale("custom")).toBeUndefined();
  });
});
