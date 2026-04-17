import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { gridsMethodNotAllowed } from "@/lib/grids-api/method-not-allowed";
import { addGridLike, removeGridLike } from "@/lib/grids-api/repository";
import { requireUserId } from "@/lib/grids-api/route-auth";
import { withGridsRouteErrors } from "@/lib/grids-api/route-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const likeAllow = "POST, DELETE";

const like405 = () => gridsMethodNotAllowed(likeAllow);

export const GET = like405;
export const PATCH = like405;
export const PUT = like405;

export function POST(_request: Request, ctx: RouteContext) {
  return withGridsRouteErrors(async () => {
    const auth = await requireUserId();
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json(
        { error: "Identifiant de grille manquant" },
        { status: 400 },
      );
    }

    const db = getDb();
    const result = await addGridLike(db, auth.userId, id);
    if (!result.ok) {
      return NextResponse.json({ error: "Grille introuvable" }, { status: 404 });
    }
    return NextResponse.json({ liked: true, likeCount: result.likeCount });
  });
}

export function DELETE(_request: Request, ctx: RouteContext) {
  return withGridsRouteErrors(async () => {
    const auth = await requireUserId();
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json(
        { error: "Identifiant de grille manquant" },
        { status: 400 },
      );
    }

    const db = getDb();
    const { likeCount } = await removeGridLike(db, auth.userId, id);
    return NextResponse.json({ liked: false, likeCount });
  });
}
