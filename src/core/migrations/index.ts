import { RadarSchemaError } from "../errors";
import { assertSchemaVersion, validateSchema, SUPPORTED_SCHEMA_VERSIONS } from "../validation";
import type { RadarSchema } from "../types";

export { SUPPORTED_SCHEMA_VERSIONS };

/**
 * Migrate a RadarSchema from one version to another.
 * Currently only supports "1.0.0" (identity migration).
 * Re-validates output after migration.
 */
export function migrateSchema(input: unknown, targetVersion: string): RadarSchema {
  if (typeof input !== "object" || input === null) {
    throw new RadarSchemaError("Input must be an object", "INVALID_INPUT");
  }

  const schema = input as Record<string, unknown>;
  const sourceVersion = schema.$schemaVersion as string;

  if (!sourceVersion) {
    throw new RadarSchemaError("Missing $schemaVersion", "MISSING_VERSION");
  }

  assertSchemaVersion(sourceVersion);

  let result: RadarSchema;

  if (sourceVersion === targetVersion) {
    result = schema as unknown as RadarSchema;
  } else {
    // Placeholder for future migrations:
    // if (sourceVersion === "1.0.0" && targetVersion === "2.0.0") { result = ... }

    throw new RadarSchemaError(
      `Migration from ${sourceVersion} to ${targetVersion} is not implemented`,
      "MIGRATION_NOT_IMPLEMENTED",
    );
  }

  // Re-validate after migration
  const validation = validateSchema(result);
  if (!validation.valid) {
    const firstError = validation.errors[0];
    throw new RadarSchemaError(
      `Post-migration validation failed: ${firstError.path} — ${firstError.message}`,
      "VALIDATION_ERROR",
    );
  }

  return validation.data as unknown as RadarSchema;
}
