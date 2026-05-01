import { describe, it, expect } from "vitest";
import { TRL, NPS, registerScale, getScale, resolveMaturityColor, resolveMaturityLabel } from "./";
import type { MaturityScale, MaturityValue } from "../types";

function createRegistry(): Map<string, MaturityScale> {
  const registry = new Map<string, MaturityScale>();
  registerScale(registry, TRL);
  registerScale(registry, NPS);
  return registry;
}

describe("TRL scale", () => {
  it("returns correct color for TRL 8", () => {
    expect(TRL.colorFor(8)).toBe("#C62828");
  });

  it("returns correct color for TRL 4", () => {
    expect(TRL.colorFor(4)).toBe("#FDC300");
  });

  it("returns correct label for TRL 1", () => {
    expect(TRL.labelFor(1)).toBe("TRL 1-2 (Inicial)");
  });

  it("returns correct label for TRL 9", () => {
    expect(TRL.labelFor(9)).toBe("TRL 7-9 (Alto)");
  });
});

describe("NPS scale", () => {
  it("returns detractor color for -50", () => {
    expect(NPS.colorFor(-50)).toBe("#C62828");
  });

  it("returns promoter color for 50", () => {
    expect(NPS.colorFor(50)).toBe("#2E7D32");
  });
});

describe("registerScale / getScale", () => {
  it("registers and retrieves a custom scale", () => {
    const registry = new Map<string, MaturityScale>();
    const custom: MaturityScale = {
      id: "custom",
      label: "Custom",
      min: 0,
      max: 10,
      buckets: [{ rangeStart: 0, rangeEnd: 10, label: "All", color: "#000" }],
      colorFor: () => "#000",
      labelFor: () => "All",
    };
    registerScale(registry, custom);
    expect(getScale(registry, "custom")).toBe(custom);
  });

  it("returns undefined for unknown scale", () => {
    const registry = new Map<string, MaturityScale>();
    expect(getScale(registry, "nonexistent")).toBeUndefined();
  });
});

describe("resolveMaturityColor", () => {
  it("resolves TRL color", () => {
    const registry = createRegistry();
    const maturity: MaturityValue = { scaleId: "trl", value: 8 };
    expect(resolveMaturityColor(maturity, registry)).toBe("#C62828");
  });

  it("returns fallback for unknown scale", () => {
    const registry = new Map<string, MaturityScale>();
    const maturity: MaturityValue = { scaleId: "unknown", value: 5 };
    expect(resolveMaturityColor(maturity, registry)).toBe("#9e9e9e");
  });
});

describe("resolveMaturityLabel", () => {
  it("resolves TRL label", () => {
    const registry = createRegistry();
    const maturity: MaturityValue = { scaleId: "trl", value: 5 };
    expect(resolveMaturityLabel(maturity, registry)).toBe("TRL 5-6 (Medio)");
  });

  it("returns fallback for unknown scale", () => {
    const registry = new Map<string, MaturityScale>();
    const maturity: MaturityValue = { scaleId: "unknown", value: 5 };
    expect(resolveMaturityLabel(maturity, registry)).toBe("Unknown scale: unknown");
  });
});
