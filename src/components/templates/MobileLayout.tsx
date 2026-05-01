"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, List, Filter, BarChart3, ZoomIn, ZoomOut, Maximize, FileImage, FileText } from "lucide-react";
import { RadarChart } from "@/components/organisms/RadarChart";
import { TechDetail } from "@/components/organisms/TechDetail";
import { NomenclatureTable } from "@/components/organisms/NomenclatureTable";
import { RadarLegend } from "@/components/organisms/RadarLegend";
import type { Technology, ActiveFilters } from "@/types/radar";
import { MobileFilters } from "@/components/molecules/MobileFilters";

interface MobileLayoutProps {
  filteredTechs: Technology[];
  selectedTech: Technology | null;
  hoveredTech: Technology | null;
  activeTech: Technology | null;
  filters: ActiveFilters;
  toggleSector: (i: number) => void;
  toggleRing: (i: number) => void;
  onSelect: (tech: Technology | null) => void;
  onHover: (tech: Technology | null) => void;
  zoomLevel: number;
  pan: { x: number; y: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  exporting: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  setMobileRef: (node: HTMLDivElement | null) => void;
}

export function MobileLayout({
  filteredTechs,
  selectedTech,
  hoveredTech,
  activeTech,
  filters,
  toggleSector,
  toggleRing,
  onSelect,
  onHover,
  zoomLevel,
  pan,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportPNG,
  onExportPDF,
  exporting,
  svgRef,
  setMobileRef,
}: MobileLayoutProps) {
  const [mobileTab, setMobileTab] = useState("radar");

  return (
    <main className="flex-1 container-sena py-3 md:hidden overflow-y-auto">
      <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-3">
          <TabsTrigger value="radar" className="gap-1.5 text-xs">
            <Radar className="w-3.5 h-3.5" /> Radar
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-1.5 text-xs">
            <List className="w-3.5 h-3.5" /> Tabla
          </TabsTrigger>
          <TabsTrigger value="detail" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Detalle
          </TabsTrigger>
          <TabsTrigger value="legend" className="gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" /> Leyenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="radar">
          <div className="mb-3 bg-sena-gray-light/50 border border-sena-gray-light rounded-lg p-3 text-xs text-sena-gray-dark shadow-sm">
            <p className="mb-2 leading-relaxed text-sena-blue font-medium text-[11px]">
              Vigilancia científico-tecnológica — Telecomunicaciones CEET 2025-2035
            </p>
            <Separator className="my-2 opacity-50" />
            <p className="font-semibold text-sena-blue mb-1">Guía Rápida</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Usa <strong className="text-sena-green">dos dedos para zoom</strong> o los botones (+/-).</li>
              <li>Arrastra para mover el mapa.</li>
              <li>Toca un punto para ver detalles.</li>
              <li>Explora con "Filtros" y "Leyenda".</li>
            </ul>
          </div>

          <Card>
            <CardContent className="p-2">
              <div
                ref={setMobileRef}
                className="relative overflow-hidden aspect-square flex items-center justify-center bg-sena-gray-light/40 rounded-lg border touch-none"
              >
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                  <Button size="icon-sm" onClick={onZoomIn} className="h-8 w-8 bg-sena-green/80 text-white border border-sena-green/30 hover:bg-sena-green shadow-sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="icon-sm" onClick={onZoomOut} className="h-8 w-8 bg-sena-green/80 text-white border border-sena-green/30 hover:bg-sena-green shadow-sm">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="icon-sm" onClick={onResetZoom} className="h-8 w-8 bg-sena-green/80 text-white border border-sena-green/30 hover:bg-sena-green shadow-sm">
                    <Maximize className="w-4 h-4" />
                  </Button>
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
                    onSelect={(t) => {
                      onSelect(t);
                      if (t) setMobileTab("detail");
                    }}
                    onHover={onHover}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2 justify-center">
                <Button variant="outline" size="sm" onClick={onExportPNG} disabled={exporting} className="text-xs">
                  <FileImage className="w-3.5 h-3.5 mr-1.5" /> Exportar PNG
                </Button>
                <Button variant="outline" size="sm" onClick={onExportPDF} disabled={exporting} className="text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Exportar PDF
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
              <CardTitle className="text-sm flex items-center gap-2 text-sena-blue">
                <List className="w-4 h-4 text-sena-green" />
                Nomenclaturas — {filteredTechs.length} tecnologías
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <NomenclatureTable
                filteredTechs={filteredTechs}
                selectedTech={selectedTech}
                onSelect={(t) => {
                  onSelect(t);
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
  );
}
