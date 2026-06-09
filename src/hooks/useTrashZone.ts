import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import {
  interactionService,
  notesStore,
  pointerService,
  viewportService,
} from "@/services";
import { worldRectToScreen } from "@/utils/geometry";
import { intersects, rectFromDOM } from "@/utils/rect";

import type { Point } from "@/types/geometry";
import type { NoteId } from "@/types/note";

function getIsResizingSnapshot(noteId: NoteId): boolean {
  const state = interactionService.interactionState;
  return state.type === "resizing" && state.noteId === noteId;
}

export function useTrashZone() {
  const trashRef = useRef<HTMLDivElement>(null);

  const checkNoteOverlapsTrash = useCallback(
    (noteId: NoteId, position?: Point): boolean => {
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
        {
          x: position?.x ?? note.x,
          y: position?.y ?? note.y,
          width: note.width,
          height: note.height,
        },
        viewport,
        origin,
      );

      return intersects(noteScreenRect, rectFromDOM(trashEl));
    },
    [],
  );

  useEffect(() => {
    interactionService.setTrashChecker(checkNoteOverlapsTrash);
    return () => interactionService.setTrashChecker(null);
  }, [checkNoteOverlapsTrash]);

  const setTrashRef = useCallback((element: HTMLDivElement | null) => {
    trashRef.current = element;
    interactionService.setTrashHitArea(element);
  }, []);

  return { trashRef: setTrashRef };
}

export function useInteractionState(noteId: NoteId) {
  const isResizing = useSyncExternalStore(
    interactionService.subscribeInteraction,
    () => getIsResizingSnapshot(noteId),
    () => getIsResizingSnapshot(noteId),
  );

  return { isResizing };
}
