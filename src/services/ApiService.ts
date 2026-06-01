import { API_LATENCY } from "@/constants/api.constants";
import {
  STORAGE_KEY,
  VIEWPORT_STORAGE_KEY,
} from "@/constants/persistence.constants";
import { DEFAULT_VIEWPORT, type ViewportState } from "@/types/viewport";
import { delay } from "@/utils/async";
import { alertError } from "@/utils/error";
import { normalizeNotes } from "@/utils/normalizeNotes";
import { normalizeViewport } from "@/utils/normalizeViewport";

import type { Note } from "@/types/note";

export class ApiService {
  async saveNotes(notes: Note[]): Promise<void> {
    await delay(API_LATENCY);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      alertError(error);
    }
  }

  async loadNotes(): Promise<Note[]> {
    await delay(API_LATENCY);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return normalizeNotes(parsed);
    } catch (error) {
      alertError(error);
      return [];
    }
  }

  async saveViewport(viewport: ViewportState): Promise<void> {
    await delay(API_LATENCY);

    try {
      localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport));
    } catch (error) {
      alertError(error);
    }
  }

  async loadViewport(): Promise<ViewportState> {
    await delay(API_LATENCY);

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
}
