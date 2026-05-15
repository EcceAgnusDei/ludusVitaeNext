import type { GridCoord } from "@/features/game/lib/grid-handle-snapshot";

export const GRID_AI_FEATURE_ENABLED = false;

export const GRID_AI_PROMPT_MAX_LENGTH = 2_000;
export type PostGridAiCommandBody = {
  prompt: string;
  gridSize: GridCoord;
  aliveCells: GridCoord[];
};

export type PostGridAiCommandResult =
  | { ok: true; gridSize: GridCoord; aliveCells: GridCoord[]; comment?: string }
  | { ok: false; error: string };

export async function postGridAiCommand(
  body: PostGridAiCommandBody,
): Promise<PostGridAiCommandResult> {
  if (!GRID_AI_FEATURE_ENABLED) {
    return { ok: false, error: "La commande IA est désactivée." };
  }

  if (body.prompt.length > GRID_AI_PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      error: `Le prompt est trop long (max. ${GRID_AI_PROMPT_MAX_LENGTH.toLocaleString("fr-FR")} caractères).`,
    };
  }

  let res: Response;
  try {
    res = await fetch("/api/game/grid-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "Réseau indisponible." };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "Réponse serveur illisible." };
  }

  const obj = data as {
    error?: unknown;
    gridSize?: GridCoord;
    aliveCells?: GridCoord[];
    comment?: unknown;
  };

  if (!res.ok) {
    const msg =
      typeof obj.error === "string" && obj.error.length > 0
        ? obj.error
        : `Erreur ${res.status}`;
    return { ok: false, error: msg };
  }

  if (!obj.gridSize || !Array.isArray(obj.aliveCells)) {
    return { ok: false, error: "Réponse serveur invalide." };
  }

  const comment =
    typeof obj.comment === "string" && obj.comment.trim().length > 0
      ? obj.comment.trim()
      : undefined;

  return {
    ok: true,
    gridSize: obj.gridSize,
    aliveCells: obj.aliveCells,
    ...(comment ? { comment } : {}),
  };
}
