# Ingest XLSX Tool

CLI tool to convert structured XLSX workbooks into `RadarSchema` JSON files for the radar tecnológico.

## Purpose

The vigilancia team maintains radar data in Excel spreadsheets. This tool automates the ingestion pipeline:

```
XLSX workbook  →  parse sheets  →  validate  →  RadarSchema JSON
```

## Installation

No separate installation required. The project already includes `exceljs` and `tsx` in `devDependencies`.

## Usage

### Basic

```bash
npx tsx tools/ingest-xlsx/src/index.ts --in data.xlsx --out public/data/output.json
```

### With verbose logging

```bash
npx tsx tools/ingest-xlsx/src/index.ts --in data.xlsx --out public/data/output.json --verbose
```

### Using npm script

```bash
npm run data:build -- --in data.xlsx --out public/data/output.json
```

## Expected XLSX Structure

The workbook must contain exactly **3 sheets** with these names (case-sensitive):

| Sheet   | Purpose                        |
|---------|--------------------------------|
| `rings`   | Radar rings (maturity layers)  |
| `sectors` | Radar sectors (technology domains) |
| `items`   | Individual technologies        |

### Sheet: `rings`

| Column | Required | Example |
|--------|----------|---------|
| id | ✅ | `adopt` |
| label | ✅ | `ADOPTAR` |
| order | ✅ | `0` |
| innerRadius | ✅ | `0` |
| outerRadius | ✅ | `110` |
| color | ✅ | `#2E7D32` |
| fillColor | ✅ | `#C8E6C9` |
| borderColor | ✅ | `#81C784` |
| labelColor | ✅ | `#2E7D32` |
| description | | `Implementación inmediata` |
| recommendedAction | | `Actualizar curricular...` |
| maturityHint | | `TRL 7-9` |

### Sheet: `sectors`

| Column | Required | Example |
|--------|----------|---------|
| id | ✅ | `D1` |
| label | ✅ | `Inteligencia Nativa y Redes Autónomas` |
| shortLabel | | `D1: Inteligencia Nativa...` |
| startAngle | | `-18` |
| color | ✅ | `#1565C0` |
| bgLight | | `#E3F2FD` |
| bgDark | | `rgba(21,101,192,0.12)` |
| icon | | `🧠` |

### Sheet: `items`

| Column | Required | Example |
|--------|----------|---------|
| id | ✅ | `T01` |
| name | ✅ | `Machine Learning / Deep Learning para Optimización` |
| code | | `L04` |
| sectorId | ✅ | `D1` |
| ringId | ✅ | `adopt` |
| angleOff | ✅ | `0` |
| trlValue | | `8` |
| description | | `Machine Learning y Deep Learning aplicado...` |
| impact | | `Alto` |
| horizon | | `Corto (1-2 años)` |

## Output

The tool writes a `RadarSchema` JSON file with:

- `$schemaVersion: "1.0.0"`
- Automatically generated TRL scale based on item values
- Default layout (`viewBoxWidth: 1200`, `centerY: 520`, etc.)

## Error Handling

- Missing required headers are reported with sheet name and row number.
- Missing required fields (e.g., `id`) skip the row and log an error.
- Items referencing unknown `ringId` or `sectorId` produce warnings but are still included.
- The process exits with code `1` if any errors occur; warnings alone do not fail the process.
