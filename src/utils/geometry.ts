import type { Point, Rect } from "@/types/geometry";
import type { ViewportState } from "@/types/viewport";

export function getDelta(current: Point, start: Point): Point {
  return {
    x: current.x - start.x,
    y: current.y - start.y,
  };
}

export function applyDelta(start: Point, delta: Point): Point {
  return {
    x: start.x + delta.x,
    y: start.y + delta.y,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: ViewportState,
  origin: Point,
): Point {
  const localX = screenX - origin.x;
  const localY = screenY - origin.y;
  return {
    x: (localX - viewport.panX) / viewport.zoom,
    y: (localY - viewport.panY) / viewport.zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: ViewportState,
  origin: Point,
): Point {
  return {
    x: worldX * viewport.zoom + viewport.panX + origin.x,
    y: worldY * viewport.zoom + viewport.panY + origin.y,
  };
}

export function screenDeltaToWorldDelta(delta: Point, zoom: number): Point {
  return {
    x: delta.x / zoom,
    y: delta.y / zoom,
  };
}

export function worldRectToScreen(
  rect: Rect,
  viewport: ViewportState,
  origin: Point,
): Rect {
  const topLeft = worldToScreen(rect.x, rect.y, viewport, origin);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: rect.width * viewport.zoom,
    height: rect.height * viewport.zoom,
  };
}

export function getVisibleWorldRect(
  viewport: ViewportState,
  origin: Point,
  viewportWidth: number,
  viewportHeight: number,
): Rect {
  const topLeft = screenToWorld(origin.x, origin.y, viewport, origin);
  const bottomRight = screenToWorld(
    origin.x + viewportWidth,
    origin.y + viewportHeight,
    viewport,
    origin,
  );

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
