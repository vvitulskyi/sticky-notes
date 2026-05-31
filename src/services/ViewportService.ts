import {
  DEFAULT_VIEWPORT,
  MAX_ZOOM,
  MIN_ZOOM,
  type PanSession,
  type ViewportState,
} from "@/types/viewport";
import { clamp } from "@/utils/clamp";
import { screenToWorld } from "@/utils/geometry";

import type { Point } from "@/types/geometry";
import type { Listener, Unsubscribe } from "@/types/subscription";

export class ViewportService {
  #state: ViewportState = { ...DEFAULT_VIEWPORT };
  #listeners = new Set<Listener>();
  #panSession: PanSession | null = null;

  #notify(): void {
    this.#listeners.forEach((listener) => listener());
  }

  #setState(next: ViewportState): void {
    this.#state = next;
    this.#notify();
  }

  get state(): ViewportState {
    return this.#state;
  }

  get isPanning(): boolean {
    return this.#panSession !== null;
  }

  subscribe = (listener: Listener): Unsubscribe => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  setPan(panX: number, panY: number): void {
    this.#setState({ ...this.#state, panX, panY });
  }

  zoomAt(
    factor: number,
    screenX: number,
    screenY: number,
    origin: Point,
  ): void {
    const worldBefore = screenToWorld(screenX, screenY, this.#state, origin);
    const newZoom = clamp(this.#state.zoom * factor, MIN_ZOOM, MAX_ZOOM);

    if (newZoom === this.#state.zoom) {
      return;
    }

    const localX = screenX - origin.x;
    const localY = screenY - origin.y;
    const newPanX = localX - worldBefore.x * newZoom;
    const newPanY = localY - worldBefore.y * newZoom;

    this.#setState({ zoom: newZoom, panX: newPanX, panY: newPanY });
  }

  startPanSession(screenX: number, screenY: number, pointerId: number): void {
    this.#panSession = {
      startPointer: { x: screenX, y: screenY },
      startPan: { x: this.#state.panX, y: this.#state.panY },
      pointerId,
    };
  }

  updatePanSession(screenX: number, screenY: number, pointerId: number): void {
    if (!this.#panSession || this.#panSession.pointerId !== pointerId) {
      return;
    }

    const deltaX = screenX - this.#panSession.startPointer.x;
    const deltaY = screenY - this.#panSession.startPointer.y;

    this.#setState({
      ...this.#state,
      panX: this.#panSession.startPan.x + deltaX,
      panY: this.#panSession.startPan.y + deltaY,
    });
  }

  endPanSession(pointerId: number): void {
    if (this.#panSession?.pointerId === pointerId) {
      this.#panSession = null;
    }
  }

  restoreState(viewport: ViewportState): void {
    this.#setState({
      zoom: clamp(viewport.zoom, MIN_ZOOM, MAX_ZOOM),
      panX: viewport.panX,
      panY: viewport.panY,
    });
  }
}
