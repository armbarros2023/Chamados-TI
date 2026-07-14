import {defineConfig, devices} from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const useExternalBaseUrl = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  webServer: useExternalBaseUrl ? undefined : {command: 'npm run dev -- --host 127.0.0.1', url: baseURL, reuseExistingServer: true},
  use: {baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure'},
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome']}},
    {name: 'mobile', use: {...devices['iPhone 13'], browserName: 'chromium'}},
  ],
});
