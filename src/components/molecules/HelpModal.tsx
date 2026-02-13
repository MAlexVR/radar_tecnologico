"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RINGS } from "@/lib/radar-data";

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <HelpCircle className="w-4 h-4" />
          <span>Ayuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-sena-cyan" />
            Guía de Referencia
          </DialogTitle>
          <DialogDescription>
            Conceptos clave del Radar Tecnológico
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* TRL Section */}
            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="bg-orange-500/10 text-orange-600 p-1 rounded">
                  TRL
                </span>
                Niveles de Madurez Tecnológica
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                El <strong>Technology Readiness Level (TRL)</strong> es una
                escala estandarizada para medir el grado de madurez de una
                tecnología, desde su concepción hasta su despliegue operativo.
              </p>

              <div className="grid gap-2 text-sm border rounded-lg p-3 bg-muted/30">
                {[
                  {
                    range: "TRL 1-2",
                    title: "Investigación Básica (Inicial)",
                    desc: "Principios observados y formulación del concepto tecnológico.",
                    color: "#4FC3F7",
                  },
                  {
                    range: "TRL 3-4",
                    title: "Prueba de Concepto (Bajo)",
                    desc: "Validación analítica y experimental en laboratorio.",
                    color: "#FDC300",
                  },
                  {
                    range: "TRL 5-6",
                    title: "Validación de Prototipo (Medio)",
                    desc: "Componentes validados en entorno relevante y simulación de alta fidelidad.",
                    color: "#E65100",
                  },
                  {
                    range: "TRL 7-9",
                    title: "Sistema Probado (Alto)",
                    desc: "Sistema completo cualificado y probado en entorno operativo real.",
                    color: "#C62828",
                  },
                ].map((item) => (
                  <div
                    key={item.range}
                    className="grid grid-cols-[80px_1fr] gap-2 items-start"
                  >
                    <Badge
                      variant="outline"
                      className="justify-center"
                      style={{ borderColor: item.color, color: item.color }}
                    >
                      {item.range}
                    </Badge>
                    <div>
                      <span
                        className="font-semibold block"
                        style={{ color: item.color }}
                      >
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* Fases de Adopción */}
            <section className="space-y-3">
              <h3 className="font-bold text-lg">Fases de Adopción (Anillos)</h3>
              <p className="text-sm text-muted-foreground">
                Los anillos del radar indican la postura recomendada frente a
                cada tecnología.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[...RINGS].reverse().map((ring) => (
                  <div key={ring.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-3.5 rounded-sm border"
                        style={{
                          backgroundColor: ring.fillColor,
                          borderColor: ring.borderColor,
                        }}
                      />
                      <span
                        className="font-bold text-sm"
                        style={{ color: ring.labelColor }}
                      >
                        {ring.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ring.desc}. {ring.trl}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
