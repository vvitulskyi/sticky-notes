import {
  DEBOUNCE_MS,
  STORAGE_KEY,
  VIEWPORT_STORAGE_KEY,
} from "@/constants/persistence.constants";
import { DEFAULT_VIEWPORT, type ViewportState } from "@/types/viewport";
import { alertError } from "@/utils/error";
import { normalizeNotes } from "@/utils/normalizeNotes";
import { normalizeViewport } from "@/utils/normalizeViewport";

import type { ApiService } from "./ApiService";
import type { ViewportService } from "./ViewportService";
import type { NotesStore } from "@/stores/NotesStore";
import type { Note, NoteId } from "@/types/note";

export class PersistenceService {
  #debounceTimer: ReturnType<typeof setTimeout> | null = null;
  #viewportDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  #initialized = false;

  constructor(
    private readonly notesStore: NotesStore,
    private readonly viewportService: ViewportService,
    private readonly apiService: ApiService,
  ) {}

  #serializeNotes(): Note[] {
    const { notes, noteOrder } = this.notesStore.state;
    return noteOrder.map((id: NoteId) => notes[id]).filter(Boolean);
  }

  #saveViewportToStorage(): void {
    try {
      const viewport = this.viewportService.state;
      localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport));
    } catch (error) {
      alertError(error);
    }
  }

  #scheduleViewportPersist = (): void => {
    if (this.#viewportDebounceTimer !== null) {
      clearTimeout(this.#viewportDebounceTimer);
    }
    this.#viewportDebounceTimer = setTimeout(() => {
      this.#saveViewportToStorage();
      this.#viewportDebounceTimer = null;
    }, DEBOUNCE_MS);
  };

  #persistToApi(): void {
    const notes = this.#serializeNotes();
    for (const note of notes) {
      this.apiService.saveNote(note).catch(alertError);
    }
  }

  #schedulePersist = (): void => {
    if (this.#debounceTimer !== null) {
      clearTimeout(this.#debounceTimer);
    }
    this.#debounceTimer = setTimeout(() => {
      this.saveToStorage();
      this.#persistToApi();
      this.#debounceTimer = null;
    }, DEBOUNCE_MS);
  };

  saveToStorage(): void {
    try {
      const data = this.#serializeNotes();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      alertError(error);
    }
  }

  loadFromStorage(): Note[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return normalizeNotes(parsed);
    } catch (error) {
      alertError(error);
      return null;
    }
  }

  loadViewportFromStorage(): ViewportState {
    try {
      const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_VIEWPORT };
      }
      const parsed: unknown = JSON.parse(raw);
      return normalizeViewport(parsed) ?? { ...DEFAULT_VIEWPORT };
    } catch (error) {
      alertError(error);
      return { ...DEFAULT_VIEWPORT };
    }
  }

  init(): void {
    if (this.#initialized) {
      return;
    }
    this.#initialized = true;
    this.notesStore.subscribe(this.#schedulePersist);
    this.viewportService.subscribe(this.#scheduleViewportPersist);
  }
}
