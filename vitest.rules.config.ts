import { defineConfig } from "vitest/config";

// Security rules tests. They need the Firestore and Storage emulators, so run
// them with `pnpm test:rules`, which starts the emulators first.
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    // The files share one emulator and clear it between tests.
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
