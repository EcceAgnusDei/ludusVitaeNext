import { GRIDS_NETWORK_ERROR_MESSAGE } from "@/lib/grids-client-errors";

import type { SaveGridApiBody } from "./build-save-grid-payload";

export type PostSaveGridResult = { ok: true } | { ok: false; error: string };

export async function postSaveGrid(
  body: SaveGridApiBody,
): Promise<PostSaveGridResult> {
  try {
    const res = await fetch("/api/grids", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let parsed: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = null;
      }
    }

    if (!res.ok) {
      const apiError =
        parsed &&
        typeof parsed === "object" &&
        "error" in parsed &&
        typeof (parsed as { error: unknown }).error === "string"
          ? (parsed as { error: string }).error
          : null;
      const message =
        apiError ??
        (res.status === 401
          ? "Session expirée ou non connecté."
          : "Échec de l'enregistrement, veuillez réessayer.");
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: GRIDS_NETWORK_ERROR_MESSAGE };
  }
}
