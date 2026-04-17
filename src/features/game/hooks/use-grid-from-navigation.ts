"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { consumePlayGridPayloadFromSession } from "../lib/play-navigation-payload";
import type { GridPlaySnapshot } from "../lib/grid-types";

export type PlayGridNavigationEvent =
  | { kind: "loaded"; snapshot: GridPlaySnapshot }
  | { kind: "invalid" }
  | { kind: "none" };

/**
 * Une fois au montage : lit et retire le payload sessionStorage quand on ouvre une grille depuis l'extérieur.
 */
export function usePlayGridPayloadOnMount(
  onEvent: (event: PlayGridNavigationEvent) => void,
): void {
  const onEventRef = useRef(onEvent);

  /** Pas d’écriture dans `ref.current` pendant le rendu (règle React 19 / compilateur). */
  useLayoutEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const result = consumePlayGridPayloadFromSession();
    if (result.kind === "ok") {
      onEventRef.current({ kind: "loaded", snapshot: result.snapshot });
      return;
    }
    if (result.kind === "invalid") {
      onEventRef.current({ kind: "invalid" });
      return;
    }
    onEventRef.current({ kind: "none" });
  }, []);
}
