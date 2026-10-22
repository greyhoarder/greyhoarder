import { defineConfig, devices } from '@playwright/test';
import { availableParallelism } from 'node:os';

/** Each worker gets one Redis database; index 0 stays with development (ADR-0018). */
const MAX_WORKERS = 15;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  workers: Math.min(MAX_WORKERS, Math.max(1, Math.floor(availableParallelism() / 2))),
  reporter: 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
