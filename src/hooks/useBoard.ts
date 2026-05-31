import { useCallback, useSyncExternalStore } from "react";

import { pointerService, viewportService, zIndexService } from "@/services";
import { getNewNotePosition } from "@/utils/getNewNotePosition";
import { notesStore } from "@/stores";
import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  NOTE_COLORS,
  type Note,
  type NoteColor,
  type NoteId,
} from "@/types/note";

let noteCounter = 0;

function generateNoteId(): NoteId {
  noteCounter += 1;
  return `note-${Date.now()}-${noteCounter}`;
}

function getNoteOrderSnapshot(): NoteId[] {
  return notesStore.state.noteOrder;
}

export function useBoard() {
  const noteOrder = useSyncExternalStore(
    notesStore.subscribe,
    getNoteOrderSnapshot,
    getNoteOrderSnapshot,
  );

  const addNote = useCallback((color?: NoteColor) => {
    const state = notesStore.state;
    const lastNoteId = state.noteOrder[state.noteOrder.length - 1];
    const lastNote = lastNoteId ? state.notes[lastNoteId] : undefined;
    const { x, y } = getNewNotePosition(
      viewportService.state,
      pointerService.originPoint,
      pointerService.getViewportSize(),
      lastNote,
    );
    const zIndex = zIndexService.allocate();
    const noteColor =
      color ?? NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

    const note: Note = {
      id: generateNoteId(),
      x,
      y,
      width: DEFAULT_NOTE_WIDTH,
      height: DEFAULT_NOTE_HEIGHT,
      text: "",
      color: noteColor,
      zIndex,
    };

    notesStore.dispatch({ type: "ADD_NOTE", note });
  }, []);

  return { noteOrder, addNote };
}

export function useNote(noteId: NoteId): Note | undefined {
  return useSyncExternalStore(
    (listener) => notesStore.subscribeNote(noteId, listener),
    () => notesStore.getNote(noteId),
    () => notesStore.getNote(noteId),
  );
}

export function useUpdateNoteText(noteId: NoteId) {
  return useCallback(
    (text: string) => {
      notesStore.dispatch({ type: "UPDATE_NOTE", id: noteId, patch: { text } });
    },
    [noteId],
  );
}

export function useUpdateNoteColor(noteId: NoteId) {
  return useCallback(
    (color: NoteColor) => {
      notesStore.dispatch({
        type: "UPDATE_NOTE",
        id: noteId,
        patch: { color },
      });
    },
    [noteId],
  );
}

export function usePromoteNote(noteId: NoteId) {
  return useCallback(() => {
    zIndexService.promote(noteId);
  }, [noteId]);
}
