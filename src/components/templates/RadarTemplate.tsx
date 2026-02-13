"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Technology, ActiveFilters } from "@/types/radar";
import { RINGS, SECTORS, TECHNOLOGIES } from "@/lib/radar-data";
import { Header } from "@/components/organisms/Header";
import { RadarChart } from "@/components/organisms/RadarChart";
import { TechDetail } from "@/components/organisms/TechDetail";
import { NomenclatureTable } from "@/components/organisms/NomenclatureTable";
import { RadarLegend } from "@/components/organisms/RadarLegend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radar,
  List,
  Filter,
  Gauge,
  BarChart3,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileImage,
  FileText,
  ChevronDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ═══════════════════════════════════════════════════════════════
// SVG Export helpers (no external dependencies needed)
// ═══════════════════════════════════════════════════════════════
function svgToCanvas(
  svgEl: SVGSVGElement,
  scale = 3,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgEl.viewBox.baseVal.width * scale;
      canvas.height = svgEl.viewBox.baseVal.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

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
  // Dynamic import of jsPDF
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  // Title
  pdf.setFontSize(14);
  pdf.setTextColor(27, 94, 32);
  pdf.text(
    "Radar Tecnológico — Telecomunicaciones CEET 2025-2035",
    pageW / 2,
    12,
    { align: "center" },
  );
  // Radar image centered
  const imgSize = Math.min(pageW - 20, pageH - 30);
  const xOff = (pageW - imgSize) / 2;
  pdf.addImage(imgData, "PNG", xOff, 18, imgSize, imgSize);
  // Source
  pdf.setFontSize(7);
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    "Fuente: Elaboración propia basada en ejercicio VCyT CEET-GICS (2025). Metodología tipo Gartner Technology Radar.",
    pageW / 2,
    pageH - 5,
    { align: "center" },
  );
  pdf.save("Radar_Tecnologico_CEET_2025-2035.pdf");
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export function RadarTemplate() {
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>({
    sectors: new Set([0, 1, 2, 3, 4]),
    rings: new Set([0, 1, 2, 3]),
  });
  const [mobileTab, setMobileTab] = useState("radar");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [exporting, setExporting] = useState(false);
  const radarContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredTechs = TECHNOLOGIES.filter(
    (t) => filters.sectors.has(t.sector) && filters.rings.has(t.ring),
  );

  const toggleSector = useCallback((idx: number) => {
    setFilters((prev) => {
      const next = new Set(prev.sectors);
      if (next.has(idx)) {
        if (next.size > 1) next.delete(idx);
      } else {
        next.add(idx);
      }
      return { ...prev, sectors: next };
    });
  }, []);

  const toggleRing = useCallback((idx: number) => {
    setFilters((prev) => {
      const next = new Set(prev.rings);
      if (next.has(idx)) {
        if (next.size > 1) next.delete(idx);
      } else {
        next.add(idx);
      }
      return { ...prev, rings: next };
    });
  }, []);

  const handleSelect = useCallback((tech: Technology | null) => {
    setSelectedTech(tech);
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setSelectedTech(null);
  };

  // ── Drag-to-pan state (refs for use inside event handlers) ──
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);
  panRef.current = pan;
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  // ── Fixed wheel zoom + drag-to-pan: useEffect with passive: false ──
  useEffect(() => {
    const container = radarContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      const delta = -e.deltaY * 0.0015;

      setZoomLevel((prevZoom) => {
        const newZoom = Math.min(Math.max(prevZoom + delta, 0.5), 4);
        const scaleRatio = newZoom / prevZoom;
        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * scaleRatio,
          y: mouseY - (mouseY - prevPan.y) * scaleRatio,
        }));
        return newZoom;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // only left click
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (e.clientX - dragStartRef.current.x) / zoomRef.current;
      const dy = (e.clientY - dragStartRef.current.y) / zoomRef.current;
      setPan({
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      });
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        container.style.cursor = "grab";
      }
    };

    container.style.cursor = "grab";
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ── Export handlers ──
  const handleExportPNG = async () => {
    if (!svgRef.current || exporting) return;
    setExporting(true);
    try {
      await downloadPNG(svgRef.current);
    } catch (err) {
      console.error("PNG export failed:", err);
    }
    setExporting(false);
  };

  const handleExportPDF = async () => {
    if (!svgRef.current || exporting) return;
    setExporting(true);
    try {
      await downloadPDF(svgRef.current);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Para exportar a PDF instala jspdf: npm install jspdf");
    }
    setExporting(false);
  };

  const activeTech = selectedTech || hoveredTech;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      {/* ═══════ MOBILE LAYOUT ═══════ */}
      <main className="flex-1 container px-3 py-3 md:hidden overflow-y-auto">
        <Tabs
          value={mobileTab}
          onValueChange={setMobileTab}
          className="flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4 mb-3">
            <TabsTrigger value="radar" className="gap-1.5 text-xs">
              <Radar className="w-3.5 h-3.5" />
              Radar
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5 text-xs">
              <List className="w-3.5 h-3.5" />
              Tabla
            </TabsTrigger>
            <TabsTrigger value="detail" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              Detalle
            </TabsTrigger>
            <TabsTrigger value="legend" className="gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5" />
              Leyenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="radar">
            <Card>
              <CardContent className="p-2">
                <div className="relative overflow-hidden aspect-square flex items-center justify-center bg-white/5 rounded-lg border">
                  {/* Mobile Zoom Controls */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                    <Button
                      size="icon-sm"
                      onClick={handleZoomIn}
                      className="h-7 w-7 bg-background/80 backdrop-blur border shadow-sm hover:bg-background"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      onClick={handleZoomOut}
                      className="h-7 w-7 bg-background/80 backdrop-blur border shadow-sm hover:bg-background"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      onClick={handleResetZoom}
                      className="h-7 w-7 bg-background/80 backdrop-blur border shadow-sm hover:bg-background"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div
                    style={{
                      transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                      transition: "transform 0.1s ease-out",
                    }}
                    className="w-full h-full flex items-center justify-center"
                    // Touch handlers for panning could be added here if needed,
                    // but browser native zoom is now enabled too.
                  >
                    <RadarChart
                      ref={svgRef}
                      filteredTechs={filteredTechs}
                      selectedTech={selectedTech}
                      hoveredTech={hoveredTech}
                      activeSectors={filters.sectors}
                      activeRings={filters.rings}
                      onSelect={(t) => {
                        handleSelect(t);
                        if (t) setMobileTab("detail");
                      }}
                      onHover={setHoveredTech}
                    />
                  </div>
                </div>
                {/* Mobile export */}
                <div className="flex gap-2 mt-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPNG}
                    disabled={exporting}
                  >
                    <FileImage className="w-3.5 h-3.5 mr-1" /> PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={exporting}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
            <MobileFilters
              filters={filters}
              toggleSector={toggleSector}
              toggleRing={toggleRing}
              filteredCount={filteredTechs.length}
            />
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <List className="w-4 h-4 text-sena-cyan" />
                  Nomenclaturas — {filteredTechs.length} tecnologías
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 max-h-[60vh] overflow-y-auto">
                <NomenclatureTable
                  filteredTechs={filteredTechs}
                  selectedTech={selectedTech}
                  onSelect={(t) => {
                    handleSelect(t);
                    if (t) setMobileTab("detail");
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail">
            <Card>
              <CardContent className="p-0">
                <TechDetail tech={activeTech} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legend">
            <RadarLegend />
          </TabsContent>
        </Tabs>
      </main>

      {/* ═══════ DESKTOP LAYOUT ═══════ */}
      <main className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT SIDEBAR — Filters */}
        <aside className="w-[220px] flex-shrink-0 border-r bg-card/50 p-3 space-y-4 overflow-y-auto">
          {/* Sector filters */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Direccionadores
              </span>
            </div>
            {SECTORS.map((s, i) => {
              const isOn = filters.sectors.has(i);
              const count = TECHNOLOGIES.filter((t) => t.sector === i).length;
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSector(i)}
                  className={`
                    w-full flex items-center gap-2 px-2.5 py-2 rounded-lg mb-1
                    transition-all duration-150 text-left border-l-[3px]
                    ${
                      isOn
                        ? "bg-accent/30 border-l-current"
                        : "bg-transparent border-l-transparent opacity-40 hover:opacity-60"
                    }
                  `}
                  style={{ color: s.color }}
                >
                  <span className="text-xs">{s.icon}</span>
                  <span className="text-[11px] font-medium flex-1 leading-tight">
                    {s.label}
                  </span>
                  <span className="text-[9px] font-mono opacity-60">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <Separator />

          {/* Ring filters — now with fill color swatches */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
              Fase de Adopción
            </span>
            {RINGS.map((r, i) => {
              const isOn = filters.rings.has(i);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRing(i)}
                  className={`
                    w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1
                    transition-all duration-150 text-left
                    ${isOn ? "bg-muted" : "opacity-35 hover:opacity-50"}
                  `}
                >
                  <span
                    className="w-4 h-3 rounded-sm flex-shrink-0 border"
                    style={{
                      backgroundColor: r.fillColor,
                      borderColor: r.borderColor,
                      opacity: isOn ? 1 : 0.3,
                    }}
                  />
                  <span
                    className="text-[11px] font-medium flex-1"
                    style={{ color: isOn ? r.labelColor : undefined }}
                  >
                    {r.label}
                  </span>
                  <span className="text-[8px] text-muted-foreground">
                    {r.trl}
                  </span>
                </button>
              );
            })}
          </div>

          <Separator />

          {/* Temperature legend */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Gauge className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Nivel de TRL
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gradient-to-r from-[#4FC3F7] via-[#FDC300] via-[#E65100] to-[#C62828] mb-1.5" />
            <div className="flex justify-between text-[8px] text-muted-foreground">
              <span>Inicial (1-2)</span>
              <span>Alto (7-9)</span>
            </div>
          </div>

          {/* Export buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
              Exportar
            </span>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={handleExportPNG}
              disabled={exporting}
            >
              <FileImage className="w-3.5 h-3.5" />
              Guardar como PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              <FileText className="w-3.5 h-3.5" />
              Guardar como PDF
            </Button>
          </div>

          {/* Count */}
          <p className="text-[10px] text-muted-foreground text-center">
            {filteredTechs.length} / {TECHNOLOGIES.length} tecnologías
          </p>
        </aside>

        {/* CENTER — Radar + Legend + Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-hidden relative"
            ref={radarContainerRef}
          >
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Button
                size="icon"
                onClick={handleZoomIn}
                title="Zoom In"
                className="bg-sena-green/20 text-sena-green border border-sena-green/30 hover:bg-sena-green/30"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="bg-sena-green/20 text-sena-green border border-sena-green/30 hover:bg-sena-green/30"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleResetZoom}
                title="Reset View"
                className="bg-sena-green/20 text-sena-green border border-sena-green/30 hover:bg-sena-green/30"
              >
                <Maximize className="w-4 h-4" />
              </Button>
              {zoomLevel !== 1 && (
                <span className="text-[10px] text-center text-muted-foreground font-mono">
                  {Math.round(zoomLevel * 100)}%
                </span>
              )}
            </div>

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

        {/* RIGHT SIDEBAR — Detail + Legend + Nomenclature */}
        <aside className="w-[350px] max-w-[350px] flex-shrink-0 border-l bg-card/50 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <TechDetail tech={activeTech} />

            <Separator />

            {/* Legend — compact */}
            <div className="p-3">
              <RadarLegend />
            </div>

            <Separator />

            {/* Nomenclature — collapsible */}
            <details className="p-3 group">
              <summary className="flex items-center gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <List className="w-3.5 h-3.5 text-sena-cyan" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Nomenclaturas
                </span>
                <Badge variant="outline" className="text-[9px] ml-auto mr-1">
                  {filteredTechs.length} tecn.
                </Badge>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2">
                <NomenclatureTable
                  filteredTechs={filteredTechs}
                  selectedTech={selectedTech}
                  onSelect={handleSelect}
                />
              </div>
            </details>
          </ScrollArea>
        </aside>
      </main>

      {/* Compact footer with logos */}
      {/* Footer with logos */}
      <footer className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 border-t bg-card/50 px-4 py-4 md:py-2">
        <img
          src="/logo-centro-formacion.svg"
          alt="Centro de Electricidad, Electrónica y Telecomunicaciones"
          className="h-8 md:h-10 w-auto opacity-80"
        />
        <img
          src="/logo-grupo-investigacion.svg"
          alt="Grupo de Investigación GICS"
          className="h-8 md:h-10 w-auto opacity-80"
        />
      </footer>
    </div>
  );
}

// ─── Mobile filter chips ──────────────────────────────────────
function MobileFilters({
  filters,
  toggleSector,
  toggleRing,
  filteredCount,
}: {
  filters: ActiveFilters;
  toggleSector: (i: number) => void;
  toggleRing: (i: number) => void;
  filteredCount: number;
}) {
  return (
    <div className="mt-3 space-y-2">
      {/* Sector chips */}
      <div className="flex flex-wrap gap-1.5">
        {SECTORS.map((s, i) => {
          const isOn = filters.sectors.has(i);
          return (
            <button
              key={s.id}
              onClick={() => toggleSector(i)}
              className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold
                transition-all border
                ${
                  isOn
                    ? "border-current bg-accent/30"
                    : "border-transparent bg-muted opacity-40"
                }
              `}
              style={{ color: isOn ? s.color : undefined }}
            >
              <span>{s.icon}</span>
              {s.id}
            </button>
          );
        })}
      </div>
      {/* Ring chips */}
      <div className="flex flex-wrap gap-1.5">
        {RINGS.map((r, i) => {
          const isOn = filters.rings.has(i);
          return (
            <button
              key={r.id}
              onClick={() => toggleRing(i)}
              className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium
                transition-all border
                ${isOn ? "border-border bg-muted" : "border-transparent bg-muted/50 opacity-40"}
              `}
            >
              <span
                className="w-3 h-2 rounded-sm border"
                style={{
                  backgroundColor: r.fillColor,
                  borderColor: r.borderColor,
                }}
              />
              {r.label}
            </button>
          );
        })}
        <span className="text-[10px] text-muted-foreground self-center ml-auto">
          {filteredCount} tecn.
        </span>
      </div>
    </div>
  );
}
