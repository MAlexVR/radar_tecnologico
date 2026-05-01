"use client";

import React, { forwardRef, useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Technology } from "@/types/radar";
import {
  RINGS,
  SECTORS,
  SECTOR_ANGLE,
  RADAR_LAYOUT,
  polarToXY,
  getTechPosition,
} from "@/lib/radar-data";

const { viewBoxWidth: SVG_W, viewBoxHeight: SVG_H, centerX: CX, centerY: CY } = RADAR_LAYOUT;

interface RadarChartProps {
  filteredTechs: Technology[];
  selectedTech: Technology | null;
  hoveredTech: Technology | null;
  activeSectors: Set<number>;
  activeRings: Set<number>;
  onSelect: (tech: Technology | null) => void;
  onHover: (tech: Technology | null) => void;
}

export const RadarChart = forwardRef<SVGSVGElement, RadarChartProps>(
  function RadarChart(
    {
      filteredTechs,
      selectedTech,
      hoveredTech,
      activeSectors,
      activeRings,
      onSelect,
      onHover,
    },
    ref,
  ) {
    const t = useTranslations("radar");
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const dotRefs = useRef<(SVGGElement | null)[]>([]);

    const sortedTechs = [...filteredTechs].sort((a, b) => {
      if (a.sector !== b.sector) return a.sector - b.sector;
      return a.ring - b.ring;
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<SVGGElement>, index: number) => {
        const current = sortedTechs[index];
        if (!current) return;

        let nextIndex = index;

        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            onSelect(selectedTech?.id === current.id ? null : current);
            return;
          case "ArrowRight":
          case "ArrowDown": {
            e.preventDefault();
            const sameSector = sortedTechs.filter((tt) => tt.sector === current.sector);
            const idxInSector = sameSector.findIndex((tt) => tt.id === current.id);
            if (idxInSector < sameSector.length - 1) {
              nextIndex = sortedTechs.findIndex((tt) => tt.id === sameSector[idxInSector + 1].id);
            } else {
              const nextSector = (current.sector + 1) % SECTORS.length;
              const nextSectorTechs = sortedTechs.filter((tt) => tt.sector === nextSector);
              if (nextSectorTechs.length > 0) {
                nextIndex = sortedTechs.findIndex((tt) => tt.id === nextSectorTechs[0].id);
              }
            }
            break;
          }
          case "ArrowLeft":
          case "ArrowUp": {
            e.preventDefault();
            const sameSector = sortedTechs.filter((tt) => tt.sector === current.sector);
            const idxInSector = sameSector.findIndex((tt) => tt.id === current.id);
            if (idxInSector > 0) {
              nextIndex = sortedTechs.findIndex((tt) => tt.id === sameSector[idxInSector - 1].id);
            } else {
              const prevSector = (current.sector - 1 + SECTORS.length) % SECTORS.length;
              const prevSectorTechs = sortedTechs.filter((tt) => tt.sector === prevSector);
              if (prevSectorTechs.length > 0) {
                nextIndex = sortedTechs.findIndex(
                  (tt) => tt.id === prevSectorTechs[prevSectorTechs.length - 1].id,
                );
              }
            }
            break;
          }
          case "Home":
            e.preventDefault();
            nextIndex = 0;
            break;
          case "End":
            e.preventDefault();
            nextIndex = sortedTechs.length - 1;
            break;
          default:
            return;
        }

        if (nextIndex !== index && nextIndex >= 0 && nextIndex < sortedTechs.length) {
          setFocusedIndex(nextIndex);
          dotRefs.current[nextIndex]?.focus();
        }
      },
      [sortedTechs, selectedTech, onSelect],
    );

    useEffect(() => {
      if (selectedTech) {
        const idx = sortedTechs.findIndex((tt) => tt.id === selectedTech.id);
        if (idx !== -1) setFocusedIndex(idx);
      }
    }, [selectedTech, sortedTechs]);

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* White background */}
        <rect width={SVG_W} height={SVG_H} fill="#ffffff" rx="16" />

        {/* Title */}
        <text
          x={CX}
          y={42}
          textAnchor="middle"
          fill="#1a1a2e"
          fontSize={22}
          fontWeight={700}
          letterSpacing="0.5"
        >
          {t("title")}
        </text>

        {/* Ring fills — outermost first */}
        {[...RINGS].reverse().map((ring) => (
          <circle
            key={ring.id}
            cx={CX}
            cy={CY}
            r={ring.radius}
            fill={ring.fillColor}
            stroke={ring.borderColor}
            strokeWidth={1.5}
            opacity={0.9}
          />
        ))}

        {/* Ring labels */}
        {RINGS.map((ring) => (
          <text
            key={`rl-${ring.id}`}
            x={CX}
            y={CY - ring.radius + 18}
            textAnchor="middle"
            fill={ring.labelColor}
            fontSize={13}
            fontWeight={700}
            opacity={0.8}
            letterSpacing="2"
          >
            {ring.label}
          </text>
        ))}

        {/* Sector dividers — dashed gray */}
        {SECTORS.map((s) => {
          const outer = polarToXY(CX, CY, RINGS[3].radius + 12, s.startAngle);
          const segments: React.JSX.Element[] = [];
          const steps = 40;
          for (let i = 0; i < steps; i += 2) {
            const t1 = i / steps;
            const t2 = (i + 1) / steps;
            const x1 = CX + (outer.x - CX) * t1;
            const y1 = CY + (outer.y - CY) * t1;
            const x2 = CX + (outer.x - CX) * t2;
            const y2 = CY + (outer.y - CY) * t2;
            segments.push(
              <line
                key={`${s.id}-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9e9e9e"
                strokeWidth={0.8}
                opacity={0.5}
              />,
            );
          }
          return <g key={s.id}>{segments}</g>;
        })}

        {/* Sector labels */}
        {SECTORS.map((s, si) => {
          const midAngle = s.startAngle + SECTOR_ANGLE / 2;
          const labelR = RINGS[3].radius + 30;
          const pos = polarToXY(CX, CY, labelR, midAngle);

          let textX = pos.x;
          const shift = 60;
          if (pos.x > CX + 60) textX += shift;
          else if (pos.x < CX - 60) textX -= shift;

          const isActive = activeSectors.has(si);

          return (
            <text
              key={`sl-${s.id}`}
              x={textX}
              y={pos.y}
              textAnchor="middle"
              fill={isActive ? s.color : "#9e9e9e"}
              fontSize={12}
              fontWeight={800}
              opacity={isActive ? 1 : 0.3}
            >
              {s.labelLines
                ? s.labelLines.map((line, i) => (
                    <tspan key={i} x={textX} dy={i === 0 ? 0 : "1.2em"}>
                      {line}
                    </tspan>
                  ))
                : s.shortLabel}
            </text>
          );
        })}

        {/* Technology dots */}
        {sortedTechs.map((tech, index) => {
          const pos = getTechPosition(tech, CX, CY);
          const sector = SECTORS[tech.sector];
          const isActive =
            selectedTech?.id === tech.id || hoveredTech?.id === tech.id;
          const isFocused = focusedIndex === index;
          const r = isActive || isFocused ? 8 : 6;

          return (
            <g
              key={tech.id}
              ref={(el) => { dotRefs.current[index] = el; }}
              role="button"
              tabIndex={0}
              aria-label={tech.name}
              aria-pressed={selectedTech?.id === tech.id}
              className="radar-dot-group"
              style={{ cursor: "pointer" }}
              onClick={() =>
                onSelect(selectedTech?.id === tech.id ? null : tech)
              }
              onMouseEnter={() => onHover(tech)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => setFocusedIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {/* Focus ring — visible only when keyboard-focused */}
              {isFocused && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 5}
                  fill="none"
                  stroke="var(--ring)"
                  strokeWidth={2}
                  strokeDasharray="3 2"
                  pointerEvents="none"
                />
              )}
              {/* Glow for active */}
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill={sector.color}
                  opacity={0.2}
                />
              )}
              {/* Dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={sector.color}
                stroke={isFocused ? "var(--ring)" : "#fff"}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={isActive ? 1 : 0.85}
              />
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + (tech.labelDy ?? (isActive ? 19 : 16))}
                textAnchor="middle"
                fill={isActive ? "#1a1a2e" : "#3a3a5c"}
                fontSize={isActive ? 11 : 9.5}
                fontWeight={isActive ? 700 : 500}
              >
                {tech.nameLines
                  ? tech.nameLines.map((line: string, i: number) => (
                      <tspan key={i} x={pos.x} dy={i === 0 ? 0 : "1.2em"}>
                        {line}
                      </tspan>
                    ))
                  : tech.name}
              </text>
            </g>
          );
        })}

        {/* Source Text Attribution */}
        <text
          x={CX}
          y={SVG_H - 30}
          textAnchor="middle"
          fill="#8e8e8e"
          fontSize={12}
          fontWeight={500}
        >
          {t("source")}
        </text>
      </svg>
    );
  },
);
