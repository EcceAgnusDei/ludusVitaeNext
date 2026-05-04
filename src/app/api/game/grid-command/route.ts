import { NextResponse } from "next/server";
import { z } from "zod";

import { fakeGridLlmJson } from "@/features/game/lib/fake-grid-llm";
import {
  MAX_GRID_CELLS,
  parseGridCommandJson,
} from "@/features/game/lib/grid-command";
import { GRID_AI_PROMPT_MAX_LENGTH } from "@/features/game/lib/post-grid-ai-command";
import { requireUserId } from "@/lib/grids-api/route-auth";

export const runtime = "nodejs";

const postBodySchema = z.object({
  prompt: z
    .string()
    .max(
      GRID_AI_PROMPT_MAX_LENGTH,
      `Le prompt ne peut pas dépasser ${GRID_AI_PROMPT_MAX_LENGTH.toLocaleString("fr-FR")} caractères.`,
    ),
  gridSize: z
    .object({
      x: z.number().int().min(1),
      y: z.number().int().min(1),
    })
    .refine(
      (g) => g.x * g.y <= MAX_GRID_CELLS,
      `La grille dépasse ${MAX_GRID_CELLS.toLocaleString("fr-FR")} cellules.`,
    ),
});

const methodNotAllowed = () =>
  NextResponse.json({ error: "Méthode non autorisée." }, { status: 405 });

export const GET = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide." },
      { status: 400 },
    );
  }

  const parsed = postBodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Requête invalide." },
      { status: 400 },
    );
  }

  const { prompt, gridSize } = parsed.data;
  const commandJson = await fakeGridLlmJson(prompt, gridSize);

  const cmd = parseGridCommandJson(commandJson);
  if (!cmd.ok) {
    return NextResponse.json(
      { error: "Réponse de commande invalide côté serveur." },
      { status: 500 },
    );
  }

  return NextResponse.json({ commandJson });
}
