import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useZoomPan } from "./useZoomPan";

describe("useZoomPan", () => {
  it("starts with zoom=1, pan={0,0}, isDragging=false", () => {
    const { result } = renderHook(() => useZoomPan());
    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
    expect(result.current.isDragging).toBe(false);
  });

  it("zoomIn / zoomOut clamp to bounds", () => {
    const { result } = renderHook(() =>
      useZoomPan({ minZoom: 0.5, maxZoom: 2, zoomStep: 1 }),
    );
    act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(2);
    act(() => result.current.zoomIn()); // already at max
    expect(result.current.zoom).toBe(2);

    act(() => result.current.zoomOut());
    expect(result.current.zoom).toBe(1);
    act(() => result.current.zoomOut());
    expect(result.current.zoom).toBe(0.5);
    act(() => result.current.zoomOut()); // already at min
    expect(result.current.zoom).toBe(0.5);
  });

  it("reset returns to defaults", () => {
    const { result } = renderHook(() => useZoomPan());
    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).not.toBe(1);
    act(() => {
      result.current.reset();
    });
    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  it("flips isDragging on touchstart with one finger", () => {
    const { result } = renderHook(() => useZoomPan());
    expect(result.current.isDragging).toBe(false);
    const touch = { clientX: 0, clientY: 0 } as Touch;
    const evt = {
      cancelable: true,
      touches: [touch] as unknown as TouchList,
      preventDefault: () => {},
    } as unknown as TouchEvent;
    act(() => {
      result.current.handleTouchStart(evt);
    });
    expect(result.current.isDragging).toBe(true);

    act(() => {
      result.current.handleTouchEnd();
    });
    expect(result.current.isDragging).toBe(false);
  });

  it("flips isDragging on left-button mousedown", () => {
    const { result } = renderHook(() => useZoomPan());

    const target = document.createElement("div");
    const evt = {
      button: 0,
      clientX: 10,
      clientY: 20,
      currentTarget: target,
      preventDefault: () => {},
    } as unknown as MouseEvent;
    act(() => {
      result.current.handleMouseDown(evt);
    });
    expect(result.current.isDragging).toBe(true);
    expect(target.style.cursor).toBe("grabbing");
  });

  it("ignores mousedown for non-left buttons", () => {
    const { result } = renderHook(() => useZoomPan());
    const target = document.createElement("div");
    const evt = {
      button: 2,
      clientX: 10,
      clientY: 20,
      currentTarget: target,
      preventDefault: () => {},
    } as unknown as MouseEvent;
    act(() => {
      result.current.handleMouseDown(evt);
    });
    expect(result.current.isDragging).toBe(false);
  });
});
