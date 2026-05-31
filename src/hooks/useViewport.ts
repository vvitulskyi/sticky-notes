import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { pointerService, viewportService } from "@/services";

import { attachViewportControls } from "./useViewportControls";

import type { ViewportState } from "@/types/viewport";
import type { CSSProperties } from "react";

function getViewportSnapshot(): ViewportState {
  return viewportService.state;
}

export function useViewport() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const controlsCleanupRef = useRef<(() => void) | null>(null);

  const viewport = useSyncExternalStore(
    viewportService.subscribe,
    getViewportSnapshot,
    getViewportSnapshot,
  );

  const connectViewportRef = useCallback((node: HTMLDivElement | null) => {
    controlsCleanupRef.current?.();
    controlsCleanupRef.current = null;

    viewportRef.current = node;
    pointerService.setViewportElement(node);

    if (node) {
      controlsCleanupRef.current = attachViewportControls(node);
    }
  }, []);

  useEffect(() => {
    return () => controlsCleanupRef.current?.();
  }, []);

  const worldTransformStyle: CSSProperties = {
    transform: `translate3d(${viewport.panX}px, ${viewport.panY}px, 0) scale(${viewport.zoom})`,
    transformOrigin: "top left",
  };

  return { viewportRef, connectViewportRef, worldTransformStyle, viewport };
}
