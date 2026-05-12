"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  type MouseEvent,
  useRef,
  useState,
} from "react";

import {
  cellIndexToCoord,
  computeNextGeneration,
  toCellIndex,
} from "@/features/game/lib/game-of-life";
import type { GridCoord } from "@/features/game/lib/grid-types";

export type GridHandle = {
  getAliveCellsCoords: () => GridCoord[];
  applyAliveCells: (coords: GridCoord[]) => void;
  resize: (value: string | GridCoord) => void;
  play: () => void;
  pause: () => void;
  step: () => void;
  handleSpeed: (divider: number) => void;
  gridSize: { x: number; y: number };
  cellSize: string;
};

type GridProps = {
  playable?: boolean;
  initialGridSize?: GridCoord | null;
  initialAliveCells?: GridCoord[] | null;
  initialCellSize?: string | null;
};

type ThemeColors = {
  fg: string;
  bg: string;
  border: string;
};

const DEFAULT_GRID = { x: 50, y: 30 };
const DEFAULT_CELL_SIZE = "20px";
const BASE_INTERVAL_MS = 2000;

function parseCellPx(cellSize: string): number {
  const n = Number.parseInt(cellSize, 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

function readThemeColors(): ThemeColors {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  return {
    fg: cs.getPropertyValue("--foreground").trim() || "#000000",
    bg: cs.getPropertyValue("--background").trim() || "#ffffff",
    border: cs.getPropertyValue("--border").trim() || "#000000",
  };
}

function normalizeAliveToIndexSet(
  coords: GridCoord[] | null,
  gridSize: GridCoord,
): Set<number> {
  if (!coords?.length) return new Set<number>();
  const out = new Set<number>();
  for (const c of coords) {
    const x = Math.trunc(c.x);
    const y = Math.trunc(c.y);
    if (x < 1 || x > gridSize.x || y < 1 || y > gridSize.y) continue;
    out.add(toCellIndex(x, y, gridSize.x));
  }
  return out;
}

function reindexAliveForResize(
  prevAlive: Set<number>,
  prevSize: GridCoord,
  nextSize: GridCoord,
): Set<number> {
  const nextAlive = new Set<number>();
  for (const idx of prevAlive) {
    const { x, y } = cellIndexToCoord(idx, prevSize.x);
    if (x < 1 || x > nextSize.x || y < 1 || y > nextSize.y) continue;
    nextAlive.add(toCellIndex(x, y, nextSize.x));
  }
  return nextAlive;
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  widthPx: number,
  heightPx: number,
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = Math.max(1, Math.floor(widthPx * dpr));
  canvas.height = Math.max(1, Math.floor(heightPx * dpr));
  canvas.style.width = `${widthPx}px`;
  canvas.style.height = `${heightPx}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawGridLayer(opts: {
  canvas: HTMLCanvasElement;
  gridSize: GridCoord;
  cellPx: number;
  colors: ThemeColors;
}) {
  const { canvas, gridSize, cellPx, colors } = opts;
  const { x: w, y: h } = gridSize;
  const wPx = w * cellPx;
  const hPx = h * cellPx;

  const ctx = setupCanvas(canvas, wPx, hPx);
  if (!ctx) return;

  ctx.clearRect(0, 0, wPx, hPx);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, wPx, hPx);

  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < w; i++) {
    const x = i * cellPx + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, hPx);
  }
  ctx.moveTo(wPx - 0.5, 0);
  ctx.lineTo(wPx - 0.5, hPx);

  for (let j = 0; j < h; j++) {
    const y = j * cellPx + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(wPx, y);
  }
  ctx.moveTo(0, hPx - 0.5);
  ctx.lineTo(wPx, hPx - 0.5);
  ctx.stroke();
}

function paintCell(
  ctx: CanvasRenderingContext2D,
  idx: number,
  width: number,
  cellPx: number,
  color: string,
) {
  const { x, y } = cellIndexToCoord(idx, width);
  const px = (x - 1) * cellPx;
  const py = (y - 1) * cellPx;
  const inset = cellPx >= 3 ? 1 : 0;
  const side = Math.max(1, cellPx - inset * 2);
  ctx.fillStyle = color;
  ctx.fillRect(px + inset, py + inset, side, side);
}

function clearCell(
  ctx: CanvasRenderingContext2D,
  idx: number,
  width: number,
  cellPx: number,
) {
  const { x, y } = cellIndexToCoord(idx, width);
  const px = (x - 1) * cellPx;
  const py = (y - 1) * cellPx;
  ctx.clearRect(px, py, cellPx, cellPx);
}

function drawCellsLayer(opts: {
  canvas: HTMLCanvasElement;
  gridSize: GridCoord;
  cellPx: number;
  colors: ThemeColors;
  alive: Set<number>;
}) {
  const { canvas, gridSize, cellPx, colors, alive } = opts;
  const wPx = gridSize.x * cellPx;
  const hPx = gridSize.y * cellPx;
  const ctx = setupCanvas(canvas, wPx, hPx);
  if (!ctx) return;

  ctx.clearRect(0, 0, wPx, hPx);
  for (const idx of alive) {
    paintCell(ctx, idx, gridSize.x, cellPx, colors.fg);
  }
}

export const Grid = forwardRef<GridHandle, GridProps>(function GridCanvas(
  {
    playable = true,
    initialGridSize = null,
    initialAliveCells = null,
    initialCellSize = null,
  },
  ref,
) {
  const [gridSize, setGridSize] = useState<GridCoord>(
    () => initialGridSize ?? DEFAULT_GRID,
  );
  const [cellSize, setCellSize] = useState<string>(
    () => initialCellSize ?? DEFAULT_CELL_SIZE,
  );
  const [alive, setAlive] = useState<Set<number>>(() =>
    normalizeAliveToIndexSet(
      initialAliveCells,
      initialGridSize ?? DEFAULT_GRID,
    ),
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [divider, setDivider] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const aliveRef = useRef(alive);
  const gridSizeRef = useRef(gridSize);
  const cellSizeRef = useRef(cellSize);
  const isPlayingRef = useRef(isPlaying);
  const dividerRef = useRef(divider);
  const playableRef = useRef(playable);

  aliveRef.current = alive;
  gridSizeRef.current = gridSize;
  cellSizeRef.current = cellSize;
  isPlayingRef.current = isPlaying;
  dividerRef.current = divider;
  playableRef.current = playable;

  const cellPx = useMemo(() => parseCellPx(cellSize), [cellSize]);
  const cssCanvasSize = useMemo(() => {
    const wPx = gridSize.x * cellPx;
    const hPx = gridSize.y * cellPx;
    return { wPx, hPx };
  }, [gridSize.x, gridSize.y, cellPx]);

  const repaintAll = useCallback(
    (aliveSet: Set<number>) => {
      const gridCanvas = gridCanvasRef.current;
      const cellsCanvas = cellsCanvasRef.current;
      if (!gridCanvas || !cellsCanvas) return;

      const colors = readThemeColors();
      drawGridLayer({ canvas: gridCanvas, gridSize, cellPx, colors });
      drawCellsLayer({
        canvas: cellsCanvas,
        gridSize,
        cellPx,
        colors,
        alive: aliveSet,
      });
    },
    [gridSize, cellPx],
  );

  const applyCellDelta = useCallback((born: Set<number>, died: Set<number>) => {
    const cellsCanvas = cellsCanvasRef.current;
    if (!cellsCanvas) return;

    const ctx = cellsCanvas.getContext("2d");
    if (!ctx) return;

    const width = gridSizeRef.current.x;
    const sizePx = parseCellPx(cellSizeRef.current);

    for (const idx of died) {
      clearCell(ctx, idx, width, sizePx);
    }
    const colors = readThemeColors();
    for (const idx of born) {
      paintCell(ctx, idx, width, sizePx, colors.fg);
    }
  }, []);

  const toggleCell = useCallback(
    (x: number, y: number) => {
      const idx = toCellIndex(x, y, gridSizeRef.current.x);
      setAlive((prev) => {
        const next = new Set(prev);
        const born = new Set<number>();
        const died = new Set<number>();

        if (next.has(idx)) {
          next.delete(idx);
          died.add(idx);
        } else {
          next.add(idx);
          born.add(idx);
        }

        aliveRef.current = next;
        applyCellDelta(born, died);
        return next;
      });
    },
    [applyCellDelta],
  );

  const handleCanvasClick = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (!playableRef.current) return;

      const canvas = cellsCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const x = Math.floor(localX / cellPx) + 1;
      const y = Math.floor(localY / cellPx) + 1;

      if (
        x < 1 ||
        x > gridSizeRef.current.x ||
        y < 1 ||
        y > gridSizeRef.current.y
      ) {
        return;
      }
      toggleCell(x, y);
    },
    [cellPx, toggleCell],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceOneGeneration = useCallback(() => {
    setAlive((prevAlive) => {
      const { x: maxX, y: maxY } = gridSizeRef.current;
      const { born, died } = computeNextGeneration(prevAlive, maxX, maxY);
      if (born.size === 0 && died.size === 0) return prevAlive;

      const nextAlive = new Set(prevAlive);
      for (const idx of died) nextAlive.delete(idx);
      for (const idx of born) nextAlive.add(idx);
      aliveRef.current = nextAlive;
      applyCellDelta(born, died);
      return nextAlive;
    });
  }, [applyCellDelta]);

  const scheduleNext = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(
      () => {
        advanceOneGeneration();
        if (isPlayingRef.current) {
          scheduleNext();
        }
      },
      BASE_INTERVAL_MS / Math.max(1, dividerRef.current),
    );
  }, [advanceOneGeneration, clearTimer]);

  useLayoutEffect(() => {
    repaintAll(aliveRef.current);
  }, [repaintAll]);

  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }
    scheduleNext();
    return clearTimer;
  }, [isPlaying, divider, scheduleNext, clearTimer]);

  useImperativeHandle(
    ref,
    () => ({
      get gridSize() {
        return { ...gridSizeRef.current };
      },
      get cellSize() {
        return cellSizeRef.current;
      },
      getAliveCellsCoords: () => {
        const out: GridCoord[] = [];
        const width = gridSizeRef.current.x;
        for (const idx of aliveRef.current) {
          const { x, y } = cellIndexToCoord(idx, width);
          out.push({ x, y });
        }
        return out;
      },
      applyAliveCells: (coords: GridCoord[]) => {
        const next = normalizeAliveToIndexSet(coords, gridSizeRef.current);
        aliveRef.current = next;
        setAlive(next);
        repaintAll(next);
      },
      resize: (value) => {
        if (typeof value === "string") {
          cellSizeRef.current = value;
          setCellSize(value);
          return;
        }

        const nextSize = { x: value.x, y: value.y };
        const migrated = reindexAliveForResize(
          aliveRef.current,
          gridSizeRef.current,
          nextSize,
        );
        aliveRef.current = migrated;
        setAlive(migrated);
        setGridSize(nextSize);
        gridSizeRef.current = nextSize;
      },
      play: () => setIsPlaying(true),
      pause: () => {
        clearTimer();
        setIsPlaying(false);
      },
      step: () => {
        advanceOneGeneration();
      },
      handleSpeed: (d: number) => {
        setDivider(d);
      },
    }),
    [advanceOneGeneration, clearTimer, repaintAll],
  );

  return (
    <div
      className="relative block"
      style={{
        width: `${cssCanvasSize.wPx}px`,
        height: `${cssCanvasSize.hPx}px`,
      }}
    >
      <canvas
        ref={gridCanvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      />
      <canvas
        ref={cellsCanvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0"
        aria-hidden
      />
    </div>
  );
});

Grid.displayName = "GridCanvas";
