import { useEffect, useState } from "react";

import {
  notesStore,
  persistenceService,
  viewportService,
  zIndexService,
} from "@/services";
import { alertError } from "@/utils/error";

export function usePersistence() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { notes, viewport } = await persistenceService.hydrate();
        if (cancelled) {
          return;
        }

        viewportService.restoreState(viewport);

        if (notes.length > 0) {
          notesStore.dispatch({ type: "SET_NOTES", notes });
          zIndexService.syncFromNotes(notes);
        }

        persistenceService.init();
      } catch (error) {
        alertError(error);
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isLoading };
}
