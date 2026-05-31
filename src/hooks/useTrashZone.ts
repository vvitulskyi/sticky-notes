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

function getTrashHighlightedSnapshot(): boolean {
  const state = interactionService.interactionState;
  return state.type === "dragging" && state.isOverTrash;
}

function getIsDraggingSnapshot(noteId: NoteId): boolean {
  const state = interactionService.interactionState;
  return state.type === "dragging" && state.noteId === noteId;
}

function getIsResizingSnapshot(noteId: NoteId): boolean {
  const state = interactionService.interactionState;
  return state.type === "resizing" && state.noteId === noteId;
}

function getIsOverTrashSnapshot(noteId: NoteId): boolean {
  const state = interactionService.interactionState;
  return (
    state.type === "dragging" &&
    state.noteId === noteId &&
    state.isOverTrash
  );
}

export function useTrashZone() {
  const trashRef = useRef<HTMLDivElement>(null);

  const isHighlighted = useSyncExternalStore(
    interactionService.subscribeInteraction,
    getTrashHighlightedSnapshot,
    getTrashHighlightedSnapshot,
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

export function useInteractionState(noteId: NoteId) {
  const isDragging = useSyncExternalStore(
    interactionService.subscribeInteraction,
    () => getIsDraggingSnapshot(noteId),
    () => getIsDraggingSnapshot(noteId),
  );
  const isResizing = useSyncExternalStore(
    interactionService.subscribeInteraction,
    () => getIsResizingSnapshot(noteId),
    () => getIsResizingSnapshot(noteId),
  );

  return { isDragging, isResizing };
}

export function useTrashOverlapForNote(noteId: NoteId) {
  return useSyncExternalStore(
    interactionService.subscribeInteraction,
    () => getIsOverTrashSnapshot(noteId),
    () => getIsOverTrashSnapshot(noteId),
  );
}
