import { NextResponse } from "next/server";
import { z } from "zod";

import { geminiGridCommandJson } from "@/features/game/lib/gemini-grid-llm";
import {
  MAX_GRID_CELLS,
  parseAndValidateGridCommandBatchJson,
} from "@/features/game/lib/grid-command";
import { GRID_AI_PROMPT_MAX_LENGTH } from "@/features/game/lib/post-grid-ai-command";
import { requireUserId } from "@/lib/grids-api/route-auth";

export const runtime = "nodejs";

const gridCoordSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

const postBodySchema = z
  .object({
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
    aliveCells: z.array(gridCoordSchema),
  })
  .superRefine((data, ctx) => {
    const { gridSize, aliveCells } = data;
    for (let i = 0; i < aliveCells.length; i++) {
      const c = aliveCells[i]!;
      if (c.x < 1 || c.x > gridSize.x || c.y < 1 || c.y > gridSize.y) {
        ctx.addIssue({
          code: "custom",
          message: `Cellule hors grille : (${c.x}, ${c.y}) ; bornes 1..${gridSize.x} × 1..${gridSize.y}.`,
          path: ["aliveCells", i],
        });
        return;
      }
    }
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

  const { prompt, gridSize, aliveCells } = parsed.data;

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) {
    return NextResponse.json(
      {
        error:
          "Commande IA indisponible : la clé Gemini (GEMINI_API_KEY) n’est pas configurée sur le serveur.",
      },
      { status: 503 },
    );
  }

  let commandJson: string;
  try {
    commandJson = await geminiGridCommandJson(
      geminiKey,
      prompt,
      gridSize,
      aliveCells,
    );
  } catch {
    return NextResponse.json(
      { error: "Le service IA a échoué. Réessayez plus tard." },
      { status: 502 },
    );
  }

  const batch = parseAndValidateGridCommandBatchJson(commandJson, gridSize);
  if (!batch.ok) {
    return NextResponse.json({ error: batch.error }, { status: 500 });
  }

  const normalizedJson = JSON.stringify({ commands: batch.commands });
  return NextResponse.json({ commandJson: normalizedJson });
}
