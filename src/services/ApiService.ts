import { API_LATENCY } from "@/constants/api.constants";
import { delay } from "@/utils/async";

import type { Note } from "@/types/note";

export class ApiService {
  #mockNotes: Note[] = [];

  async saveNote(note: Note): Promise<void> {
    await delay(API_LATENCY);

    const index = this.#mockNotes.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      this.#mockNotes[index] = note;
    } else {
      this.#mockNotes.push(note);
    }
  }

  async loadNotes(): Promise<Note[]> {
    await delay(API_LATENCY);

    return [...this.#mockNotes];
  }
}
