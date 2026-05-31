import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import {
  interactionService,
  notesStore,
  pointerService,
  viewportService,
} from "@/services";
import { worldRectToScreen } from "@/utils/geometry";
import { intersects, rectFromDOM } from "@/utils/rect";

import type { NoteId } from "@/types/note";

function getTrashOverlapSnapshot(): boolean {
  return interactionService.isTrashOverlapped;
}

export function useTrashZone() {
  const trashRef = useRef<HTMLDivElement>(null);

  const isHighlighted = useSyncExternalStore(
    interactionService.subscribeTrashOverlap,
    getTrashOverlapSnapshot,
    getTrashOverlapSnapshot,
  );

  const checkNoteOverlapsTrash = useCallback((noteId: NoteId): boolean => {
    const trashEl = trashRef.current;
    if (!trashEl) {
      return false;
    }

    const note = notesStore.getNote(noteId);
    if (!note) {
      return false;
    }

    const viewport = viewportService.state;
    const origin = pointerService.originPoint;
    const noteScreenRect = worldRectToScreen(
      { x: note.x, y: note.y, width: note.width, height: note.height },
      viewport,
      origin,
    );

    return intersects(noteScreenRect, rectFromDOM(trashEl));
  }, []);

  useEffect(() => {
    interactionService.setTrashChecker(checkNoteOverlapsTrash);
    return () => interactionService.setTrashChecker(null);
  }, [checkNoteOverlapsTrash]);

  return { trashRef, isHighlighted };
}

function getInteractionStateSnapshot() {
  return interactionService.interactionState;
}

export function useInteractionState(noteId: NoteId) {
  const interactionState = useSyncExternalStore(
    interactionService.subscribeInteraction,
    getInteractionStateSnapshot,
    getInteractionStateSnapshot,
  );

  const isDragging =
    interactionState.type === "dragging" && interactionState.noteId === noteId;
  const isResizing =
    interactionState.type === "resizing" && interactionState.noteId === noteId;

  return { isDragging, isResizing };
}

export function useTrashOverlapForNote(noteId: NoteId) {
  const isHighlighted = useSyncExternalStore(
    interactionService.subscribeTrashOverlap,
    getTrashOverlapSnapshot,
    getTrashOverlapSnapshot,
  );

  const interactionState = useSyncExternalStore(
    interactionService.subscribeInteraction,
    getInteractionStateSnapshot,
    getInteractionStateSnapshot,
  );

  const isDraggingThis =
    interactionState.type === "dragging" && interactionState.noteId === noteId;

  return isDraggingThis && isHighlighted;
}
