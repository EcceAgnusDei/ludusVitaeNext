import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({ connectionString: url });
  }
  return globalForDb.pool;
}

export function getDb() {
  return drizzle(getPool());
}
