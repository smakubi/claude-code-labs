import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Restrict discovery to the project's own tests. This also avoids scanning
    // stray timestamped `node_modules*` copies that the host filesystem (e.g.
    // iCloud/Desktop sync) may create alongside `node_modules`.
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules*/**", "dist/**"],
  },
});
