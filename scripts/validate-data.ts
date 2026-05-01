import { validateSchema } from "../src/core/validation";
import schemaJson from "../public/data/ceet-telecom.json";

const result = validateSchema(schemaJson);

if (!result.valid) {
  console.error("❌ Schema validation failed:");
  for (const err of result.errors) {
    console.error(`  - ${err.path}: ${err.message}`);
  }
  process.exit(1);
}

console.log("✅ Schema validation passed");
console.log(`   ID: ${result.data.id}`);
console.log(`   Title: ${result.data.title}`);
console.log(`   Rings: ${result.data.rings.length}`);
console.log(`   Sectors: ${result.data.sectors.length}`);
console.log(`   Items: ${result.data.items.length}`);
console.log(`   Schema version: ${result.data.$schemaVersion}`);

if (result.data.scales) {
  console.log(`   Scales: ${result.data.scales.length}`);
}

process.exit(0);
