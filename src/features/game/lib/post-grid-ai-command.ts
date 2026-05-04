import type { GridCoord } from "@/features/game/lib/grid-types";

export type PostGridAiCommandBody = {
  prompt: string;
  gridSize: GridCoord;
};

export type PostGridAiCommandResult =
  | { ok: true; commandJson: string }
  | { ok: false; error: string };

export async function postGridAiCommand(
  body: PostGridAiCommandBody,
): Promise<PostGridAiCommandResult> {
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

  const obj = data as { error?: unknown; commandJson?: unknown };

  if (!res.ok) {
    const msg =
      typeof obj.error === "string" && obj.error.length > 0
        ? obj.error
        : `Erreur ${res.status}`;
    return { ok: false, error: msg };
  }

  if (typeof obj.commandJson !== "string") {
    return { ok: false, error: "Réponse serveur invalide." };
  }

  return { ok: true, commandJson: obj.commandJson };
}
