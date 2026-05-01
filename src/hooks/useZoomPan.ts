"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseZoomPanOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  wheelSensitivity?: number;
}

/**
 * Hook for zoom + pan + pinch on a target element.
 *
 * Listeners attached to the container go via {handleWheel,handleMouseDown,
 * handleTouchStart,handleTouchMove,handleTouchEnd}. Listeners attached to
 * window (mousemove/mouseup) are subscribed *only while drag is active*,
 * driven by `isDragging` state to make the effect re-run on transitions.
 */
export function useZoomPan(opts: UseZoomPanOptions = {}) {
  const {
    minZoom = 0.5,
    maxZoom = 4,
    zoomStep = 0.25,
    wheelSensitivity = 0.0015,
  } = opts;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const panRef = useRef(pan);
  panRef.current = pan;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef(0);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      const delta = -e.deltaY * wheelSensitivity;

      setZoom((prevZoom) => {
        const newZoom = Math.min(Math.max(prevZoom + delta, minZoom), maxZoom);
        const scaleRatio = newZoom / prevZoom;
        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * scaleRatio,
          y: mouseY - (mouseY - prevPan.y) * scaleRatio,
        }));
        return newZoom;
      });
    },
    [minZoom, maxZoom, wheelSensitivity],
  );

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    const target = e.currentTarget as HTMLElement | null;
    if (target) target.style.cursor = "grabbing";
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      lastTouchDistanceRef.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const dx =
          (e.touches[0].clientX - dragStartRef.current.x) / zoomRef.current;
        const dy =
          (e.touches[0].clientY - dragStartRef.current.y) / zoomRef.current;
        setPan({
          x: panRef.current.x + dx,
          y: panRef.current.y + dy,
        });
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2 && lastTouchDistanceRef.current > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const scale = dist / lastTouchDistanceRef.current;
        setZoom((prev) => Math.min(Math.max(prev * scale, minZoom), maxZoom));
        lastTouchDistanceRef.current = dist;
      }
    },
    [minZoom, maxZoom, isDragging],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastTouchDistanceRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStartRef.current.x) / zoomRef.current;
      const dy = (e.clientY - dragStartRef.current.y) / zoomRef.current;
      setPan({
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      });
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    zoom,
    pan,
    isDragging,
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
