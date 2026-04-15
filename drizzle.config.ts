import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

const root = process.cwd();

loadEnv({ path: resolve(root, ".env") });

/**
 * Migrations Drizzle (`pnpm db:generate` → SQL dans `./drizzle`, `pnpm db:migrate` → applique sur `DATABASE_URL`).
 *
 * **Nouvelle base (vide)** : `pnpm db:migrate` exécute `drizzle/0000_initial.sql` (schéma = `src/db/schema.ts`).
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
