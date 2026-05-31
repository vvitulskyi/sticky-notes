import { createInitialState, notesReducer } from "./notesReducer";

import type { Note, NoteId } from "@/types/note";
import type { NotesAction, NotesState } from "@/types/store";
import type { Listener, Unsubscribe } from "@/types/subscription";

export class NotesStore {
  #state: NotesState = createInitialState();
  #listeners = new Set<Listener>();
  #noteListeners = new Map<NoteId, Set<Listener>>();

  #notifyNoteListeners(noteId: NoteId): void {
    const set = this.#noteListeners.get(noteId);
    if (set) {
      set.forEach((listener) => listener());
    }
  }

  get state(): NotesState {
    return this.#state;
  }

  subscribe = (listener: Listener): Unsubscribe => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  subscribeNote = (noteId: NoteId, listener: Listener): Unsubscribe => {
    if (!this.#noteListeners.has(noteId)) {
      this.#noteListeners.set(noteId, new Set());
    }
    this.#noteListeners.get(noteId)!.add(listener);
    return () => {
      const set = this.#noteListeners.get(noteId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.#noteListeners.delete(noteId);
        }
      }
    };
  };

  getNote(noteId: NoteId): Note | undefined {
    return this.#state.notes[noteId];
  }

  dispatch(action: NotesAction): void {
    const prevState = this.#state;
    this.#state = notesReducer(this.#state, action);

    if (prevState === this.#state) {
      return;
    }

    switch (action.type) {
      case "UPDATE_NOTE":
      case "BRING_TO_FRONT":
        this.#notifyNoteListeners(action.id);
        this.#listeners.forEach((l) => l());
        break;
      case "DELETE_NOTE":
        this.#notifyNoteListeners(action.id);
        this.#listeners.forEach((l) => l());
        break;
      case "ADD_NOTE":
        this.#notifyNoteListeners(action.note.id);
        this.#listeners.forEach((l) => l());
        break;
      case "SET_NOTES":
        this.#listeners.forEach((l) => l());
        for (const id of this.#state.noteOrder) {
          this.#notifyNoteListeners(id);
        }
        break;
    }
  }
}
