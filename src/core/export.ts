export interface ExportPngOptions {
  scale?: number;
  backgroundColor?: string;
}

export interface DownloadElementAsPDFOptions {
  /** Title embedded as PDF metadata. Default: "Mapa de Trayectoria". */
  title?: string;
  /** Filename (without extension). Default: "mapa-trayectoria". */
  filename?: string;
}

/**
 * Captures a DOM element as a PNG using `html-to-image` and embeds it
 * in an A4-landscape PDF using jsPDF.
 *
 * The image is fit to the A4 landscape page preserving aspect ratio
 * (letterbox / pillarbox as needed).
 *
 * @param el   - The HTMLElement to capture.
 * @param opts - Optional title and filename.
 */
export async function downloadElementAsPDF(
  el: HTMLElement,
  opts: DownloadElementAsPDFOptions = {},
): Promise<void> {
  const { title = "Mapa de Trayectoria", filename = "mapa-trayectoria" } = opts;

  // Dynamic import keeps jsPDF and html-to-image out of the initial bundle.
  const { toPng } = await import("html-to-image");
  const { default: jsPDF } = await import("jspdf");

  // Capture the DOM element at 3× pixel ratio for crisp output.
  const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true });

  // A4 landscape dimensions in mm.
  const PAGE_W_MM = 297;
  const PAGE_H_MM = 210;

  // Compute image intrinsic size from the data URL dimensions.
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  // Scale to fit inside A4 landscape preserving aspect ratio.
  const scale = Math.min(PAGE_W_MM / imgW, PAGE_H_MM / imgH);
  const renderW = imgW * scale;
  const renderH = imgH * scale;

  // Center on the page.
  const offsetX = (PAGE_W_MM - renderW) / 2;
  const offsetY = (PAGE_H_MM - renderH) / 2;

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.setProperties({ title });
  pdf.addImage(dataUrl, "PNG", offsetX, offsetY, renderW, renderH);
  pdf.save(`${filename}.pdf`);
}

/**
 * Convert an SVG element to a canvas.
 */
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

/**
 * Export SVG as PNG blob.
 */
export async function exportPNG(
  svgEl: SVGSVGElement,
  opts: ExportPngOptions = {},
): Promise<Blob> {
  const canvas = await svgToCanvas(svgEl, opts.scale ?? 3);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("canvas.toBlob returned null"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

/**
 * Export SVG as SVG string.
 */
export function exportSVG(svgEl: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(svgEl);
}
