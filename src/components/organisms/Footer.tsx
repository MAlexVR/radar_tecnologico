"use client";

import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { forwardRef } from "react";

export const Footer = forwardRef<HTMLElement>(function Footer(_props, ref) {
  return (
    <footer ref={ref} className="border-t bg-card/50">
      <div className="container-sena py-8">
        {/* Logos row */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-6 flex-wrap">
          <Image
            src="/logo-centro-formacion.svg"
            alt="Centro de Electricidad, Electrónica y Telecomunicaciones"
            width={120}
            height={64}
            className="h-12 md:h-16 w-auto opacity-80"
          />
          <Image
            src="/logo-grupo-investigacion.svg"
            alt="Grupo de Investigación GICS"
            width={120}
            height={64}
            className="h-12 md:h-16 w-auto opacity-80"
          />
        </div>

        <Separator className="mb-6" />

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
      </div>
    </footer>
  );
});
