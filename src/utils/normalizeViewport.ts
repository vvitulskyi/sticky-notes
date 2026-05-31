import { MAX_ZOOM, MIN_ZOOM, type ViewportState } from "@/types/viewport";

import { clamp } from "./clamp";

export function normalizeViewport(raw: unknown): ViewportState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const viewport = raw as Partial<ViewportState>;
  if (
    typeof viewport.panX !== "number" ||
    typeof viewport.panY !== "number" ||
    typeof viewport.zoom !== "number"
  ) {
    return null;
  }

  return {
    panX: viewport.panX,
    panY: viewport.panY,
    zoom: clamp(viewport.zoom, MIN_ZOOM, MAX_ZOOM),
  };
}
