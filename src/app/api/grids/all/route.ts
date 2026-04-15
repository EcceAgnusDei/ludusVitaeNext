import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { cursorFromRowPopular, cursorFromRowRecent } from "@/lib/grids/cursor";
import { gridsMethodNotAllowed } from "@/lib/grids/method-not-allowed";
import { listPublicGridsPage } from "@/lib/grids/repository";
import { parseGridsAllQuery } from "@/lib/grids/schemas";
import { getViewerId } from "@/lib/grids/route-auth";
import { withGridsRouteErrors } from "@/lib/grids/route-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const onlyGet405 = () => gridsMethodNotAllowed("GET");

export const POST = onlyGet405;
export const PATCH = onlyGet405;
export const PUT = onlyGet405;
export const DELETE = onlyGet405;

export function GET(request: Request) {
  return withGridsRouteErrors(async () => {
    const { searchParams } = new URL(request.url);
    const parsed = parseGridsAllQuery(searchParams);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status },
      );
    }

    const { sort, cursor, limit } = parsed.value;
    const fetchLimit = limit + 1; // +1 pour vérifier si il y a plus de pages en bd (grille sonde)
    const viewerId = await getViewerId();
    const db = getDb();
    const rows = await listPublicGridsPage(db, {
      viewerId,
      sort,
      cursor,
      fetchLimit,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows; //enleve la grille "sonde"
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last !== undefined
        ? sort === "recent"
          ? cursorFromRowRecent({
              createdAt: last.createdAt,
              id: last.id,
            })
          : cursorFromRowPopular({
              likeCount: last.likeCount,
              createdAt: last.createdAt,
              id: last.id,
            })
        : null;

    return NextResponse.json({
      items: page.map((row) => ({
        id: row.id,
        userId: row.userId,
        name: row.name,
        data: row.data,
        createdAt: row.createdAt,
        isPublic: row.isPublic,
        creatorName: row.creatorName,
        likeCount: row.likeCount,
        likedByMe: row.likedByMe,
      })),
      nextCursor,
      hasMore,
    });
  });
}
