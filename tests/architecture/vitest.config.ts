import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ArchUnitTS registers its matchers on the global `expect`.
    globals: true,
    include: ['*.spec.ts'],
    // The first rule of each project loads its whole TypeScript program.
    testTimeout: 60_000,
  },
});
