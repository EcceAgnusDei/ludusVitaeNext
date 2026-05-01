import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as relations from "@/db/relations";
import * as schema from "@/db/schema";
import { grid, user } from "@/db/schema";
import { createGrid, type GridsDb } from "@/lib/grids-api/repository";

vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/grids-api/route-auth", () => ({
  GRIDS_UNAUTHORIZED_JSON: { error: "Non autorisé" },
  getViewerId: vi.fn(),
  requireUserId: vi.fn(),
}));

import { getDb } from "@/db";
import { requireUserId } from "@/lib/grids-api/route-auth";

import { DELETE } from "./route";

const DATABASE_URL_TEST_LOCAL =
  "postgresql://antoine:password123@localhost:5432/ludusvitae_test";

const dbSchema = { ...schema, ...relations };
const testUrl =
  process.env.DATABASE_URL_TEST?.trim() ||
  DATABASE_URL_TEST_LOCAL.trim() ||
  undefined;

function deleteRequest(gridId: string): Request {
  return new Request(`http://test.local/api/grids/${gridId}`, {
    method: "DELETE",
  });
}

describe.skipIf(!testUrl)("DELETE /api/grids/[id] (handler HTTP)", () => {
  let pool!: Pool;
  let db!: GridsDb;

  const suffix = randomBytes(8).toString("hex");
  const ownerA = `it-http-del-owner-a-${suffix}`;
  const ownerB = `it-http-del-owner-b-${suffix}`;
  const gridId = `it-http-del-grid-${suffix}`;

  const ctx = { params: Promise.resolve({ id: gridId }) };

  beforeAll(() => {
    pool = new Pool({ connectionString: testUrl! });
    db = drizzle(pool, { schema: dbSchema });
    vi.mocked(getDb).mockReturnValue(db);
  });

  afterAll(async () => {
    vi.mocked(getDb).mockReset();
    try {
      await db.delete(grid).where(eq(grid.id, gridId));
      await db.delete(user).where(eq(user.id, ownerA));
      await db.delete(user).where(eq(user.id, ownerB));
    } finally {
      await pool.end();
    }
  });

  it("répond 401 lorsque la session est absente ou invalide", async () => {
    vi.mocked(requireUserId).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    });

    const res = await DELETE(deleteRequest("any-id"), {
      params: Promise.resolve({ id: "any-id" }),
    });
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Non autorisé" });
  });

  it("répond 404 quand l’utilisateur connecté n’est pas le propriétaire", async () => {
    await db.insert(user).values([
      {
        id: ownerA,
        name: `Owner A ${suffix}`,
        email: `http-owner-a-${suffix}@test.local`,
        emailVerified: false,
      },
      {
        id: ownerB,
        name: `Owner B ${suffix}`,
        email: `http-owner-b-${suffix}@test.local`,
        emailVerified: false,
      },
    ]);

    await createGrid(db, {
      id: gridId,
      userId: ownerA,
      name: "grille test",
      data: {},
      isPublic: true,
    });

    vi.mocked(requireUserId).mockResolvedValue({
      ok: true,
      userId: ownerB,
    });

    const res = await DELETE(deleteRequest(gridId), ctx);
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "Grille introuvable" });

    const stillThere = await db
      .select({ id: grid.id })
      .from(grid)
      .where(eq(grid.id, gridId));
    expect(stillThere).toHaveLength(1);
  });

  it("répond 204 quand le propriétaire supprime sa grille", async () => {
    vi.mocked(requireUserId).mockResolvedValue({
      ok: true,
      userId: ownerA,
    });

    const res = await DELETE(deleteRequest(gridId), ctx);
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");

    const gone = await db
      .select({ id: grid.id })
      .from(grid)
      .where(eq(grid.id, gridId));
    expect(gone).toHaveLength(0);
  });
});
