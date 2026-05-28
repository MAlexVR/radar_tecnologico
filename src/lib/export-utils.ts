/**
 * export-utils.ts
 *
 * Shared export helpers for SVG-based and DOM-based PDF/PNG generation.
 * - svgToCanvas / downloadPNG / downloadPDF: extracted from RadarTemplate (behaviour-preserving refactor)
 * - downloadTrajectoryPDF: new DOM-capture helper for the Trajectory Map (uses html-to-image + jsPDF)
 */

import type { RefObject } from "react";

// ═══════════════════════════════════════════════════════════════
// SVG export helpers (radar — no external deps beyond jsPDF)
// ═══════════════════════════════════════════════════════════════

export function svgToCanvas(
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

export async function downloadPNG(svgEl: SVGSVGElement): Promise<void> {
  const canvas = await svgToCanvas(svgEl, 3);
  const link = document.createElement("a");
  link.download = "Radar_Tecnologico_CEET_2025-2035.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function downloadPDF(svgEl: SVGSVGElement): Promise<void> {
  const canvas = await svgToCanvas(svgEl, 3);
  const imgData = canvas.toDataURL("image/png");
  // Dynamic import of jsPDF (preserves existing lazy-load pattern)
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
  // Source note
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
// DOM export helper (trajectory map — uses html-to-image + jsPDF)
// ═══════════════════════════════════════════════════════════════

/**
 * Captures the element referenced by `elementRef` as a PNG image using
 * html-to-image, then embeds it in a landscape A4 PDF via jsPDF.
 *
 * Used by TrajectoryModal (PR-4). Declared here so export-utils is the single
 * source of truth for all export logic.
 */
export async function downloadTrajectoryPDF(
  elementRef: RefObject<HTMLElement | null>,
  options?: { title?: string; filename?: string },
): Promise<void> {
  const el = elementRef.current;
  if (!el) throw new Error("downloadTrajectoryPDF: element ref is null");

  const { toPng } = await import("html-to-image");
  const { jsPDF } = await import("jspdf");

  const imgData = await toPng(el, { cacheBust: true, quality: 1 });

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const title =
    options?.title ?? "Mapa de Trayectoria Tecnológica — Telecomunicaciones CEET 2025-2035";
  const filename =
    options?.filename ?? "Mapa_Trayectoria_Tecnologica_CEET_2025-2035.pdf";

  pdf.setFontSize(12);
  pdf.setTextColor(27, 94, 32);
  pdf.text(title, pageW / 2, 10, { align: "center" });

  const imgW = pageW - 20;
  const imgH = pageH - 25;
  pdf.addImage(imgData, "PNG", 10, 16, imgW, imgH);

  pdf.setFontSize(6);
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    "Fuente: Plan Institucional de Capacitación y GOR — SENA CEET 2025-2035.",
    pageW / 2,
    pageH - 3,
    { align: "center" },
  );

  pdf.save(filename);
}
