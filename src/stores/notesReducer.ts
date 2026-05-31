import type { Note, NoteId } from "@/types/note";
import type { NotesAction, NotesState } from "@/types/store";

export function createInitialState(): NotesState {
  return { notes: {}, noteOrder: [] };
}

export function notesReducer(
  state: NotesState,
  action: NotesAction,
): NotesState {
  switch (action.type) {
    case "ADD_NOTE": {
      return {
        notes: { ...state.notes, [action.note.id]: action.note },
        noteOrder: [...state.noteOrder, action.note.id],
      };
    }
    case "UPDATE_NOTE": {
      const existing = state.notes[action.id];
      if (!existing) {
        return state;
      }
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.id]: { ...existing, ...action.patch },
        },
      };
    }
    case "DELETE_NOTE": {
      if (!state.notes[action.id]) {
        return state;
      }
      const { [action.id]: _removed, ...notes } = state.notes;
      return {
        notes,
        noteOrder: state.noteOrder.filter((id) => id !== action.id),
      };
    }
    case "BRING_TO_FRONT": {
      const existing = state.notes[action.id];
      if (!existing) {
        return state;
      }
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.id]: { ...existing, zIndex: action.zIndex },
        },
      };
    }
    case "SET_NOTES": {
      const notes: Record<NoteId, Note> = {};
      const noteOrder: NoteId[] = [];
      for (const note of action.notes) {
        notes[note.id] = note;
        noteOrder.push(note.id);
      }
      return { notes, noteOrder };
    }
    default:
      return state;
  }
}
