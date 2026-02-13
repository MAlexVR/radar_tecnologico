"use client";

import { Radar, Info, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpModal } from "@/components/molecules/HelpModal";
import { AboutModal } from "@/components/molecules/AboutModal";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl safe-top">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <Radar className="w-7 h-7 md:w-9 md:h-9 text-sena-cyan" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-base font-bold leading-tight">
              Radar Tecnológico
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Telecomunicaciones CEET • SENA • 2025-2035
            </p>
          </div>
          <h1 className="sm:hidden text-sm font-bold">Radar Tecnológico</h1>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Badge className="text-xs bg-sena-green/20 text-sena-green border-sena-green/30">
            v1.0
          </Badge>
          <HelpModal />
          <AboutModal />
        </div>

        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <div className="container px-4 py-3 space-y-2">
            <HelpModal />
            <AboutModal />
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">SENA — CEET</span>
              <Badge className="text-xs bg-sena-green/20 text-sena-green border-sena-green/30">
                v1.0
              </Badge>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
