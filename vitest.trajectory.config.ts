/**
 * Vitest config for trajectory engine unit tests (jsdom only).
 * Avoids the storybook browser workspace that requires @storybook/addon-vitest.
 * Use: npx vitest run --config vitest.trajectory.config.ts src/lib/trajectory
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/lib/trajectory/**/*.test.ts"],
  },
});
