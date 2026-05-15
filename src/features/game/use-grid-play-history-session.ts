"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import type { GridHandle } from "@/features/game/components/grid-canvas";

import {
  appendGridPlaySnapshotToSessionUndoStack,
  applyRedoStepInSession,
  applyUndoStepInSession,
  clearGridPlayHistorySessionStacks,
  getUndoRedoAvailabilityFromSession,
} from "./lib/grid-play-history-session";
import {
  applyPlaySnapshotToGridTarget,
  snapshotFromGridTarget,
  type GridPlaySnapshot,
} from "./lib/grid-handle-snapshot";

type UseGridPlayHistorySessionParams = {
  gridRef: RefObject<GridHandle | null>;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
  syncInputsFromGrid: () => void;
};

export function useGridPlayHistorySession({
  gridRef,
  playing,
  setPlaying,
  syncInputsFromGrid,
}: UseGridPlayHistorySessionParams) {
  const [undoRedoAvail, setUndoRedoAvail] = useState({
    canUndo: false,
    canRedo: false,
  });

  const syncUndoRedoAvailFromSession = useCallback(() => {
    setUndoRedoAvail(getUndoRedoAvailabilityFromSession());
  }, []);

  useEffect(() => {
    if (typeof performance !== "undefined") {
      const entry = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (entry?.type === "reload") {
        clearGridPlayHistorySessionStacks();
        return;
      }
    }
    startTransition(() => {
      // evite les re-rendu en cascade (erreur ESlint)
      syncUndoRedoAvailFromSession();
    });
  }, [syncUndoRedoAvailFromSession]);

  const recordCheckpointBeforeMutation = useCallback(
    (grid: GridHandle) => {
      appendGridPlaySnapshotToSessionUndoStack(snapshotFromGridTarget(grid));
      syncUndoRedoAvailFromSession();
    },
    [syncUndoRedoAvailFromSession],
  );

  const handleUndo = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || playing) return;
    const current = snapshotFromGridTarget(grid);
    const previous = applyUndoStepInSession(current);
    if (!previous) return;
    applyPlaySnapshotToGridTarget(grid, previous);
    setPlaying(false);
    syncInputsFromGrid();
    syncUndoRedoAvailFromSession();
  }, [
    gridRef,
    playing,
    setPlaying,
    syncInputsFromGrid,
    syncUndoRedoAvailFromSession,
  ]);

  const handleRedo = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || playing) return;
    const current = snapshotFromGridTarget(grid);
    const next = applyRedoStepInSession(current);
    if (!next) return;
    applyPlaySnapshotToGridTarget(grid, next);
    setPlaying(false);
    syncInputsFromGrid();
    syncUndoRedoAvailFromSession();
  }, [
    gridRef,
    playing,
    setPlaying,
    syncInputsFromGrid,
    syncUndoRedoAvailFromSession,
  ]);

  const consumeNavigationSnapshot = useCallback(
    (snapshot: GridPlaySnapshot) => {
      clearGridPlayHistorySessionStacks();
      syncUndoRedoAvailFromSession();
      setPlaying(false);
      const grid = gridRef.current;
      if (grid) {
        applyPlaySnapshotToGridTarget(grid, snapshot);
        syncInputsFromGrid();
      }
    },
    [gridRef, syncUndoRedoAvailFromSession, setPlaying, syncInputsFromGrid],
  );

  return {
    canUndo: undoRedoAvail.canUndo,
    canRedo: undoRedoAvail.canRedo,
    recordCheckpointBeforeMutation,
    handleUndo,
    handleRedo,
    consumeNavigationSnapshot,
  };
}
