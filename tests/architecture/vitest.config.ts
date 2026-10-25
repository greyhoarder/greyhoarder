import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ArchUnitTS registers its matchers on the global `expect`.
    globals: true,
    include: ['*.spec.ts'],
  },
});
