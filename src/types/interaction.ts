import type { Point } from "./geometry";
import type { NoteId } from "./note";

export type InteractionState =
  | { type: "idle" }
  | { type: "dragging"; noteId: NoteId }
  | { type: "resizing"; noteId: NoteId };

export type TrashChecker = (noteId: NoteId) => boolean;

export interface DragSession {
  noteId: NoteId;
  startPointer: Point;
  startPosition: Point;
  capturedElement: Element;
  pointerId: number;
}

export interface ResizeSession {
  noteId: NoteId;
  startPointer: Point;
  startSize: { width: number; height: number };
  capturedElement: Element;
  pointerId: number;
}
