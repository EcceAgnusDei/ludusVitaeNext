import { parseSavedGridData } from "./saved-grid-play";
import type { GridPlaySnapshot } from "./grid-types";

/**
 * Clé sessionStorage : à définir avant `router.push("/jeu")` depuis le dashboard
 * (remplace l’état React Router `location.state.savedGridData`).
 */
export const PLAY_GRID_SESSION_STORAGE_KEY = "ludusVitae:playGridPayload";

export type ConsumePlayGridPayloadResult =
  | { kind: "ok"; snapshot: GridPlaySnapshot }
  | { kind: "invalid" }
  | { kind: "none" };

export function consumePlayGridPayloadFromSession(): ConsumePlayGridPayloadResult {
  if (typeof window === "undefined") return { kind: "none" };
  try {
    const raw = sessionStorage.getItem(PLAY_GRID_SESSION_STORAGE_KEY);
    if (raw == null || raw === "") return { kind: "none" };
    sessionStorage.removeItem(PLAY_GRID_SESSION_STORAGE_KEY);
    const data: unknown = JSON.parse(raw);
    const parsed = parseSavedGridData(data);
    if (!parsed) return { kind: "invalid" };
    return { kind: "ok", snapshot: parsed };
  } catch {
    return { kind: "invalid" };
  }
}
