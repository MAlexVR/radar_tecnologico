import type { Workbook, Worksheet, Row, CellValue } from "exceljs";
import type { IngestError, IngestWarning } from "./types";

export interface ParsedRows {
  rings: Record<string, unknown>[];
  sectors: Record<string, unknown>[];
  items: Record<string, unknown>[];
  errors: IngestError[];
  warnings: IngestWarning[];
}

const RING_HEADERS = [
  "id",
  "label",
  "order",
  "innerRadius",
  "outerRadius",
  "color",
  "fillColor",
  "borderColor",
  "labelColor",
  "description",
  "recommendedAction",
  "maturityHint",
];

const SECTOR_HEADERS = [
  "id",
  "label",
  "shortLabel",
  "startAngle",
  "color",
  "bgLight",
  "bgDark",
  "icon",
];

const ITEM_HEADERS = [
  "id",
  "name",
  "code",
  "sectorId",
  "ringId",
  "angleOff",
  "trlValue",
  "description",
  "impact",
  "horizon",
];

function cellValueToString(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "richText" in value) {
    return (value as { richText: Array<{ text: string }> }).richText
      .map((rt) => rt.text)
      .join("");
  }
  return "";
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^\uFEFF/, "") // BOM
    .replace(/\s+/g, "")
    .toLowerCase();
}

function readSheet(
  sheet: Worksheet,
  expectedHeaders: string[],
  sheetName: string,
  errors: IngestError[],
  warnings: IngestWarning[],
  verbose?: boolean
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  if (sheet.rowCount < 1) {
    errors.push({ row: 0, sheet: sheetName, message: "Sheet is empty" });
    return rows;
  }

  const headerRow = sheet.getRow(1);
  const rawHeaders: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    rawHeaders.push(cellValueToString(cell.value));
  });

  if (verbose) {
    console.log(`[${sheetName}] Detected headers: ${rawHeaders.join(", ")}`);
  }

  const headerMap = new Map<string, number>();
  rawHeaders.forEach((h, idx) => {
    const normalized = normalizeHeader(h);
    if (normalized) {
      headerMap.set(normalized, idx);
    }
  });

  const missingHeaders = expectedHeaders.filter(
    (h) => !headerMap.has(normalizeHeader(h))
  );
  if (missingHeaders.length > 0) {
    errors.push({
      row: 1,
      sheet: sheetName,
      message: `Missing required headers: ${missingHeaders.join(", ")}`,
    });
  }

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    // Skip completely empty rows
    let hasData = false;
    row.eachCell({ includeEmpty: false }, () => {
      hasData = true;
    });
    if (!hasData) continue;

    const obj: Record<string, unknown> = {};
    expectedHeaders.forEach((header) => {
      const colIndex = headerMap.get(normalizeHeader(header));
      if (colIndex !== undefined) {
        const cell = row.getCell(colIndex + 1); // exceljs is 1-based
        const strVal = cellValueToString(cell.value);
        obj[header] = strVal.trim();
      }
    });

    // Validate required fields per sheet
    if (sheetName === "rings" && !obj.id) {
      errors.push({ row: rowNumber, sheet: sheetName, message: "Missing required field: id" });
      continue;
    }
    if (sheetName === "sectors" && !obj.id) {
      errors.push({ row: rowNumber, sheet: sheetName, message: "Missing required field: id" });
      continue;
    }
    if (sheetName === "items" && !obj.id) {
      errors.push({ row: rowNumber, sheet: sheetName, message: "Missing required field: id" });
      continue;
    }

    rows.push(obj);
  }

  return rows;
}

export async function parseWorkbook(
  workbook: Workbook,
  verbose?: boolean
): Promise<ParsedRows> {
  const errors: IngestError[] = [];
  const warnings: IngestWarning[] = [];

  const ringSheet = workbook.getWorksheet("rings");
  const sectorSheet = workbook.getWorksheet("sectors");
  const itemSheet = workbook.getWorksheet("items");

  if (!ringSheet) errors.push({ row: 0, sheet: "rings", message: "Sheet 'rings' not found" });
  if (!sectorSheet) errors.push({ row: 0, sheet: "sectors", message: "Sheet 'sectors' not found" });
  if (!itemSheet) errors.push({ row: 0, sheet: "items", message: "Sheet 'items' not found" });

  const rings = ringSheet
    ? readSheet(ringSheet, RING_HEADERS, "rings", errors, warnings, verbose)
    : [];
  const sectors = sectorSheet
    ? readSheet(sectorSheet, SECTOR_HEADERS, "sectors", errors, warnings, verbose)
    : [];
  const items = itemSheet
    ? readSheet(itemSheet, ITEM_HEADERS, "items", errors, warnings, verbose)
    : [];

  return { rings, sectors, items, errors, warnings };
}
