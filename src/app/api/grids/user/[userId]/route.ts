import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { gridsMethodNotAllowed } from "@/lib/grids/method-not-allowed";
import { listGridsForUserProfile } from "@/lib/grids/repository";
import { parseGridsUserListQuery } from "@/lib/grids/schemas";
import { getViewerId } from "@/lib/grids/route-auth";
import { withGridsRouteErrors } from "@/lib/grids/route-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ userId: string }> };

const onlyGet405 = () => gridsMethodNotAllowed("GET");

export const POST = onlyGet405;
export const PATCH = onlyGet405;
export const PUT = onlyGet405;
export const DELETE = onlyGet405;

export function GET(request: Request, ctx: RouteContext) {
  return withGridsRouteErrors(async () => {
    const { userId: profileUserId } = await ctx.params;
    const { searchParams } = new URL(request.url);
    const parsed = parseGridsUserListQuery(searchParams);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status },
      );
    }

    const viewerId = await getViewerId();
    const db = getDb();
    const rows = await listGridsForUserProfile(db, {
      profileUserId,
      viewerId,
      sort: parsed.value.sort,
    });

    return NextResponse.json(rows);
  });
}
