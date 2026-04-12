import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

const root = process.cwd();

loadEnv({ path: resolve(root, ".env") });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
