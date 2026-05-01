import { describe, it, expect } from "vitest";
import { migrateSchema } from "./";
import type { RadarSchema } from "../types";

const VALID_SCHEMA: RadarSchema = {
  $schemaVersion: "1.0.0",
  id: "test",
  title: "Test",
  rings: [
    { id: "r1", label: "R1", order: 0, innerRadius: 0, outerRadius: 100, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
    { id: "r2", label: "R2", order: 1, innerRadius: 100, outerRadius: 200, color: "#000", fillColor: "#fff", borderColor: "#ccc", labelColor: "#000" },
  ],
  sectors: [{ id: "s1", label: "S1", color: "#f00" }],
  items: [{ id: "i1", name: "Item", sectorId: "s1", ringId: "r1", angleOff: 0 }],
};

describe("migrateSchema", () => {
  it("returns identity for same version", () => {
    const result = migrateSchema(VALID_SCHEMA, "1.0.0");
    expect(result.id).toBe("test");
    expect(result.$schemaVersion).toBe("1.0.0");
  });

  it("re-validates after migration", () => {
    const result = migrateSchema(VALID_SCHEMA, "1.0.0");
    expect(result.rings).toHaveLength(2);
    expect(result.sectors).toHaveLength(1);
  });

  it("throws for invalid input", () => {
    expect(() => migrateSchema("not an object", "1.0.0")).toThrow("Input must be an object");
  });

  it("throws for missing version", () => {
    expect(() => migrateSchema({ id: "test" }, "1.0.0")).toThrow("Missing $schemaVersion");
  });

  it("throws for unsupported target version", () => {
    expect(() => migrateSchema(VALID_SCHEMA, "99.0.0")).toThrow("not implemented");
  });

  it("throws for invalid schema post-migration", () => {
    const badSchema = { ...VALID_SCHEMA, rings: [VALID_SCHEMA.rings[0]] };
    // Single ring fails validation (needs >= 2)
    expect(() => migrateSchema(badSchema, "1.0.0")).toThrow("Post-migration validation failed");
  });
});
