import { useCallback } from "react";

import { interactionService } from "@/services";

import type { NoteId } from "@/types/note";

export function useResize(noteId: NoteId) {
  const onResizePointerDown = useCallback(
    (event: React.PointerEvent, noteElement: Element) => {
      if (event.button !== 0) {
        return;
      }
      interactionService.startResize(noteId, event, noteElement);
    },
    [noteId],
  );

  return { onResizePointerDown };
}
