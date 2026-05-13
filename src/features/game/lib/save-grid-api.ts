import { GRIDS_NETWORK_ERROR_MESSAGE } from "@/lib/grids-client-errors";

import type { SaveGridApiBody } from "./build-save-grid-payload";

export type PostSaveGridResult =
  | { ok: true; gridId: string | null }
  | { ok: false; error: string };

function jsonParse(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function errorMessageFromGridsResponse(
  res: Response,
  parsed: unknown,
  fallback: string,
): string {
  const apiError =
    parsed &&
    typeof parsed === "object" &&
    "error" in parsed &&
    typeof (parsed as { error: unknown }).error === "string"
      ? (parsed as { error: string }).error
      : null;
  return (
    apiError ??
    (res.status === 401 ? "Session expirée ou non connecté." : fallback)
  );
}

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

    const text = await res.text();
    const parsed = jsonParse(text);

    if (!res.ok) {
      return {
        ok: false,
        error: errorMessageFromGridsResponse(
          res,
          parsed,
          "Échec de l'enregistrement, veuillez réessayer.",
        ),
      };
    }

    let gridId: string | null = null;
    if (
      parsed &&
      typeof parsed === "object" &&
      "id" in parsed &&
      typeof (parsed as { id: unknown }).id === "string"
    ) {
      gridId = (parsed as { id: string }).id;
    }

    return { ok: true, gridId };
  } catch {
    return { ok: false, error: GRIDS_NETWORK_ERROR_MESSAGE };
  }
}

export async function patchSavedGridData(
  gridId: string,
  data: SaveGridApiBody["data"],
): Promise<PostSaveGridResult> {
  try {
    const res = await fetch(`/api/grids/${encodeURIComponent(gridId)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    const text = await res.text();
    const parsed = jsonParse(text);

    if (!res.ok) {
      return {
        ok: false,
        error: errorMessageFromGridsResponse(
          res,
          parsed,
          "Échec de la mise à jour, veuillez réessayer.",
        ),
      };
    }

    return { ok: true, gridId };
  } catch {
    return { ok: false, error: GRIDS_NETWORK_ERROR_MESSAGE };
  }
}
