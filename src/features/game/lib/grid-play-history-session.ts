import type { GridPlaySnapshot } from "./grid-types";

export const GRID_PLAY_UNDO_STACK_SESSION_KEY =
  "ludusvitae:grid-play-undo-stack";

export const GRID_PLAY_REDO_STACK_SESSION_KEY =
  "ludusvitae:grid-play-redo-stack";

export const GRID_PLAY_HISTORY_STACK_MAX = 100;

function capStackToMax(stack: GridPlaySnapshot[]): GridPlaySnapshot[] {
  if (stack.length <= GRID_PLAY_HISTORY_STACK_MAX) return stack;
  return stack.slice(-GRID_PLAY_HISTORY_STACK_MAX);
}

function parseSnapshotStackJson(raw: string | null): GridPlaySnapshot[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GridPlaySnapshot[]) : [];
  } catch {
    return [];
  }
}

function readUndoStackFromSession(): GridPlaySnapshot[] {
  if (typeof sessionStorage === "undefined") return [];
  return parseSnapshotStackJson(
    sessionStorage.getItem(GRID_PLAY_UNDO_STACK_SESSION_KEY),
  );
}

function writeUndoStackToSession(stack: GridPlaySnapshot[]): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    GRID_PLAY_UNDO_STACK_SESSION_KEY,
    JSON.stringify(capStackToMax(stack)),
  );
}

function readRedoStackFromSession(): GridPlaySnapshot[] {
  if (typeof sessionStorage === "undefined") return [];
  return parseSnapshotStackJson(
    sessionStorage.getItem(GRID_PLAY_REDO_STACK_SESSION_KEY),
  );
}

function writeRedoStackToSession(stack: GridPlaySnapshot[]): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    GRID_PLAY_REDO_STACK_SESSION_KEY,
    JSON.stringify(capStackToMax(stack)),
  );
}

export function clearGridPlayHistorySessionStacks(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(GRID_PLAY_UNDO_STACK_SESSION_KEY);
  sessionStorage.removeItem(GRID_PLAY_REDO_STACK_SESSION_KEY);
}

export function appendGridPlaySnapshotToSessionUndoStack(
  snapshot: GridPlaySnapshot,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    writeRedoStackToSession([]);
    const stack = readUndoStackFromSession();
    stack.push(snapshot);
    writeUndoStackToSession(stack);
  } catch {
    return;
  }
}

export function getUndoRedoAvailabilityFromSession(): {
  canUndo: boolean;
  canRedo: boolean;
} {
  return {
    canUndo: readUndoStackFromSession().length > 0,
    canRedo: readRedoStackFromSession().length > 0,
  };
}

export function applyUndoStepInSession(
  currentSnapshot: GridPlaySnapshot,
): GridPlaySnapshot | null {
  const undoStack = readUndoStackFromSession();
  if (undoStack.length === 0) return null;
  const previous = undoStack[undoStack.length - 1]!;
  const newUndo = undoStack.slice(0, -1);
  const redoStack = readRedoStackFromSession();
  redoStack.push(currentSnapshot);
  writeUndoStackToSession(newUndo);
  writeRedoStackToSession(redoStack);
  return previous;
}

export function applyRedoStepInSession(
  currentSnapshot: GridPlaySnapshot,
): GridPlaySnapshot | null {
  const redoStack = readRedoStackFromSession();
  if (redoStack.length === 0) return null;
  const next = redoStack[redoStack.length - 1]!;
  const newRedo = redoStack.slice(0, -1);
  const undoStack = readUndoStackFromSession();
  undoStack.push(currentSnapshot);
  writeRedoStackToSession(newRedo);
  writeUndoStackToSession(undoStack);
  return next;
}
