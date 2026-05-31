import type { Note, NoteId } from "./note";

export interface NotesState {
  notes: Record<NoteId, Note>;
  noteOrder: NoteId[];
}

export type NotesAction =
  | { type: "ADD_NOTE"; note: Note }
  | { type: "UPDATE_NOTE"; id: NoteId; patch: Partial<Omit<Note, "id">> }
  | { type: "DELETE_NOTE"; id: NoteId }
  | { type: "BRING_TO_FRONT"; id: NoteId; zIndex: number }
  | { type: "SET_NOTES"; notes: Note[] };
