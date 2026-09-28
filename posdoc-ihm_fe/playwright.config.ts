import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  workers: 2,
  fullyParallel: false,
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4200',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {},
    },
  ],
  captureGitInfo: { commit: true, diff: true },
});