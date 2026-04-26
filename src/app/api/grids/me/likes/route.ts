import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { listLikedGridsForUser } from "@/lib/grids-api/repository";
import { requireUserId } from "@/lib/grids-api/route-auth";
import {
  gridsMethodNotAllowed,
  withGridsRouteErrors,
} from "@/lib/grids-api/route-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const onlyGet405 = () => gridsMethodNotAllowed("GET");

export const POST = onlyGet405;
export const PATCH = onlyGet405;
export const PUT = onlyGet405;
export const DELETE = onlyGet405;

export function GET() {
  return withGridsRouteErrors(async () => {
    const auth = await requireUserId();
    if (!auth.ok) return auth.response;

    const db = getDb();
    const rows = await listLikedGridsForUser(db, auth.userId);
    return NextResponse.json(rows);
  });
}
