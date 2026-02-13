"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function AboutModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Info className="w-4 h-4" />
          <span>Acerca de</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-sena-cyan" />
            Acerca de
          </DialogTitle>
          <DialogDescription>
            Radar Tecnológico — Telecomunicaciones CEET 2025-2035
          </DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-2">
          <h3 className="font-bold text-sm">
            Radar Tecnológico — Telecomunicaciones CEET 2025-2035
          </h3>
          <p className="text-xs text-muted-foreground">
            Vigilancia Científico-Tecnológica y Prospectiva del Área de
            Telecomunicaciones
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Autor:</strong> Mauricio Alexander Vargas Rodríguez —
            Instructor G14
          </p>
          <p className="text-[10px] text-muted-foreground">
            Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) —
            SENA, Bogotá D.C.
          </p>
          <p className="text-[10px] text-muted-foreground">
            Grupo de Investigación del CEET SENA — GICS
          </p>

          {/* SENA color bar */}
          <div className="flex justify-center gap-1 pt-3">
            {[
              "#39a900",
              "#007832",
              "#00304d",
              "#71277a",
              "#50e5f9",
              "#fdc300",
            ].map((c) => (
              <div
                key={c}
                className="w-8 h-1.5 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground/60 pt-2">
            © 2025 SENA — Servicio Nacional de Aprendizaje. Todos los derechos
            reservados.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
