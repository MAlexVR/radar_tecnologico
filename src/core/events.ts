import type { ItemId } from "./types";
import type { FilterState } from "./filters";

export type RadarEvent =
  | {
      type: "item:select";
      itemId: ItemId | null;
      source: "click" | "table" | "url" | "keyboard";
    }
  | {
      type: "item:hover";
      itemId: ItemId | null;
      source: "pointer" | "keyboard";
    }
  | { type: "filter:change"; filters: FilterState }
  | {
      type: "viewport:change";
      viewport: { zoom: number; pan: { x: number; y: number } };
    }
  | { type: "export"; format: "png" | "pdf" | "svg" }
  | { type: "schema:error"; error: { path: string; message: string } };

export type RadarEventHandler = (event: RadarEvent) => void;

/**
 * No-op event handler for when telemetry is disabled.
 */
export const noopEventHandler: RadarEventHandler = () => {};
