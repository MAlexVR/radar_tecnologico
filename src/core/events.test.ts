import { describe, it, expect } from "vitest";
import type { RadarEvent, RadarEventHandler } from "./";
import { noopEventHandler } from "./";

describe("RadarEvent type", () => {
  it("accepts item:select event", () => {
    const event: RadarEvent = {
      type: "item:select",
      itemId: "i1",
      source: "click",
    };
    expect(event.type).toBe("item:select");
  });

  it("accepts item:hover event", () => {
    const event: RadarEvent = {
      type: "item:hover",
      itemId: null,
      source: "pointer",
    };
    expect(event.itemId).toBeNull();
  });

  it("accepts filter:change event", () => {
    const event: RadarEvent = {
      type: "filter:change",
      filters: { sectors: new Set(["s1"]), rings: new Set(["r1"]) },
    };
    expect(event.filters.sectors.has("s1")).toBe(true);
  });

  it("accepts viewport:change event", () => {
    const event: RadarEvent = {
      type: "viewport:change",
      viewport: { zoom: 2, pan: { x: 10, y: 20 } },
    };
    expect(event.viewport.zoom).toBe(2);
  });

  it("accepts export event", () => {
    const event: RadarEvent = {
      type: "export",
      format: "png",
    };
    expect(event.format).toBe("png");
  });

  it("accepts schema:error event", () => {
    const event: RadarEvent = {
      type: "schema:error",
      error: { path: "rings", message: "At least 2 rings required" },
    };
    expect(event.error.path).toBe("rings");
  });
});

describe("noopEventHandler", () => {
  it("does not throw", () => {
    const event: RadarEvent = { type: "item:select", itemId: "i1", source: "click" };
    expect(() => noopEventHandler(event)).not.toThrow();
  });
});
