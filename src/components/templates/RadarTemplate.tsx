"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Technology, ActiveFilters } from "@/types/radar";
import { TECHNOLOGIES } from "@/lib/radar-data";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { RadarChart } from "@/components/organisms/RadarChart";
import { TechDetail } from "@/components/organisms/TechDetail";
import { NomenclatureTable } from "@/components/organisms/NomenclatureTable";
import { RadarLegend } from "@/components/organisms/RadarLegend";
import { FilterSidebar } from "@/components/molecules/FilterSidebar";
import { ZoomControls } from "@/components/molecules/ZoomControls";
import { MobileLayout } from "./MobileLayout";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { List, ChevronDown } from "lucide-react";
import { svgToCanvas } from "@/core/export";
import { useZoomPan } from "@/hooks/useZoomPan";

/* ─── Export helpers ─────────────────────────────────────────── */

async function downloadPNG(svgEl: SVGSVGElement) {
  const canvas = await svgToCanvas(svgEl, 3);
  const link = document.createElement("a");
  link.download = "Radar_Tecnologico_CEET_2025-2035.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function downloadPDF(svgEl: SVGSVGElement) {
  const canvas = await svgToCanvas(svgEl, 3);
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Calculate image size maintaining original aspect ratio (viewBox: 1200 × 1060)
  const imgMaxW = pageW - 20;
  const imgMaxH = pageH - 20;
  const imgRatio = canvas.width / canvas.height; // 3600/3180 ≈ 1.13
  let imgW: number, imgH: number;
  if (imgMaxW / imgMaxH > imgRatio) {
    imgH = imgMaxH;
    imgW = imgH * imgRatio;
  } else {
    imgW = imgMaxW;
    imgH = imgW / imgRatio;
  }
  const xOff = (pageW - imgW) / 2;
  const yOff = (pageH - imgH) / 2;

  pdf.addImage(imgData, "PNG", xOff, yOff, imgW, imgH);
  pdf.save("Radar_Tecnologico_CEET_2025-2035.pdf");
}

/* ─── Main Component ─────────────────────────────────────────── */

export function RadarTemplate() {
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>({
    sectors: new Set([0, 1, 2, 3, 4]),
    rings: new Set([0, 1, 2, 3]),
  });
  const [exporting, setExporting] = useState(false);

  const {
    zoom: zoomLevel,
    pan,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useZoomPan();

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const [mobileNode, setMobileNode] = useState<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredTechs = TECHNOLOGIES.filter(
    (t) => filters.sectors.has(t.sector) && filters.rings.has(t.ring),
  );

  const toggleSector = useCallback((i: number) => {
    setFilters((prev) => {
      const next = new Set(prev.sectors);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return { ...prev, sectors: next };
    });
  }, []);

  const toggleRing = useCallback((i: number) => {
    setFilters((prev) => {
      const next = new Set(prev.rings);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return { ...prev, rings: next };
    });
  }, []);

  const handleSelect = useCallback((tech: Technology | null) => {
    setSelectedTech(tech);
  }, []);

  const handleResetView = useCallback(() => {
    reset();
    setSelectedTech(null);
    setHoveredTech(null);
  }, [reset]);

  const attachListeners = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return () => {};
      el.style.cursor = "grab";
      el.addEventListener("wheel", handleWheel, { passive: false });
      el.addEventListener("mousedown", handleMouseDown);
      el.addEventListener("touchstart", handleTouchStart, { passive: false });
      el.addEventListener("touchmove", handleTouchMove, { passive: false });
      el.addEventListener("touchend", handleTouchEnd);
      return () => {
        el.removeEventListener("wheel", handleWheel);
        el.removeEventListener("mousedown", handleMouseDown);
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchmove", handleTouchMove);
        el.removeEventListener("touchend", handleTouchEnd);
      };
    },
    [handleWheel, handleMouseDown, handleTouchStart, handleTouchMove, handleTouchEnd],
  );

  useEffect(() => {
    return attachListeners(desktopContainerRef.current);
  }, [attachListeners]);

  useEffect(() => {
    return attachListeners(mobileNode);
  }, [attachListeners, mobileNode]);

  const setMobileRef = useCallback((node: HTMLDivElement | null) => {
    setMobileNode(node);
  }, []);

  const handleExport = async (fn: (svg: SVGSVGElement) => Promise<void>) => {
    if (!svgRef.current || exporting) return;
    setExporting(true);
    try {
      await fn(svgRef.current);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setExporting(false);
  };

  const activeTech = selectedTech || hoveredTech;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* Mobile */}
      <MobileLayout
        filteredTechs={filteredTechs}
        selectedTech={selectedTech}
        hoveredTech={hoveredTech}
        activeTech={activeTech}
        filters={filters}
        toggleSector={toggleSector}
        toggleRing={toggleRing}
        onSelect={handleSelect}
        onHover={setHoveredTech}
        zoomLevel={zoomLevel}
        pan={pan}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={handleResetView}
        onExportPNG={() => handleExport(downloadPNG)}
        onExportPDF={() => handleExport(downloadPDF)}
        exporting={exporting}
        svgRef={svgRef}
        setMobileRef={setMobileRef}
      />

      {/* Desktop */}
      <main className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        <FilterSidebar
          filters={filters}
          toggleSector={toggleSector}
          toggleRing={toggleRing}
          filteredCount={filteredTechs.length}
          onExportPNG={() => handleExport(downloadPNG)}
          onExportPDF={() => handleExport(downloadPDF)}
          exporting={exporting}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-hidden relative"
            ref={desktopContainerRef}
          >
            <ZoomControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onReset={handleResetView}
              zoomLevel={zoomLevel}
              className="absolute top-4 right-4 z-10"
            />

            <div
              style={{
                transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                transition: "transform 0.1s ease-out",
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <RadarChart
                ref={svgRef}
                filteredTechs={filteredTechs}
                selectedTech={selectedTech}
                hoveredTech={hoveredTech}
                activeSectors={filters.sectors}
                activeRings={filters.rings}
                onSelect={handleSelect}
                onHover={setHoveredTech}
              />
            </div>
          </div>
        </div>

        <aside className="w-[350px] min-w-[350px] max-w-[350px] flex-shrink-0 border-l bg-card/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <TechDetail tech={activeTech} />
            <Separator />
            <div className="p-3">
              <RadarLegend />
            </div>
            <Separator />
            <details className="p-3 group">
              <summary className="flex items-center gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <List className="w-3.5 h-3.5 text-sena-green" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Nomenclaturas
                </span>
                <Badge variant="outline" className="text-[9px] ml-auto mr-1">
                  {filteredTechs.length} tecn.
                </Badge>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform details-chevron" />
              </summary>
              <div className="mt-2">
                <NomenclatureTable
                  filteredTechs={filteredTechs}
                  selectedTech={selectedTech}
                  onSelect={handleSelect}
                />
              </div>
            </details>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
