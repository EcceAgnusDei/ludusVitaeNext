import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { gridsMethodNotAllowed } from "@/lib/grids/method-not-allowed";
import { deleteOwnedGrid, updateGridVisibility } from "@/lib/grids/repository";
import { parsePatchGridBody } from "@/lib/grids/schemas";
import { requireUserId } from "@/lib/grids/route-auth";
import { withGridsRouteErrors } from "@/lib/grids/route-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const gridResourceAllow = "PATCH, DELETE";

export function GET() {
  return gridsMethodNotAllowed(gridResourceAllow);
}

export function POST() {
  return gridsMethodNotAllowed(gridResourceAllow);
}

export function PATCH(request: Request, ctx: RouteContext) {
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

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const parsed = parsePatchGridBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const db = getDb();
    const updated = await updateGridVisibility(db, {
      gridId: id,
      ownerUserId: auth.userId,
      isPublic: parsed.value.isPublic,
    });
    if (!updated) {
      return NextResponse.json({ error: "Grille introuvable" }, { status: 404 });
    }
    return NextResponse.json(updated);
  });
}

export function DELETE(_request: Request, ctx: RouteContext) {
  return withGridsRouteErrors(async () => {
    const auth = await requireUserId();
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: "Grille introuvable" }, { status: 404 });
    }

    const db = getDb();
    const ok = await deleteOwnedGrid(db, {
      gridId: id,
      ownerUserId: auth.userId,
    });
    if (!ok) {
      return NextResponse.json({ error: "Grille introuvable" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  });
}

export function PUT() {
  return NextResponse.json(
    { error: "Utilisez PATCH pour modifier une grille." },
    { status: 405, headers: { Allow: gridResourceAllow } },
  );
}
