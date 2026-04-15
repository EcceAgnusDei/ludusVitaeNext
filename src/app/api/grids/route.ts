import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { gridsMethodNotAllowed } from "@/lib/grids/method-not-allowed";
import { createGrid } from "@/lib/grids/repository";
import { parseCreateGridBody } from "@/lib/grids/schemas";
import { requireUserId } from "@/lib/grids/route-auth";
import { withGridsRouteErrors } from "@/lib/grids/route-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const collection405 = () => gridsMethodNotAllowed("POST");

export const GET = collection405;
export const PATCH = collection405;
export const PUT = collection405;
export const DELETE = collection405;

export function POST(request: Request) {
  return withGridsRouteErrors(async () => {
    const auth = await requireUserId();
    if (!auth.ok) return auth.response;

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const parsed = parseCreateGridBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const body = parsed.value;
    const name = body.name === undefined ? null : body.name;
    const data = body.data === undefined ? {} : (body.data as object);
    const isPublic = body.isPublic === undefined ? true : body.isPublic;

    const db = getDb();
    const row = await createGrid(db, {
      id: randomUUID(),
      userId: auth.userId,
      name,
      data,
      isPublic,
    });
    return NextResponse.json(row, { status: 201 });
  });
}
