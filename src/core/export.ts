export interface ExportPngOptions {
  scale?: number;
  backgroundColor?: string;
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
