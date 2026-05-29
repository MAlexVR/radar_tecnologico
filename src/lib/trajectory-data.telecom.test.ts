/**
 * Tests for the telecom trajectory adapter.
 *
 * Verifies:
 *   1. telecomConfig passes validateTrajectoryConfig without throwing.
 *   2. buildTelecomTrajectory() returns a non-empty items array.
 *   3. D1 and D3 have items in L2, L3, and L4.
 *   4. All items have a valid horizon (within the 5 buckets defined in config).
 *   5. All items have a valid driver (within the drivers defined in config).
 *   6. L1 covers all 5 drivers (D1–D5).
 *   7. D2, D4, D5 have NO capacity items (L2/L3/L4 empty).
 */

import { describe, it, expect } from "vitest";
import {
  telecomConfig,
  buildTelecomTrajectory,
} from "./trajectory-data.telecom";
import { validateTrajectoryConfig } from "./trajectory";

// ── Valid sets derived from config ────────────────────────────────────────────

const validHorizons = new Set(
  telecomConfig.horizonBuckets.map((b) => b.key)
);
const validDrivers = new Set(telecomConfig.drivers.map((d) => d.key));

// ── Suite ─────────────────────────────────────────────────────────────────────

describe("telecomConfig", () => {
  it("passes validateTrajectoryConfig without throwing", () => {
    expect(() => validateTrajectoryConfig(telecomConfig)).not.toThrow();
  });

  it("has 5 drivers (D1–D5)", () => {
    expect(telecomConfig.drivers).toHaveLength(5);
    expect(telecomConfig.drivers.map((d) => d.key)).toEqual([
      "D1",
      "D2",
      "D3",
      "D4",
      "D5",
    ]);
  });

  it("has 4 layers (L1–L4) in order", () => {
    expect(telecomConfig.layers).toHaveLength(4);
    const keys = telecomConfig.layers.map((l) => l.key);
    expect(keys).toContain("L1");
    expect(keys).toContain("L2");
    expect(keys).toContain("L3");
    expect(keys).toContain("L4");
  });

  it("has 5 horizon buckets", () => {
    expect(telecomConfig.horizonBuckets).toHaveLength(5);
    const keys = telecomConfig.horizonBuckets.map((b) => b.key);
    expect(keys).toEqual(["ahora", "corto", "medio1", "medio2", "largo"]);
  });

  it("colorFor returns a non-empty string for any item", () => {
    const sample = {
      id: "t",
      layer: "L1",
      driver: "D1",
      horizon: "corto" as const,
      title: "Test",
      detail: "",
    };
    const color = telecomConfig.colorFor(sample);
    expect(typeof color).toBe("string");
    expect(color.length).toBeGreaterThan(0);
  });

  it("colorFor returns red class for gap='critica'", () => {
    const item = {
      id: "t",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      gap: "critica",
    };
    expect(telecomConfig.colorFor(item)).toContain("red");
  });

  it("colorFor returns amber class for gap='alta'", () => {
    const item = {
      id: "t",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      gap: "alta",
    };
    expect(telecomConfig.colorFor(item)).toContain("amber");
  });

  it("metricBadge returns TRL string for L1 items with metric", () => {
    const item = {
      id: "t",
      layer: "L1",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      metric: { label: "TRL", value: 7 },
    };
    expect(telecomConfig.metricBadge!(item)).toBe("TRL 7");
  });

  it("metricBadge returns null for L2/L3/L4 items", () => {
    const item = {
      id: "t",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      metric: { label: "TRL", value: 7 },
    };
    expect(telecomConfig.metricBadge!(item)).toBeNull();
  });
});

describe("buildTelecomTrajectory()", () => {
  const dataset = buildTelecomTrajectory();

  it("returns an object with a non-empty items array", () => {
    expect(dataset).toBeDefined();
    expect(Array.isArray(dataset.items)).toBe(true);
    expect(dataset.items.length).toBeGreaterThan(0);
  });

  it("all items have horizon within the 5 valid buckets", () => {
    for (const item of dataset.items) {
      expect(validHorizons.has(item.horizon)).toBe(true);
    }
  });

  it("all items have driver within the 5 valid drivers", () => {
    for (const item of dataset.items) {
      expect(validDrivers.has(item.driver)).toBe(true);
    }
  });

  it("all items have non-empty id, title, detail, layer", () => {
    for (const item of dataset.items) {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.detail.length).toBeGreaterThan(0);
      expect(item.layer.length).toBeGreaterThan(0);
    }
  });

  it("L1 (Tecnologías) covers all 5 drivers", () => {
    const l1Items = dataset.items.filter((i) => i.layer === "L1");
    const driversInL1 = new Set(l1Items.map((i) => i.driver));
    for (const dk of ["D1", "D2", "D3", "D4", "D5"]) {
      expect(driversInL1.has(dk)).toBe(true);
    }
  });

  it("D1 has at least one item in L2 (infraestructura)", () => {
    const d1L2 = dataset.items.filter(
      (i) => i.driver === "D1" && i.layer === "L2"
    );
    expect(d1L2.length).toBeGreaterThan(0);
  });

  it("D1 has at least one item in L3 (talento & I+D+i)", () => {
    const d1L3 = dataset.items.filter(
      (i) => i.driver === "D1" && i.layer === "L3"
    );
    expect(d1L3.length).toBeGreaterThan(0);
  });

  it("D1 has at least one item in L4 (alianzas)", () => {
    const d1L4 = dataset.items.filter(
      (i) => i.driver === "D1" && i.layer === "L4"
    );
    expect(d1L4.length).toBeGreaterThan(0);
  });

  it("D3 has at least one item in L2 (infraestructura)", () => {
    const d3L2 = dataset.items.filter(
      (i) => i.driver === "D3" && i.layer === "L2"
    );
    expect(d3L2.length).toBeGreaterThan(0);
  });

  it("D3 has at least one item in L3 (talento & I+D+i)", () => {
    const d3L3 = dataset.items.filter(
      (i) => i.driver === "D3" && i.layer === "L3"
    );
    expect(d3L3.length).toBeGreaterThan(0);
  });

  it("D3 has at least one item in L4 (alianzas)", () => {
    const d3L4 = dataset.items.filter(
      (i) => i.driver === "D3" && i.layer === "L4"
    );
    expect(d3L4.length).toBeGreaterThan(0);
  });

  it("D2 has NO capacity items (L2/L3/L4 empty — MVP)", () => {
    const d2Capacity = dataset.items.filter(
      (i) =>
        i.driver === "D2" &&
        (i.layer === "L2" || i.layer === "L3" || i.layer === "L4")
    );
    expect(d2Capacity).toHaveLength(0);
  });

  it("D4 has NO capacity items (L2/L3/L4 empty — MVP)", () => {
    const d4Capacity = dataset.items.filter(
      (i) =>
        i.driver === "D4" &&
        (i.layer === "L2" || i.layer === "L3" || i.layer === "L4")
    );
    expect(d4Capacity).toHaveLength(0);
  });

  it("D5 has NO capacity items (L2/L3/L4 empty — MVP)", () => {
    const d5Capacity = dataset.items.filter(
      (i) =>
        i.driver === "D5" &&
        (i.layer === "L2" || i.layer === "L3" || i.layer === "L4")
    );
    expect(d5Capacity).toHaveLength(0);
  });

  it("L2/L3/L4 items have a source field (GOR traceability)", () => {
    const capacityItems = dataset.items.filter(
      (i) => i.layer === "L2" || i.layer === "L3" || i.layer === "L4"
    );
    for (const item of capacityItems) {
      expect(item.source).toBeDefined();
      expect(typeof item.source).toBe("string");
      expect((item.source as string).length).toBeGreaterThan(0);
    }
  });

  it("L1 items with critical lines have gap='critica'", () => {
    // L01, L02, L04, L06, L11, L12, L21 per Tabla 11 brecha Crítica
    const criticalCodes = ["L01", "L02", "L04", "L06", "L11", "L12", "L21"];
    for (const code of criticalCodes) {
      const item = dataset.items.find(
        (i) => i.layer === "L1" && i.meta?.code === code
      );
      expect(item, `Expected L1 item for code ${code}`).toBeDefined();
      expect(item?.gap).toBe("critica");
    }
  });

  it("all items have unique ids", () => {
    const ids = dataset.items.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
