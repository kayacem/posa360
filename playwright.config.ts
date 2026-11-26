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
    // Authenticated merchant flows
    {
      name: 'merchant',
      testMatch: [
        '**/merchant-authenticated.spec.ts',
        '**/authenticated-flows.spec.ts',
        '**/working-flows.spec.ts',
        '**/comprehensive-flow.spec.ts',
        '**/cross-tenant-isolation.spec.ts',
        '**/features-crm-staff-branding.spec.ts',
        '**/screenshots.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/.auth/merchant.json',
      },
    },
    // Authenticated super-admin flows
    {
      name: 'admin',
      testMatch: [
        '**/admin-authenticated.spec.ts',
        '**/authenticated-flows.spec.ts',
        '**/features-crm-staff-branding.spec.ts',
        '**/screenshots.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/.auth/admin.json',
      },
    },
    // Customer-authenticated flows
    {
      name: 'customer',
      testMatch: [
        '**/order-flow.spec.ts',
        '**/basic-flow.spec.ts',
        '**/working-flows.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/.auth/customer.json',
      },
    },
    // Unauthenticated / public checks (incl. "requires auth" redirects)
    {
      name: 'public',
      testMatch: [
        '**/public.spec.ts',
        '**/tenant-resolution.spec.ts',
        '**/host-resolution-custom-domain.spec.ts',
        '**/final-tests.spec.ts',
        '**/final-working-tests.spec.ts',
        '**/basic-flow.spec.ts',
        '**/cross-tenant-isolation.spec.ts',
        '**/validated-flows.spec.ts',
        '**/screenshots.spec.ts',
      ],
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
