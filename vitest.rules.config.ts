import { defineConfig } from "vitest/config";

// Security rules tests. They need the Firestore emulator, so run them with
// `pnpm test:rules`, which starts it first.
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    // The files share one emulator and clear it between tests.
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
