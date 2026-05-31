import { useCallback } from "react";

import { interactionService } from "@/services";

import type { NoteId } from "@/types/note";

export function useDrag(noteId: NoteId) {
  const onDragPointerDown = useCallback(
    (event: React.PointerEvent, noteElement: Element) => {
      if (event.button !== 0) {
        return;
      }
      interactionService.startDrag(noteId, event, noteElement);
    },
    [noteId],
  );

  return { onDragPointerDown };
}
