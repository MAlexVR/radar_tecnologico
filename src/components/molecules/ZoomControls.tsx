"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  zoomLevel: number;
  className?: string;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  zoomLevel,
  className = "",
}: ZoomControlsProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Button
        size="icon"
        onClick={onZoomIn}
        title="Zoom In"
        className="bg-sena-green/80 text-white border border-sena-green/30 hover:bg-sena-green"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        onClick={onZoomOut}
        title="Zoom Out"
        className="bg-sena-green/80 text-white border border-sena-green/30 hover:bg-sena-green"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        onClick={onReset}
        title="Reset View"
        className="bg-sena-green/80 text-white border border-sena-green/30 hover:bg-sena-green"
      >
        <Maximize className="w-4 h-4" />
      </Button>
      {zoomLevel !== 1 && (
        <span className="text-[10px] text-center text-muted-foreground font-mono">
          {Math.round(zoomLevel * 100)}%
        </span>
      )}
    </div>
  );
}
