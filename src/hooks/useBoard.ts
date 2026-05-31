import { useCallback, useSyncExternalStore } from "react";

import { zIndexService } from "@/services";
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
    const offset = state.noteOrder.length * 24;
    const zIndex = zIndexService.allocate();
    const noteColor =
      color ?? NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

    const note: Note = {
      id: generateNoteId(),
      x: 100 + offset,
      y: 100 + offset,
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
