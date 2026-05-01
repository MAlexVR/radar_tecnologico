#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { Workbook } from "exceljs";
import type { IngestOptions, IngestReport } from "./types";
import { parseWorkbook } from "./parser";
import { transform } from "./transformer";

function printHelp(): void {
  console.log(`
Usage: npx tsx tools/ingest-xlsx/src/index.ts [options]

Options:
  --in, -i       Path to input XLSX file (required)
  --out, -o      Path to output JSON file (required)
  --verbose, -v  Enable verbose logging
  --help, -h     Show this help message

Example:
  npx tsx tools/ingest-xlsx/src/index.ts --in data.xlsx --out public/data/output.json
`);
}

function parseArgs(args: string[]): IngestOptions {
  const options: Partial<IngestOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--in":
      case "-i":
        options.input = args[++i];
        break;
      case "--out":
      case "-o":
        options.output = args[++i];
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
    }
  }

  if (!options.input || !options.output) {
    console.error("Error: --in and --out are required.");
    printHelp();
    process.exit(1);
  }

  return options as IngestOptions;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!fs.existsSync(options.input)) {
    console.error(`Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  if (options.verbose) {
    console.log(`Reading ${options.input}...`);
  }

  const workbook = new Workbook();
  await workbook.xlsx.readFile(options.input);

  const parsed = await parseWorkbook(workbook, options.verbose);
  const { schema, errors, warnings } = transform(parsed);

  const report: IngestReport = {
    success: errors.length === 0,
    itemsProcessed: schema.items.length,
    ringsProcessed: schema.rings.length,
    sectorsProcessed: schema.sectors.length,
    errors,
    warnings,
  };

  // Ensure output directory exists
  const outDir = path.dirname(options.output);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(options.output, JSON.stringify(schema, null, 2), "utf-8");

  console.log(`\n✓ Written ${options.output}`);
  console.log(`  Rings:    ${report.ringsProcessed}`);
  console.log(`  Sectors:  ${report.sectorsProcessed}`);
  console.log(`  Items:    ${report.itemsProcessed}`);

  if (warnings.length > 0) {
    console.log(`\n⚠ Warnings (${warnings.length}):`);
    warnings.forEach((w) => {
      console.log(`  [${w.sheet} @ row ${w.row}] ${w.message}`);
    });
  }

  if (errors.length > 0) {
    console.log(`\n✗ Errors (${errors.length}):`);
    errors.forEach((e) => {
      console.log(`  [${e.sheet} @ row ${e.row}] ${e.message}`);
    });
    process.exit(1);
  }

  console.log("\n✓ Ingestion completed successfully.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
