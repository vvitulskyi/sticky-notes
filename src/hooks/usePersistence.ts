import { useEffect, useState } from "react";

import {
  apiService,
  notesStore,
  persistenceService,
  viewportService,
  zIndexService,
} from "@/services";
import { alertError } from "@/utils/error";

export function usePersistence() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const viewport = persistenceService.loadViewportFromStorage();
    viewportService.restoreState(viewport);

    persistenceService.init();

    let cancelled = false;

    void (async () => {
      const stored = persistenceService.loadFromStorage();
      if (stored && stored.length > 0) {
        notesStore.dispatch({ type: "SET_NOTES", notes: stored });
        zIndexService.syncFromNotes(stored);
      } else {
        try {
          const notes = await apiService.loadNotes();
          if (notes.length > 0) {
            notesStore.dispatch({ type: "SET_NOTES", notes });
            zIndexService.syncFromNotes(notes);
          }
        } catch (error) {
          alertError(error);
        }
      }

      if (!cancelled) {
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady };
}
