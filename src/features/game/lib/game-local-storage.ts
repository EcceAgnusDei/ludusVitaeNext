import type { GridPlaySnapshot } from "./grid-types";
import { parseSavedGridData } from "./saved-grid-play";

const LOCAL_STORAGE_KEY = "grid";

export function saveGridToLocalStorage(snapshot: GridPlaySnapshot): void {
  const payload = {
    aliveCells: snapshot.aliveCells,
    gridSize: snapshot.gridSize,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

export function loadGridFromLocalStorage(): GridPlaySnapshot | null {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return parseSavedGridData(parsed);
}
