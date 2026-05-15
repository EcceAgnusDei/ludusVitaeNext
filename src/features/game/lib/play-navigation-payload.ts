import { parseSavedGridData } from "./saved-grid-play";
import type { GridPlaySnapshot } from "./grid-handle-snapshot";

export const PLAY_GRID_SESSION_STORAGE_KEY = "ludusVitae:playGridPayload";

export const PLAY_GRID_UPDATE_GRID_ID_KEY = "updateGridId";

export const PLAY_GRID_UPDATE_GRID_LIKE_COUNT_KEY = "likeCount";

function parseLikeCountFromPayload(d: Record<string, unknown>): number {
  const raw = d[PLAY_GRID_UPDATE_GRID_LIKE_COUNT_KEY];
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return Math.floor(raw);
  }
  return 0;
}

function stripNavigationMetaKeys(rest: Record<string, unknown>): void {
  delete rest[PLAY_GRID_UPDATE_GRID_ID_KEY];
  delete rest[PLAY_GRID_UPDATE_GRID_LIKE_COUNT_KEY];
}

function parsePlayGridSessionPayload(data: unknown): {
  snapshot: GridPlaySnapshot;
  updateGridId: string | null;
  likeCount: number;
} | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const idRaw = d[PLAY_GRID_UPDATE_GRID_ID_KEY];
  const updateGridId =
    typeof idRaw === "string" && idRaw.trim().length > 0 ? idRaw.trim() : null;
  const likeCountTop = parseLikeCountFromPayload(d);
  if (updateGridId !== null) {
    const rest = { ...d };
    stripNavigationMetaKeys(rest);
    const snapshot = parseSavedGridData(rest);
    if (!snapshot) return null;
    return { snapshot, updateGridId, likeCount: likeCountTop };
  }
  const snapshot = parseSavedGridData(data);
  if (!snapshot) return null;
  return { snapshot, updateGridId: null, likeCount: likeCountTop };
}

export type ConsumePlayGridPayloadResult =
  | {
      kind: "ok";
      snapshot: GridPlaySnapshot;
      updateGridId: string | null;
      likeCount: number;
    }
  | { kind: "invalid" }
  | { kind: "none" };

export function consumePlayGridPayloadFromSession(): ConsumePlayGridPayloadResult {
  if (typeof window === "undefined") return { kind: "none" };
  try {
    const raw = sessionStorage.getItem(PLAY_GRID_SESSION_STORAGE_KEY);
    if (raw == null || raw === "") return { kind: "none" };
    sessionStorage.removeItem(PLAY_GRID_SESSION_STORAGE_KEY);
    const data: unknown = JSON.parse(raw);
    const parsed = parsePlayGridSessionPayload(data);
    if (!parsed) return { kind: "invalid" };
    return {
      kind: "ok",
      snapshot: parsed.snapshot,
      updateGridId: parsed.updateGridId,
      likeCount: parsed.likeCount,
    };
  } catch {
    return { kind: "invalid" };
  }
}
