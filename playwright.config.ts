import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:43210',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    {
      name: 'merchant',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './tests/.auth/merchant.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'admin',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './tests/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'customer',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './tests/.auth/customer.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:43210',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
