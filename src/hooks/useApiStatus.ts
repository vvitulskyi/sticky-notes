import { useSyncExternalStore } from "react";

import { persistenceService } from "@/services";

export function useApiStatus() {
  const isSaving = useSyncExternalStore(
    persistenceService.subscribeStatus,
    () => persistenceService.isSaving,
    () => false,
  );

  return { isSaving };
}
