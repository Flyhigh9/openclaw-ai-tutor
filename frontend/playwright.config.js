import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  timeout: 30000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: false,

  reporter: "html",

  use: {
    baseURL: "http://127.0.0.1:5173",

    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 120000,
    },

    {
      command: "node ../backend/server.js",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});