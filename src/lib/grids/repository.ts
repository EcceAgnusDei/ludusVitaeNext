/**
 * Accès base de données (Drizzle) pour les grilles : lecture / écriture uniquement,
 * sans `NextRequest` ni codes HTTP — consommé par les Route Handlers.
 */

import { and, desc, eq, or, sql, type SQL } from "drizzle-orm";

import type { getDb } from "@/db";
import { grid, gridLike, user } from "@/db/schema";
import type {
  GridsCursorPayload,
  GridsCursorPopular,
  GridsCursorRecent,
  GridsListSortMode,
} from "@/lib/grids/cursor";

export type GridsDb = ReturnType<typeof getDb>;

/** Corps JSON d’une grille (aligné sur l’ancienne API Express). */
export type GridJson = {
  id: string;
  userId: string;
  name: string | null;
  data: unknown;
  createdAt: string;
  isPublic: boolean;
};

/** Liste explorée / aimées : champs sociaux + nom du créateur. */
export type GridListItemWithCreator = GridJson & {
  creatorName: string;
  likeCount: number;
  likedByMe: boolean;
};

/** Liste sur le profil d’un utilisateur : pas de `creatorName` côté API historique. */
export type GridListItemUser = GridJson & {
  likeCount: number;
  likedByMe: boolean;
};

function rowToGridJson(row: {
  id: string;
  userId: string;
  name: string | null;
  data: unknown;
  createdAt: string;
  isPublic: boolean;
}): GridJson {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    data: row.data,
    createdAt: row.createdAt,
    isPublic: row.isPublic,
  };
}

function likeCountExpr() {
  return sql<number>`(select count(*)::int from ${gridLike} where ${gridLike.gridId} = ${grid.id})`.mapWith(
    Number,
  );
}

function likedByMeExpr(viewerId: string | null) {
  if (viewerId === null) {
    return sql<boolean>`false`.mapWith(Boolean);
  }
  return sql<boolean>`exists (
    select 1 from ${gridLike}
    where ${gridLike.gridId} = ${grid.id} and ${gridLike.userId} = ${viewerId}
  )`.mapWith(Boolean);
}

function recentCursorWhere(c: GridsCursorRecent) {
  return or(
    sql`${grid.createdAt} < ${c.u}::timestamptz`,
    sql`(${grid.createdAt} = ${c.u}::timestamptz and ${grid.id} < ${c.i})`,
  );
}

function popularCursorWhere(pop: GridsCursorPopular) {
  const likes = sql`(select count(*)::int from ${gridLike} where ${gridLike.gridId} = ${grid.id})`;
  return sql`(
    ${likes} < ${pop.l}
    or (${likes} = ${pop.l} and ${grid.createdAt} < ${pop.u}::timestamptz)
    or (${likes} = ${pop.l} and ${grid.createdAt} = ${pop.u}::timestamptz and ${grid.id} < ${pop.i})
  )`;
}

/**
 * Liste paginée des grilles publiques (explore), avec compteur de likes et « aimé par moi ».
 * `fetchLimit` doit valoir `limit + 1` pour détecter `hasMore` (comportement Express).
 */
export async function listPublicGridsPage(
  db: GridsDb,
  args: {
    viewerId: string | null;
    sort: GridsListSortMode;
    cursor: GridsCursorPayload | null;
    fetchLimit: number;
  },
): Promise<GridListItemWithCreator[]> {
  const { viewerId, sort, cursor, fetchLimit } = args;
  const baseWhere = eq(grid.isPublic, true);
  let cursorWhere: SQL | undefined;
  if (cursor === null) {
    cursorWhere = undefined;
  } else if (cursor.sort === "recent") {
    cursorWhere = recentCursorWhere(cursor);
  } else {
    cursorWhere = popularCursorWhere(cursor);
  }
  const whereClause =
    cursorWhere === undefined ? baseWhere : and(baseWhere, cursorWhere);

  const likeCount = likeCountExpr();
  const likedByMe = likedByMeExpr(viewerId);

  const orderByRecent = [desc(grid.createdAt), desc(grid.id)] as const;
  const orderByPopular = [
    desc(
      sql`(select count(*)::int from ${gridLike} where ${gridLike.gridId} = ${grid.id})`,
    ),
    desc(grid.createdAt),
    desc(grid.id),
  ] as const;

  return db
    .select({
      id: grid.id,
      userId: grid.userId,
      name: grid.name,
      data: grid.data,
      createdAt: grid.createdAt,
      isPublic: grid.isPublic,
      creatorName: user.name,
      likeCount,
      likedByMe,
    })
    .from(grid)
    .innerJoin(user, eq(user.id, grid.userId))
    .where(whereClause)
    .orderBy(
      ...(sort === "recent" ? orderByRecent : orderByPopular),
    )
    .limit(fetchLimit);
}

/**
 * Grilles aimées par l’utilisateur connecté (tri par date du like).
 */
export async function listLikedGridsForUser(
  db: GridsDb,
  userId: string,
): Promise<GridListItemWithCreator[]> {
  const likeCount = likeCountExpr();
  return db
    .select({
      id: grid.id,
      userId: grid.userId,
      name: grid.name,
      data: grid.data,
      createdAt: grid.createdAt,
      isPublic: grid.isPublic,
      creatorName: user.name,
      likeCount,
      likedByMe: sql<boolean>`true`.mapWith(Boolean),
    })
    .from(gridLike)
    .innerJoin(grid, eq(grid.id, gridLike.gridId))
    .innerJoin(user, eq(user.id, grid.userId))
    .where(eq(gridLike.userId, userId))
    .orderBy(desc(gridLike.createdAt));
}

/**
 * Grilles visibles sur le profil `profileUserId` : publiques, ou toutes si le visiteur est le propriétaire.
 */
export async function listGridsForUserProfile(
  db: GridsDb,
  args: {
    profileUserId: string;
    viewerId: string | null;
    sort: GridsListSortMode;
  },
): Promise<GridListItemUser[]> {
  const { profileUserId, viewerId, sort } = args;
  const visibility = or(
    eq(grid.isPublic, true),
    viewerId !== null && viewerId === profileUserId
      ? sql`true`
      : sql`false`,
  );
  const whereClause = and(eq(grid.userId, profileUserId), visibility);
  const likeCount = likeCountExpr();
  const likedByMe = likedByMeExpr(viewerId);

  const orderByRecent = [desc(grid.createdAt), desc(grid.id)] as const;
  const orderByPopular = [
    desc(
      sql`(select count(*)::int from ${gridLike} where ${gridLike.gridId} = ${grid.id})`,
    ),
    desc(grid.createdAt),
    desc(grid.id),
  ] as const;

  const rows = await db
    .select({
      id: grid.id,
      userId: grid.userId,
      name: grid.name,
      data: grid.data,
      createdAt: grid.createdAt,
      isPublic: grid.isPublic,
      likeCount,
      likedByMe,
    })
    .from(grid)
    .where(whereClause)
    .orderBy(
      ...(sort === "recent" ? orderByRecent : orderByPopular),
    );

  return rows;
}

export async function createGrid(
  db: GridsDb,
  input: {
    id: string;
    userId: string;
    name: string | null;
    data: object;
    isPublic: boolean;
  },
): Promise<GridJson> {
  const [row] = await db
    .insert(grid)
    .values({
      id: input.id,
      userId: input.userId,
      name: input.name,
      data: input.data,
      isPublic: input.isPublic,
    })
    .returning({
      id: grid.id,
      userId: grid.userId,
      name: grid.name,
      data: grid.data,
      createdAt: grid.createdAt,
      isPublic: grid.isPublic,
    });
  if (!row) {
    throw new Error("createGrid: insert returned no row");
  }
  return rowToGridJson(row);
}

export async function updateGridVisibility(
  db: GridsDb,
  args: { gridId: string; ownerUserId: string; isPublic: boolean },
): Promise<GridJson | null> {
  const [row] = await db
    .update(grid)
    .set({ isPublic: args.isPublic })
    .where(
      and(eq(grid.id, args.gridId), eq(grid.userId, args.ownerUserId)),
    )
    .returning({
      id: grid.id,
      userId: grid.userId,
      name: grid.name,
      data: grid.data,
      createdAt: grid.createdAt,
      isPublic: grid.isPublic,
    });
  return row ? rowToGridJson(row) : null;
}

export async function deleteOwnedGrid(
  db: GridsDb,
  args: { gridId: string; ownerUserId: string },
): Promise<boolean> {
  const deleted = await db
    .delete(grid)
    .where(
      and(eq(grid.id, args.gridId), eq(grid.userId, args.ownerUserId)),
    )
    .returning({ id: grid.id });
  return deleted.length > 0;
}

export async function countLikesForGrid(
  db: GridsDb,
  gridId: string,
): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int`.mapWith(Number) })
    .from(gridLike)
    .where(eq(gridLike.gridId, gridId));
  return rows[0]?.n ?? 0;
}

/** Ligne minimale pour décider si un like est autorisé (visibilité). */
export async function getGridVisibilityRow(
  db: GridsDb,
  gridId: string,
): Promise<{ userId: string; isPublic: boolean } | null> {
  const rows = await db
    .select({
      userId: grid.userId,
      isPublic: grid.isPublic,
    })
    .from(grid)
    .where(eq(grid.id, gridId))
    .limit(1);
  return rows[0] ?? null;
}

function isFkViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23503"
  );
}

/**
 * Ajoute un like si la grille existe et est visible pour le visiteur.
 * Retourne `not_found` si grille absente / privée d’un autre, ou violation FK.
 */
export async function addGridLike(
  db: GridsDb,
  viewerId: string,
  gridId: string,
): Promise<
  { ok: true; likeCount: number } | { ok: false; reason: "not_found" }
> {
  const vis = await getGridVisibilityRow(db, gridId);
  if (!vis || (!vis.isPublic && vis.userId !== viewerId)) {
    return { ok: false, reason: "not_found" };
  }
  try {
    await db
      .insert(gridLike)
      .values({ gridId, userId: viewerId })
      .onConflictDoNothing({
        target: [gridLike.userId, gridLike.gridId],
      });
  } catch (e) {
    if (isFkViolation(e)) {
      return { ok: false, reason: "not_found" };
    }
    throw e;
  }
  const likeCount = await countLikesForGrid(db, gridId);
  return { ok: true, likeCount };
}

export async function removeGridLike(
  db: GridsDb,
  viewerId: string,
  gridId: string,
): Promise<{ likeCount: number }> {
  await db
    .delete(gridLike)
    .where(
      and(eq(gridLike.gridId, gridId), eq(gridLike.userId, viewerId)),
    );
  const likeCount = await countLikesForGrid(db, gridId);
  return { likeCount };
}
