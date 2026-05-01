import { describe, it, expect } from "vitest";
import { validateSchema, assertSchemaVersion, SUPPORTED_SCHEMA_VERSIONS } from "./validation";
import type { RadarSchema } from "./types";

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

describe("validateSchema", () => {
  it("accepts a valid schema", () => {
    const result = validateSchema(VALID_SCHEMA);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.id).toBe("test");
    }
  });

  it("rejects schema with less than 2 rings", () => {
    const bad = { ...VALID_SCHEMA, rings: [VALID_SCHEMA.rings[0]] };
    const result = validateSchema(bad);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.message.includes("At least 2 rings"))).toBe(true);
    }
  });

  it("rejects schema with no sectors", () => {
    const bad = { ...VALID_SCHEMA, sectors: [] };
    const result = validateSchema(bad);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.message.includes("At least 1 sector"))).toBe(true);
    }
  });

  it("rejects non-object input", () => {
    const result = validateSchema("not an object");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid schema version format", () => {
    const bad = { ...VALID_SCHEMA, $schemaVersion: "invalid" };
    const result = validateSchema(bad);
    expect(result.valid).toBe(false);
  });
});

describe("assertSchemaVersion", () => {
  it("accepts supported version", () => {
    expect(() => assertSchemaVersion("1.0.0")).not.toThrow();
  });

  it("rejects unsupported version", () => {
    expect(() => assertSchemaVersion("99.0.0")).toThrow("Unsupported schema version");
  });
});

describe("SUPPORTED_SCHEMA_VERSIONS", () => {
  it("includes 1.0.0", () => {
    expect(SUPPORTED_SCHEMA_VERSIONS).toContain("1.0.0");
  });
});
