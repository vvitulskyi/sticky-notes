import type { Point } from "./geometry";

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface PanSession {
  startPointer: Point;
  startPan: Point;
  pointerId: number;
}

export const DEFAULT_VIEWPORT: ViewportState = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
