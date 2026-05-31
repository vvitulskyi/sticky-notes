import type { Rect } from "@/types/geometry";

export function intersects(rectA: Rect, rectB: Rect): boolean {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}

export function rectFromDOM(element: Element): Rect {
  const domRect = element.getBoundingClientRect();
  return {
    x: domRect.x,
    y: domRect.y,
    width: domRect.width,
    height: domRect.height,
  };
}

export function domRectToRect(domRect: DOMRect): Rect {
  return {
    x: domRect.x,
    y: domRect.y,
    width: domRect.width,
    height: domRect.height,
  };
}
