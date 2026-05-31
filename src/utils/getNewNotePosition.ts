import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  type Note,
} from "@/types/note";
import { getVisibleWorldRect, rectsIntersect } from "@/utils/geometry";

import type { Point, Size } from "@/types/geometry";
import type { ViewportState } from "@/types/viewport";

const NOTE_CREATE_OFFSET = 24;
const FALLBACK_POSITION: Point = { x: 100, y: 100 };

export function getNewNotePosition(
  viewport: ViewportState,
  origin: Point,
  viewportSize: Size | null,
  lastNote: Note | undefined,
  noteWidth = DEFAULT_NOTE_WIDTH,
  noteHeight = DEFAULT_NOTE_HEIGHT,
): Point {
  if (!viewportSize || viewportSize.width <= 0 || viewportSize.height <= 0) {
    return FALLBACK_POSITION;
  }

  const visibleWorld = getVisibleWorldRect(
    viewport,
    origin,
    viewportSize.width,
    viewportSize.height,
  );

  const centeredPosition: Point = {
    x: visibleWorld.x + (visibleWorld.width - noteWidth) / 2,
    y: visibleWorld.y + (visibleWorld.height - noteHeight) / 2,
  };

  if (lastNote) {
    const lastNoteRect = {
      x: lastNote.x,
      y: lastNote.y,
      width: lastNote.width,
      height: lastNote.height,
    };

    if (rectsIntersect(lastNoteRect, visibleWorld)) {
      return {
        x: lastNote.x + NOTE_CREATE_OFFSET,
        y: lastNote.y + NOTE_CREATE_OFFSET,
      };
    }
  }

  return centeredPosition;
}
