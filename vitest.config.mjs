import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["platform/tests/**/*.test.js"],
    environment: "jsdom",
    globals: false,
    setupFiles: ["./platform/tests/setup.js"],
  },
});