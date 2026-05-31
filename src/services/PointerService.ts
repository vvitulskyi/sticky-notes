import {
  getDelta,
  screenDeltaToWorldDelta,
  screenToWorld,
} from "@/utils/geometry";
import { getPointerPosition } from "@/utils/pointer";

import type { ViewportService } from "./ViewportService";
import type { Point, Size } from "@/types/geometry";

export class PointerService {
  #viewportElement: HTMLElement | null = null;

  constructor(private readonly viewportService: ViewportService) {}

  #getOrigin(): Point {
    if (!this.#viewportElement) {
      return { x: 0, y: 0 };
    }
    const rect = this.#viewportElement.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  get originPoint(): Point {
    return this.#getOrigin();
  }

  getViewportSize(): Size | null {
    if (!this.#viewportElement) {
      return null;
    }

    const rect = this.#viewportElement.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  setViewportElement(element: HTMLElement | null): void {
    this.#viewportElement = element;
  }

  getScreenPositionFromEvent(event: PointerEvent): Point {
    return getPointerPosition(event);
  }

  getWorldPositionFromEvent(event: PointerEvent): Point {
    return screenToWorld(
      event.clientX,
      event.clientY,
      this.viewportService.state,
      this.originPoint,
    );
  }

  getWorldDelta(current: Point, start: Point): Point {
    const delta = getDelta(current, start);
    return screenDeltaToWorldDelta(delta, this.viewportService.state.zoom);
  }
}
