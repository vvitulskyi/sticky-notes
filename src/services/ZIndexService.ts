import type { NotesStore } from "@/stores/NotesStore";
import type { NoteId } from "@/types/note";

export class ZIndexService {
  #nextZIndex = 1;

  constructor(private readonly notesStore: NotesStore) {}

  syncFromNotes(notes: { zIndex: number }[]): void {
    const max = notes.reduce((acc, n) => Math.max(acc, n.zIndex), 0);
    this.#nextZIndex = Math.max(this.#nextZIndex, max + 1);
  }

  allocate(): number {
    return this.#nextZIndex++;
  }

  promote(noteId: NoteId): number {
    const zIndex = this.allocate();
    this.notesStore.dispatch({ type: "BRING_TO_FRONT", id: noteId, zIndex });
    return zIndex;
  }
}
