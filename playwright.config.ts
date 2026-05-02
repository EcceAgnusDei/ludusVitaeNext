import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.test", override: true });

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL?.trim() || "http://localhost:3000";

/** Si défini (ex. dans `.env.test`), Next démarre avec cette URL et les e2e n’écrivent pas dans la base de dev. */
const databaseUrlForE2E = process.env.DATABASE_URL_TEST?.trim();

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run dev",
    url: baseURL,
    // Avec DATABASE_URL_TEST, il faut un serveur lancé par Playwright (sinon un `dev` déjà ouvert reste sur la base de dev).
    reuseExistingServer:
      !process.env.CI && !databaseUrlForE2E,
    timeout: 120_000,
    ...(databaseUrlForE2E
      ? {
          env: {
            ...process.env,
            DATABASE_URL: databaseUrlForE2E,
          },
        }
      : {}),
  },
});
