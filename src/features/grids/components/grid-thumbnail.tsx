"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { Grid } from "@/features/game/components/grid-canvas";

const MIN_CELL_PX = 2;
const MAX_CELL_PX = 10;
const THUMB_MAX_HEIGHT_PX = 700;
const FALLBACK_VIEWPORT_WIDTH_PX = 1280;

function gridWidthBoundsFromViewport(viewportWidthPx: number): {
  min: number;
  max: number;
} {
  if (viewportWidthPx < 360) return { min: 100, max: viewportWidthPx };
  if (viewportWidthPx < 640) return { min: 220, max: 360 };
  if (viewportWidthPx < 1024) return { min: 280, max: 560 };
  if (viewportWidthPx < 1280) return { min: 340, max: 700 };
  return { min: 400, max: 860 };
}

function cellSizeForThumbnail(
  columns: number,
  rows: number,
  viewportWidthPx: number,
): number {
  const safeViewportWidth =
    viewportWidthPx > 0 ? viewportWidthPx : FALLBACK_VIEWPORT_WIDTH_PX;
  const bounds = gridWidthBoundsFromViewport(safeViewportWidth);
  const targetGridWidth = bounds.max;
  const fromWidth = Math.floor(targetGridWidth / columns);
  const fromHeight = Math.floor(THUMB_MAX_HEIGHT_PX / rows);
  return Math.min(
    MAX_CELL_PX,
    Math.max(MIN_CELL_PX, Math.min(fromWidth, fromHeight)),
  );
}

type ParsedPayload = {
  aliveCells: { x: number; y: number }[];
  gridSize: { x: number; y: number };
};

function parseGridPayload(data: unknown): ParsedPayload | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const gridSizeRaw = d.gridSize;
  const aliveRaw = d.aliveCells;
  if (!gridSizeRaw || typeof gridSizeRaw !== "object") return null;
  const gx = (gridSizeRaw as { x?: unknown }).x;
  const gy = (gridSizeRaw as { y?: unknown }).y;
  if (!Number.isFinite(gx) || !Number.isFinite(gy)) return null;
  const x = Number(gx);
  const y = Number(gy);
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1)
    return null;
  if (!Array.isArray(aliveRaw)) return null;

  const aliveCells: { x: number; y: number }[] = [];
  for (const c of aliveRaw) {
    if (!c || typeof c !== "object") continue;
    const cx = (c as { x?: unknown }).x;
    const cy = (c as { y?: unknown }).y;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) continue;
    aliveCells.push({ x: Number(cx), y: Number(cy) });
  }

  return { aliveCells, gridSize: { x, y } };
}

export type GridThumbnailProps = {
  gridId: string;
  data: unknown;
  caption?: string | null;
  showCreator?: boolean;
  creatorName?: string | null;
};

export function GridThumbnail({
  gridId,
  data,
  caption,
  showCreator = false,
  creatorName,
}: GridThumbnailProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [cellPx, setCellPx] = useState(MIN_CELL_PX);

  const parsed = useMemo(() => parseGridPayload(data), [data]);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot || !parsed) return;

    const update = () => {
      const viewportWidth =
        window.visualViewport?.width ?? window.innerWidth ?? 0;
      setCellPx(
        cellSizeForThumbnail(
          parsed.gridSize.x,
          parsed.gridSize.y,
          viewportWidth,
        ),
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(slot);
    const vv = window.visualViewport;
    window.addEventListener("resize", update);
    vv?.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
    };
  }, [gridId, parsed]);

  const gridMountKey = useMemo(() => {
    if (!parsed) return "";
    const aliveSig = [...parsed.aliveCells]
      .map((c) => `${c.x},${c.y}`)
      .sort()
      .join(";");
    return [
      gridId,
      cellPx,
      parsed.gridSize.x,
      parsed.gridSize.y,
      aliveSig,
    ].join("|");
  }, [gridId, cellPx, parsed]);

  if (!parsed) {
    return (
      <p className="text-muted-foreground text-xs" aria-hidden>
        —
      </p>
    );
  }

  const captionText = caption?.trim();
  const captionBlock =
    captionText != null && captionText.length > 0 ? (
      <p className="text-foreground max-w-full break-words text-center text-sm font-medium whitespace-normal">
        {captionText}
      </p>
    ) : null;

  const creatorTrimmed = creatorName?.trim();
  const creatorLine = showCreator ? (
    <p className="text-muted-foreground max-w-full break-words text-center text-xs whitespace-normal">
      {creatorTrimmed != null && creatorTrimmed.length > 0
        ? `Par ${creatorTrimmed}`
        : "Créateur inconnu"}
    </p>
  ) : null;

  return (
    <div className="flex w-fit max-w-full min-w-0 flex-col items-center gap-2">
      <div ref={slotRef} className="relative w-fit max-w-full min-w-0">
        <div className="w-fit max-w-full overflow-hidden" aria-hidden>
          <div
            className="pointer-events-none mx-auto w-fit max-w-full select-none"
            aria-hidden
          >
            <Grid
              key={gridMountKey}
              playable={false}
              initialGridSize={parsed.gridSize}
              initialAliveCells={parsed.aliveCells}
              initialCellSize={`${cellPx}px`}
            />
          </div>
        </div>
      </div>
      {showCreator ? (
        <div className="flex min-w-[150px] max-w-[250px] flex-col items-center gap-1">
          {captionBlock}
          {creatorLine}
        </div>
      ) : null}
    </div>
  );
}
