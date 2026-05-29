"use client";

/**
 * TrajectoryModal — Radix Dialog wrapper for the Trajectory Map.
 *
 * Integration layer: this molecule is allowed to import the domain adapter
 * (trajectory-data.telecom) because it sits outside the motor/engine
 * architectural boundary enforced by arch.test.ts.
 *
 * Layout:
 *   - Mobile: full-screen (like AboutModal / HelpModal)
 *   - Desktop: nearly full-screen (w-[98vw] max-w-[1400px] h-[92vh]) with flex-col
 *   - Right panel: TrajectoryDetail when an item is selected (desktop side-by-side,
 *     mobile stacked below the map)
 */

import { useState, useRef, useCallback, useMemo } from "react";
import { FileDown, Loader2, Map } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrajectoryMap, TrajectoryDetail } from "@/components/trajectory";
import type { TrajectoryItem } from "@/lib/trajectory";
import { telecomConfig, buildTelecomTrajectory } from "@/lib/trajectory-data.telecom";
import { downloadElementAsPDF } from "@/core";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrajectoryModal({ open, onOpenChange }: TrajectoryModalProps) {
  const t = useTranslations("trajectory");
  const tHeader = useTranslations("header");

  // Build dataset once — telecomConfig and buildTelecomTrajectory are pure
  const dataset = useMemo(() => buildTelecomTrajectory(), []);

  // Local selection state — toggling the same item deselects it
  const [selected, setSelected] = useState<TrajectoryItem | null>(null);

  const handleSelect = useCallback(
    (item: TrajectoryItem) =>
      setSelected((prev) => (prev?.id === item.id ? null : item)),
    []
  );

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Ref to the map container for PDF capture
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!mapContainerRef.current) return;
    setExporting(true);
    setExportError(null);
    try {
      await downloadElementAsPDF(mapContainerRef.current, {
        title: tHeader("trajectory"),
        filename: "Mapa_Trayectoria_CEET.pdf",
      });
    } catch {
      setExportError(t("exportError"));
    } finally {
      setExporting(false);
    }
  }, [t, tHeader]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          // Mobile: full-screen (same pattern as AboutModal / HelpModal)
          "fixed inset-0 top-0 left-0 translate-x-0 translate-y-0",
          "w-full h-[100dvh] max-w-none border-none rounded-none",
          // Desktop: nearly full-screen, centered
          "md:inset-auto md:top-[50%] md:left-[50%] md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-[98vw] md:max-w-[1400px] md:h-[92vh]",
          "md:border md:rounded-xl",
          // Layout
          "flex flex-col p-0 gap-0 overflow-hidden z-50",
        ].join(" ")}
        aria-describedby="trajectory-modal-description"
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        {/* pr-12 reserves space so the export button never overlaps the native Dialog close × (right-4 top-4) */}
        <DialogHeader className="px-5 pr-12 py-3 border-b bg-muted/20 flex-none m-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Map className="w-5 h-5 text-sena-green shrink-0" aria-hidden />
              <DialogTitle className="text-lg text-sena-blue truncate">
                {t("title")}
              </DialogTitle>
            </div>

            {/* Export button */}
            <button
              data-testid="trajectory-export-btn"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sena-blue border border-sena-blue/30 hover:bg-sena-blue/10 transition-colors font-medium disabled:opacity-60 shrink-0"
              aria-label={exporting ? t("exportingPDF") : t("exportPDF")}
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <FileDown size={14} aria-hidden />
              )}
              <span className="hidden sm:inline">
                {exporting ? t("exportingPDF") : t("exportPDF")}
              </span>
            </button>
          </div>

          <DialogDescription
            id="trajectory-modal-description"
            className="text-xs text-sena-gray-dark/80 mt-1 sr-only"
          >
            {t("description")}
          </DialogDescription>

          {exportError && (
            <p role="alert" className="text-xs text-red-600 mt-1">
              {exportError}
            </p>
          )}
        </DialogHeader>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-0">
          {/* Map area */}
          <div
            ref={mapContainerRef}
            className="flex-1 overflow-auto p-3 md:p-4"
          >
            <TrajectoryMap
              config={telecomConfig}
              dataset={dataset}
              onSelect={handleSelect}
            />
          </div>

          {/* Detail panel — lateral on desktop, stacked below on mobile */}
          {selected && (
            <div
              data-testid="trajectory-detail-panel"
              className={[
                "border-t md:border-t-0 md:border-l",
                "bg-muted/10",
                // Mobile: fixed height, scrollable
                "h-56 overflow-y-auto p-4",
                // Desktop: fixed width sidebar, full height scroll
                "md:h-auto md:w-80 md:shrink-0 md:overflow-y-auto md:p-4",
              ].join(" ")}
            >
              <TrajectoryDetail
                item={selected}
                config={telecomConfig}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>

        {/* ── Mobile close button (same pattern as AboutModal) ─────── */}
        <div className="flex-none p-4 border-t bg-muted/20 md:hidden">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-10 rounded-md border border-sena-gray-dark/20 text-sena-blue font-medium text-sm flex items-center justify-center"
          >
            {t("close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
