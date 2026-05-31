import type { Point } from "@/types/geometry";

export function getPointerPosition(event: PointerEvent): Point {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

export function capturePointerOnElement(
  element: Element,
  pointerId: number,
): void {
  element.setPointerCapture(pointerId);
}

export function releasePointerOnElement(
  element: Element,
  pointerId: number,
): void {
  if (element.hasPointerCapture(pointerId)) {
    element.releasePointerCapture(pointerId);
  }
}
