"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { Grid, type GridHandle } from "@/features/game/components/grid-canvas";
import { ConfirmAlertDialog } from "@/components/ui/alert-dialog";
import { InfoDialog } from "@/components/info-dialog";
import { authClient } from "@/lib/auth-client";

import { usePlayGridPayloadOnMount } from "../use-grid-from-navigation";
import { buildSaveGridApiBody } from "../lib/build-save-grid-payload";
import {
  loadGridFromLocalStorage,
  saveGridToLocalStorage,
} from "../lib/game-local-storage";
import {
  dedupeCoords,
  parseAndValidateGridCommandBatchJson,
} from "../lib/grid-command";
import {
  GRID_AI_PROMPT_MAX_LENGTH,
  postGridAiCommand,
} from "../lib/post-grid-ai-command";
import { patchSavedGridData, postSaveGrid } from "../lib/save-grid-api";
import { useGridPlayHistorySession } from "../use-grid-play-history-session";

import { GameSaveDbDialog } from "./game-save-db-dialog";
import { GameToolbar, MAX_GRID_CELLS } from "./game-toolbar";

const GRID_NAME_MAX_LENGTH = 60;

export function GamePageClient() {
  const gridRef = useRef<GridHandle | null>(null);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  const [playing, setPlaying] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [gridSizeInputs, setGridSizeInputs] = useState({ x: "", y: "" });
  const [cellSizeInput, setCellSizeInput] = useState("");

  const [saveDbOpen, setSaveDbOpen] = useState(false);
  const [saveDbName, setSaveDbName] = useState("");
  const [saveDbError, setSaveDbError] = useState<string | null>(null);
  const [saveDbSubmitting, setSaveDbSubmitting] = useState(false);
  const [saveDbSuccessOpen, setSaveDbSuccessOpen] = useState(false);

  const [updateGridId, setUpdateGridId] = useState<string | null>(null);
  const [updateGridLikeCount, setUpdateGridLikeCount] = useState(0);
  const [updateGridPending, setUpdateGridPending] = useState(false);
  const [updateGridLikesWarningOpen, setUpdateGridLikesWarningOpen] =
    useState(false);

  const [gridAiPrompt, setGridAiPrompt] = useState("");
  const [gridAiSubmitting, setGridAiSubmitting] = useState(false);
  const gridAiInFlightRef = useRef(false);

  const syncInputsFromGrid = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    setGridSizeInputs({
      x: `${grid.gridSize.x}`,
      y: `${grid.gridSize.y}`,
    });
    const raw = String(grid.cellSize).replace(/px$/i, "").trim();
    setCellSizeInput(raw);
  }, []);

  useLayoutEffect(() => {
    syncInputsFromGrid();
  }, [syncInputsFromGrid]);

  const {
    canUndo,
    canRedo,
    recordCheckpointBeforeMutation,
    handleUndo,
    handleRedo,
    consumeNavigationSnapshot,
  } = useGridPlayHistorySession({
    gridRef,
    playing,
    setPlaying,
    syncInputsFromGrid,
  });

  usePlayGridPayloadOnMount(
    useCallback(
      (event) => {
        if (event.kind === "loaded") {
          consumeNavigationSnapshot(event.snapshot);
          setUpdateGridId(event.updateGridId);
          setUpdateGridLikeCount(event.likeCount);
          return;
        }
        if (event.kind === "invalid") {
          setNoticeMessage("Données de grille invalides.");
        }
      },
      [consumeNavigationSnapshot],
    ),
  );

  const handlePlayToggle = () => {
    const grid = gridRef.current;
    if (!grid) return;
    if (playing) {
      grid.pause();
      setPlaying(false);
    } else {
      recordCheckpointBeforeMutation(grid);
      grid.play();
      setPlaying(true);
    }
  };

  const handleStep = () => {
    const grid = gridRef.current;
    if (!grid) return;
    recordCheckpointBeforeMutation(grid);
    grid.step();
  };

  const handleClear = () => {
    const grid = gridRef.current;
    if (!grid) return;
    if (grid.getAliveCellsCoords().length === 0) return;
    recordCheckpointBeforeMutation(grid);
    grid.applyAliveCells([]);
  };

  const handleSpeedChange = (value: number) => {
    gridRef.current?.handleSpeed(value);
  };

  const handleApplyGridSize = () => {
    const grid = gridRef.current;
    if (!grid) return;

    const x = parseInt(gridSizeInputs.x, 10);
    const y = parseInt(gridSizeInputs.y, 10);
    const total = x * y;
    if (
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 1 &&
      y >= 1 &&
      total <= MAX_GRID_CELLS
    ) {
      const aliveBefore = grid.getAliveCellsCoords();
      grid.resize({ x, y });
      grid.applyAliveCells(aliveBefore);
      syncInputsFromGrid();
    } else {
      setNoticeMessage(
        `Largeur et hauteur entières ≥ 1, avec au plus ${MAX_GRID_CELLS.toLocaleString("fr-FR")} cellules au total (largeur × hauteur).`,
      );
    }
  };

  const handleApplyCellSize = () => {
    const grid = gridRef.current;
    if (!grid) return;

    const trimmed = cellSizeInput.trim();
    const n = Number(trimmed);

    if (!Number.isFinite(n)) {
      setNoticeMessage("Entrez une valeur entière supérieure à 0.");
      syncInputsFromGrid();
      return;
    }
    if (!Number.isInteger(n)) {
      setNoticeMessage(
        "La taille d'une cellule doit être un entier (en pixels).",
      );
      syncInputsFromGrid();
      return;
    }
    if (n < 1) {
      setNoticeMessage("Entrez une valeur entière supérieure à 0.");
      syncInputsFromGrid();
      return;
    }

    grid.resize(`${n}px`);
    syncInputsFromGrid();
  };

  const handleSaveLocal = () => {
    const grid = gridRef.current;
    if (!grid) return;
    try {
      saveGridToLocalStorage({
        aliveCells: grid.getAliveCellsCoords(),
        gridSize: grid.gridSize,
      });
      setNoticeMessage("Grille enregistrée");
    } catch {
      setNoticeMessage("Impossible d'enregistrer");
    }
  };

  const handleLoadLocal = () => {
    const grid = gridRef.current;
    if (!grid) return;
    try {
      const loaded = loadGridFromLocalStorage();
      if (!loaded) throw new Error("empty");
      const { x, y } = loaded.gridSize;
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1) {
        setNoticeMessage(`Grille invalide`);
        return;
      }
      recordCheckpointBeforeMutation(grid);
      grid.pause();
      setPlaying(false);
      grid.resize({ x, y });
      grid.applyAliveCells(loaded.aliveCells);
      if (loaded.cellSize) {
        grid.resize(loaded.cellSize);
      }
      syncInputsFromGrid();
    } catch {
      setNoticeMessage("Impossible de charger la grille");
    }
  };

  const resetSaveDbModal = () => {
    setSaveDbOpen(false);
    setSaveDbName("");
    setSaveDbError(null);
    setSaveDbSubmitting(false);
  };

  const openSaveDbModal = () => {
    setSaveDbName("");
    setSaveDbError(null);
    setSaveDbSubmitting(false);
    setSaveDbOpen(true);
  };

  const handleGridAiSubmit = useCallback(async () => {
    const grid = gridRef.current;
    if (!grid || gridAiInFlightRef.current) return;
    gridAiInFlightRef.current = true;
    setGridAiSubmitting(true);
    try {
      const api = await postGridAiCommand({
        prompt: gridAiPrompt,
        gridSize: grid.gridSize,
        aliveCells: grid.getAliveCellsCoords(),
      });
      if (!api.ok) {
        setNoticeMessage(api.error);
        return;
      }
      const result = parseAndValidateGridCommandBatchJson(
        api.commandJson,
        grid.gridSize,
      );
      if (!result.ok) {
        setNoticeMessage(result.error);
        return;
      }
      if (result.commands.length > 0) {
        recordCheckpointBeforeMutation(grid);
      }
      for (const cmd of result.commands) {
        switch (cmd.action) {
          case "setAlive":
            grid.applyAliveCells(dedupeCoords(cmd.cells));
            break;
          case "resize":
            grid.resize({ x: cmd.width, y: cmd.height });
            break;
          default: {
            const _exhaustive: never = cmd;
            throw new Error(
              `Commande non gérée: ${JSON.stringify(_exhaustive)}`,
            );
          }
        }
      }
      syncInputsFromGrid();
    } finally {
      gridAiInFlightRef.current = false;
      setGridAiSubmitting(false);
    }
  }, [gridAiPrompt, syncInputsFromGrid, recordCheckpointBeforeMutation]);

  const handleSaveToDatabase = async () => {
    const grid = gridRef.current;
    if (!grid) return;
    const trimmedName = saveDbName.trim();
    if (trimmedName.length > GRID_NAME_MAX_LENGTH) {
      setSaveDbError(
        `Le nom de la grille doit contenir au plus ${GRID_NAME_MAX_LENGTH} caractères.`,
      );
      return;
    }

    const body = buildSaveGridApiBody({
      aliveCells: grid.getAliveCellsCoords(),
      gridSize: grid.gridSize,
      cellSize: grid.cellSize,
      nameTrimmed: trimmedName,
      isPublic: false,
    });

    setSaveDbSubmitting(true);
    setSaveDbError(null);
    const result = await postSaveGrid(body);
    setSaveDbSubmitting(false);

    if (!result.ok) {
      setSaveDbError(result.error);
      return;
    }

    if (result.gridId) {
      setUpdateGridId(result.gridId);
      setUpdateGridLikeCount(0);
    }

    resetSaveDbModal();
    setSaveDbSuccessOpen(true);
  };

  const handleUpdateGridExecute = async () => {
    const grid = gridRef.current;
    if (!grid || updateGridId === null) return;
    setUpdateGridPending(true);
    const result = await patchSavedGridData(updateGridId, {
      aliveCells: grid.getAliveCellsCoords(),
      gridSize: { ...grid.gridSize },
      cellSize: grid.cellSize,
    });
    setUpdateGridPending(false);
    if (!result.ok) {
      setNoticeMessage(result.error);
      return;
    }
    setUpdateGridLikeCount(0);
    setNoticeMessage("Grille mise à jour");
  };

  const handleUpdateGridClick = () => {
    if (updateGridLikeCount > 0) {
      setUpdateGridLikesWarningOpen(true);
      return;
    }
    void handleUpdateGridExecute();
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4 [&_input]:rounded-md [&_input]:border [&_input]:border-border [&_input]:bg-background [&_input]:px-2 [&_input]:py-1 [&_input]:text-sm [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-border [&_textarea]:bg-background [&_textarea]:px-2 [&_textarea]:py-1 [&_textarea]:text-sm">
      <div
        id="gridcontainer"
        className="grid min-h-0 min-w-0 max-w-full flex-1 place-items-center overflow-auto p-2"
      >
        <Grid ref={gridRef} playable />
      </div>

      <GameToolbar
        playing={playing}
        onPlayToggle={handlePlayToggle}
        onStep={handleStep}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearAllLiving={handleClear}
        onSpeedChange={handleSpeedChange}
        gridSizeInputs={gridSizeInputs}
        onGridSizeInputChange={(field, value) =>
          setGridSizeInputs((s) => ({ ...s, [field]: value }))
        }
        onApplyGridSize={handleApplyGridSize}
        cellSizeInput={cellSizeInput}
        onCellSizeInputChange={setCellSizeInput}
        onApplyCellSize={handleApplyCellSize}
        gridAiEnabled={!sessionPending && isLoggedIn}
        gridAiSessionPending={sessionPending}
        gridAiPrompt={gridAiPrompt}
        onGridAiPromptChange={(v) =>
          setGridAiPrompt(v.slice(0, GRID_AI_PROMPT_MAX_LENGTH))
        }
        onGridAiSubmit={handleGridAiSubmit}
        gridAiSubmitting={gridAiSubmitting}
        onSaveLocal={handleSaveLocal}
        onLoadLocal={handleLoadLocal}
        showSaveToDb={!sessionPending && isLoggedIn}
        onOpenSaveDb={openSaveDbModal}
        updateGridId={updateGridId}
        onUpdateGrid={() => void handleUpdateGridClick()}
        updateGridPending={updateGridPending}
      />

      <ConfirmAlertDialog
        open={updateGridLikesWarningOpen}
        onOpenChange={setUpdateGridLikesWarningOpen}
        title="Attention!"
        description={
          <>Enregistrer vos modifications les supprimera les likes.</>
        }
        cancelLabel="Annuler"
        confirmLabel="Mettre à jour"
        confirmButtonVariant="default"
        pending={updateGridPending}
        onConfirm={async () => {
          setUpdateGridLikesWarningOpen(false);
          await handleUpdateGridExecute();
        }}
      />

      <InfoDialog
        open={noticeMessage !== null}
        onOpenChange={(next) => {
          if (!next) setNoticeMessage(null);
        }}
        message={noticeMessage ?? ""}
      />

      <GameSaveDbDialog
        open={saveDbOpen}
        onOpenChange={(open) => {
          if (!open) resetSaveDbModal();
        }}
        name={saveDbName}
        onNameChange={(v) => {
          setSaveDbName(v.slice(0, GRID_NAME_MAX_LENGTH));
          if (saveDbError) setSaveDbError(null);
        }}
        maxNameLength={GRID_NAME_MAX_LENGTH}
        error={saveDbError}
        submitting={saveDbSubmitting}
        onCancel={resetSaveDbModal}
        onSubmit={handleSaveToDatabase}
      />

      <InfoDialog
        open={saveDbSuccessOpen}
        onOpenChange={setSaveDbSuccessOpen}
        title="Enregistrement réussi"
        message="La grille a été enregistrée avec succès."
        primaryActionLabel="Fermer"
      />
    </div>
  );
}
