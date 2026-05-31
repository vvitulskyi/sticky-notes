import { pointerService, viewportService } from "@/services";

const ZOOM_SENSITIVITY = 0.001;

function normalizeWheelDelta(event: WheelEvent): number {
  let delta = event.deltaY;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    delta *= 16;
  } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    delta *= 800;
  }
  return delta;
}

export function attachViewportControls(element: HTMLElement): () => void {
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    const delta = normalizeWheelDelta(event);
    const factor = Math.exp(-delta * ZOOM_SENSITIVITY);
    const origin = pointerService.originPoint;

    viewportService.zoomAt(factor, event.clientX, event.clientY, origin);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    if ((event.target as Element).closest("[data-note-id]")) {
      return;
    }

    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    element.style.cursor = "grabbing";
    viewportService.startPanSession(
      event.clientX,
      event.clientY,
      event.pointerId,
    );
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!viewportService.isPanning) {
      return;
    }
    viewportService.updatePanSession(
      event.clientX,
      event.clientY,
      event.pointerId,
    );
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!viewportService.isPanning) {
      return;
    }
    viewportService.endPanSession(event.pointerId);
    element.style.cursor = "";
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  };

  element.addEventListener("wheel", handleWheel, { passive: false });
  element.addEventListener("pointerdown", handlePointerDown);
  element.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerup", handlePointerUp);
  element.addEventListener("pointercancel", handlePointerUp);

  return () => {
    element.removeEventListener("wheel", handleWheel);
    element.removeEventListener("pointerdown", handlePointerDown);
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerup", handlePointerUp);
    element.removeEventListener("pointercancel", handlePointerUp);
  };
}
