import { DEBOUNCE_MS } from "@/constants/persistence.constants";
import { alertError } from "@/utils/error";

import type { ApiService } from "./ApiService";
import type { ViewportService } from "./ViewportService";
import type { NotesStore } from "@/stores/NotesStore";
import type { Note, NoteId } from "@/types/note";
import type { Listener, Unsubscribe } from "@/types/subscription";
import type { ViewportState } from "@/types/viewport";

export class PersistenceService {
  #debounceTimer: ReturnType<typeof setTimeout> | null = null;
  #viewportDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  #initialized = false;
  #pendingSaves = 0;
  #statusListeners = new Set<Listener>();

  constructor(
    private readonly notesStore: NotesStore,
    private readonly viewportService: ViewportService,
    private readonly apiService: ApiService,
  ) {}

  get isSaving(): boolean {
    return this.#pendingSaves > 0;
  }

  subscribeStatus = (listener: Listener): Unsubscribe => {
    this.#statusListeners.add(listener);
    return () => this.#statusListeners.delete(listener);
  };

  #notifyStatus(): void {
    this.#statusListeners.forEach((listener) => listener());
  }

  #trackSave(promise: Promise<void>): void {
    this.#pendingSaves += 1;
    this.#notifyStatus();
    void promise.catch(alertError).finally(() => {
      this.#pendingSaves -= 1;
      this.#notifyStatus();
    });
  }

  #serializeNotes(): Note[] {
    const { notes, noteOrder } = this.notesStore.state;
    return noteOrder.map((id: NoteId) => notes[id]).filter(Boolean);
  }

  #saveViewport(): void {
    this.#trackSave(this.apiService.saveViewport(this.viewportService.state));
  }

  #scheduleViewportPersist = (): void => {
    if (this.#viewportDebounceTimer !== null) {
      clearTimeout(this.#viewportDebounceTimer);
    }
    this.#viewportDebounceTimer = setTimeout(() => {
      this.#saveViewport();
      this.#viewportDebounceTimer = null;
    }, DEBOUNCE_MS);
  };

  #schedulePersist = (): void => {
    if (this.#debounceTimer !== null) {
      clearTimeout(this.#debounceTimer);
    }
    this.#debounceTimer = setTimeout(() => {
      this.#trackSave(this.apiService.saveNotes(this.#serializeNotes()));
      this.#debounceTimer = null;
    }, DEBOUNCE_MS);
  };

  async hydrate(): Promise<{ notes: Note[]; viewport: ViewportState }> {
    const [notes, viewport] = await Promise.all([
      this.apiService.loadNotes(),
      this.apiService.loadViewport(),
    ]);
    return { notes, viewport };
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
