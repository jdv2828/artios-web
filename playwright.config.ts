import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: {
    headless: true,
  },
  projects: [
    {
      name: 'production',
      use: { baseURL: 'http://127.0.0.1:3010' },
    },
    {
      name: 'development',
      use: { baseURL: 'http://localhost:3011' },
    },
  ],
})