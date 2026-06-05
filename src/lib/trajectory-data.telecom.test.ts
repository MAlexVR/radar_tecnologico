/**
 * Tests for the telecom trajectory adapter.
 *
 * Verifies:
 *   1. telecomConfig passes validateTrajectoryConfig without throwing.
 *   2. buildTelecomTrajectory() returns a non-empty items array.
 *   3. All drivers (D1–D5) have items in L2, L3, and L4.
 *   4. All items have a valid horizon (within the 5 buckets defined in config).
 *   5. All items have a valid driver (within the drivers defined in config).
 *   6. L1 covers all 5 drivers (D1–D5).
 *   7. New items from v2.3.0 audit (ALTA+MEDIA gaps) are present.
 *
 * Coverage matrix v2.3.0:
 *   D1: L2=1, L3=4, L4=4 (+ Huawei)
 *   D2: L2=3, L3=4 (+ FWA), L4=4
 *   D3: L2=3, L3=5 (+ Edge/MEC, Network Slicing), L4=4
 *   D4: L2=1, L3=2, L4=3
 *   D5: L2=3 (+ Lab ciber avanzado), L3=4 (+ GICS Redes Verdes), L4=3
 *   L1: 24 | L2-L4: 48 | Total: 72
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

  it("colorFor returns red class for gap='Crítica'", () => {
    const item = {
      id: "t",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      gap: "Crítica",
    };
    expect(telecomConfig.colorFor(item)).toContain("red");
  });

  it("colorFor returns amber class for gap='Alta'", () => {
    const item = {
      id: "t",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      gap: "Alta",
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

  it("D2 has at least one item in L2 (infraestructura)", () => {
    const d2L2 = dataset.items.filter(
      (i) => i.driver === "D2" && i.layer === "L2"
    );
    expect(d2L2.length).toBeGreaterThan(0);
  });

  it("D2 has at least one item in L3 (talento & I+D+i)", () => {
    const d2L3 = dataset.items.filter(
      (i) => i.driver === "D2" && i.layer === "L3"
    );
    expect(d2L3.length).toBeGreaterThan(0);
  });

  it("D2 has at least one item in L4 (alianzas)", () => {
    const d2L4 = dataset.items.filter(
      (i) => i.driver === "D2" && i.layer === "L4"
    );
    expect(d2L4.length).toBeGreaterThan(0);
  });

  it("D4 has at least one item in L2 (infraestructura)", () => {
    const d4L2 = dataset.items.filter(
      (i) => i.driver === "D4" && i.layer === "L2"
    );
    expect(d4L2.length).toBeGreaterThan(0);
  });

  it("D4 has at least one item in L3 (talento & I+D+i)", () => {
    const d4L3 = dataset.items.filter(
      (i) => i.driver === "D4" && i.layer === "L3"
    );
    expect(d4L3.length).toBeGreaterThan(0);
  });

  it("D4 has at least one item in L4 (alianzas)", () => {
    const d4L4 = dataset.items.filter(
      (i) => i.driver === "D4" && i.layer === "L4"
    );
    expect(d4L4.length).toBeGreaterThan(0);
  });

  it("D5 has at least one item in L2 (infraestructura)", () => {
    const d5L2 = dataset.items.filter(
      (i) => i.driver === "D5" && i.layer === "L2"
    );
    expect(d5L2.length).toBeGreaterThan(0);
  });

  it("D5 has at least one item in L3 (talento & I+D+i)", () => {
    const d5L3 = dataset.items.filter(
      (i) => i.driver === "D5" && i.layer === "L3"
    );
    expect(d5L3.length).toBeGreaterThan(0);
  });

  it("D5 has at least one item in L4 (alianzas)", () => {
    const d5L4 = dataset.items.filter(
      (i) => i.driver === "D5" && i.layer === "L4"
    );
    expect(d5L4.length).toBeGreaterThan(0);
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

  it("L1 items with critical lines have gap='Crítica'", () => {
    // L01, L02, L04, L06, L11, L12, L21 per Tabla 11 brecha Crítica
    const criticalCodes = ["L01", "L02", "L04", "L06", "L11", "L12", "L21"];
    for (const code of criticalCodes) {
      const item = dataset.items.find(
        (i) => i.layer === "L1" && i.meta?.Código === code
      );
      expect(item, `Expected L1 item for code ${code}`).toBeDefined();
      expect(item?.gap).toBe("Crítica");
    }
  });

  it("all items have unique ids", () => {
    const ids = dataset.items.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  // ── v2.3.0: coverage matrix checks ────────────────────────────────────────

  it("total items is 72 (24 L1 + 48 L2/L3/L4) — v2.3.0 full coverage", () => {
    expect(dataset.items).toHaveLength(72);
  });

  it("L2/L3/L4 items total 48 — v2.3.0", () => {
    const capacity = dataset.items.filter(
      (i) => i.layer === "L2" || i.layer === "L3" || i.layer === "L4"
    );
    expect(capacity).toHaveLength(48);
  });

  it("D1 has 4 items in L4 (includes Huawei — gap ALTA v2.3.0)", () => {
    const d1L4 = dataset.items.filter(
      (i) => i.driver === "D1" && i.layer === "L4"
    );
    expect(d1L4.length).toBeGreaterThanOrEqual(4);
  });

  it("D1 L4 includes Huawei Technologies (d1-l4-huawei)", () => {
    const huawei = dataset.items.find((i) => i.id === "d1-l4-huawei");
    expect(huawei).toBeDefined();
    expect(huawei?.layer).toBe("L4");
    expect(huawei?.driver).toBe("D1");
    expect(huawei?.gap).toBe("Alta");
  });

  it("D2 has 4 items in L3 (includes FWA actualización curricular — gap ALTA v2.3.0)", () => {
    const d2L3 = dataset.items.filter(
      (i) => i.driver === "D2" && i.layer === "L3"
    );
    expect(d2L3.length).toBeGreaterThanOrEqual(4);
  });

  it("D2 L3 includes FWA actualización curricular (d2-l3-actualizacion-curricular-fwa)", () => {
    const fwa = dataset.items.find(
      (i) => i.id === "d2-l3-actualizacion-curricular-fwa"
    );
    expect(fwa).toBeDefined();
    expect(fwa?.layer).toBe("L3");
    expect(fwa?.driver).toBe("D2");
    expect(fwa?.gap).toBe("Alta");
    expect(fwa?.meta?.Línea).toBe("L09");
  });

  it("D3 has 5 items in L3 (includes Edge/MEC and Network Slicing — gap ALTA v2.3.0)", () => {
    const d3L3 = dataset.items.filter(
      (i) => i.driver === "D3" && i.layer === "L3"
    );
    expect(d3L3.length).toBeGreaterThanOrEqual(5);
  });

  it("D3 L3 includes Edge/MEC formación (d3-l3-formacion-edge-mec)", () => {
    const edge = dataset.items.find((i) => i.id === "d3-l3-formacion-edge-mec");
    expect(edge).toBeDefined();
    expect(edge?.layer).toBe("L3");
    expect(edge?.driver).toBe("D3");
    expect(edge?.gap).toBe("Alta");
    expect(edge?.meta?.Línea).toBe("L13");
  });

  it("D3 L3 includes Network Slicing formación (d3-l3-formacion-network-slicing)", () => {
    const slicing = dataset.items.find(
      (i) => i.id === "d3-l3-formacion-network-slicing"
    );
    expect(slicing).toBeDefined();
    expect(slicing?.layer).toBe("L3");
    expect(slicing?.driver).toBe("D3");
    expect(slicing?.gap).toBe("Alta");
    expect(slicing?.meta?.Línea).toBe("L14");
  });

  it("D5 has 3 items in L2 (includes lab ciber avanzado — gap ALTA v2.3.0)", () => {
    const d5L2 = dataset.items.filter(
      (i) => i.driver === "D5" && i.layer === "L2"
    );
    expect(d5L2.length).toBeGreaterThanOrEqual(3);
  });

  it("D5 L2 includes lab ciberseguridad avanzado (d5-l2-lab-ciberseguridad-avanzado)", () => {
    const labCiber = dataset.items.find(
      (i) => i.id === "d5-l2-lab-ciberseguridad-avanzado"
    );
    expect(labCiber).toBeDefined();
    expect(labCiber?.layer).toBe("L2");
    expect(labCiber?.driver).toBe("D5");
    expect(labCiber?.gap).toBe("Alta");
  });

  it("D5 has 4 items in L3 (includes GICS Redes Verdes — gap ALTA v2.3.0)", () => {
    const d5L3 = dataset.items.filter(
      (i) => i.driver === "D5" && i.layer === "L3"
    );
    expect(d5L3.length).toBeGreaterThanOrEqual(4);
  });

  it("D5 L3 includes proyecto GICS Redes Verdes (d5-l3-proyecto-gics-redes-verdes)", () => {
    const gics = dataset.items.find(
      (i) => i.id === "d5-l3-proyecto-gics-redes-verdes"
    );
    expect(gics).toBeDefined();
    expect(gics?.layer).toBe("L3");
    expect(gics?.driver).toBe("D5");
    expect(gics?.gap).toBe("Alta");
    expect(gics?.meta?.Línea).toBe("L23");
  });

  it("all new v2.3.0 items have a non-empty source field", () => {
    const newIds = [
      "d1-l4-huawei",
      "d2-l3-actualizacion-curricular-fwa",
      "d3-l3-formacion-edge-mec",
      "d3-l3-formacion-network-slicing",
      "d5-l2-lab-ciberseguridad-avanzado",
      "d5-l3-proyecto-gics-redes-verdes",
    ];
    for (const id of newIds) {
      const item = dataset.items.find((i) => i.id === id);
      expect(item, `Expected item with id ${id}`).toBeDefined();
      expect(item?.source).toBeDefined();
      expect((item?.source as string).length).toBeGreaterThan(0);
    }
  });
});
