import { notesStore } from "@/stores";

import { ApiService } from "./ApiService";
import { InteractionService } from "./InteractionService";
import { PersistenceService } from "./PersistenceService";
import { PointerService } from "./PointerService";
import { ViewportService } from "./ViewportService";
import { ZIndexService } from "./ZIndexService";

export const viewportService = new ViewportService();
export const pointerService = new PointerService(viewportService);
export const apiService = new ApiService();
export const zIndexService = new ZIndexService(notesStore);
export const interactionService = new InteractionService(
  notesStore,
  pointerService,
);
export const persistenceService = new PersistenceService(
  notesStore,
  viewportService,
  apiService,
);

export { notesStore } from "@/stores";

export { ApiService } from "./ApiService";
export { InteractionService } from "./InteractionService";
export { PersistenceService } from "./PersistenceService";
export { PointerService } from "./PointerService";
export { ViewportService } from "./ViewportService";
export { ZIndexService } from "./ZIndexService";
