import { MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH } from "@/types/note";
import { clamp } from "@/utils/clamp";
import { applyDelta } from "@/utils/geometry";

import type { PointerService } from "./PointerService";
import type { NotesStore } from "@/stores/NotesStore";
import type {
  DragSession,
  InteractionState,
  ResizeSession,
  TrashChecker,
} from "@/types/interaction";
import type { NoteId } from "@/types/note";
import type { Listener, Unsubscribe } from "@/types/subscription";

export class InteractionService {
  #interactionState: InteractionState = { type: "idle" };
  #dragSession: DragSession | null = null;
  #resizeSession: ResizeSession | null = null;
  #trashChecker: TrashChecker | null = null;
  #trashOverlap = false;
  #interactionListeners = new Set<Listener>();
  #trashOverlapListeners = new Set<Listener>();

  constructor(
    private readonly notesStore: NotesStore,
    private readonly pointerService: PointerService,
  ) {
    this.#attachWindowListeners();
  }

  #setInteractionState(next: InteractionState): void {
    this.#interactionState = next;
    this.#interactionListeners.forEach((l) => l());
  }

  #setTrashOverlap(overlapped: boolean): void {
    if (this.#trashOverlap === overlapped) {
      return;
    }
    this.#trashOverlap = overlapped;
    this.#trashOverlapListeners.forEach((l) => l());
  }

  #handlePointerMove = (event: PointerEvent): void => {
    if (this.#dragSession && event.pointerId === this.#dragSession.pointerId) {
      const current = this.pointerService.getScreenPositionFromEvent(event);
      const delta = this.pointerService.getWorldDelta(
        current,
        this.#dragSession.startPointer,
      );
      const position = applyDelta(this.#dragSession.startPosition, delta);

      this.notesStore.dispatch({
        type: "UPDATE_NOTE",
        id: this.#dragSession.noteId,
        patch: { x: position.x, y: position.y },
      });

      if (this.#trashChecker) {
        this.#setTrashOverlap(this.#trashChecker(this.#dragSession.noteId));
      }
    }

    if (
      this.#resizeSession &&
      event.pointerId === this.#resizeSession.pointerId
    ) {
      const current = this.pointerService.getScreenPositionFromEvent(event);
      const delta = this.pointerService.getWorldDelta(
        current,
        this.#resizeSession.startPointer,
      );

      this.notesStore.dispatch({
        type: "UPDATE_NOTE",
        id: this.#resizeSession.noteId,
        patch: {
          width: clamp(
            this.#resizeSession.startSize.width + delta.x,
            MIN_NOTE_WIDTH,
            2000,
          ),
          height: clamp(
            this.#resizeSession.startSize.height + delta.y,
            MIN_NOTE_HEIGHT,
            2000,
          ),
        },
      });
    }
  };

  #endDrag(): void {
    if (!this.#dragSession) {
      return;
    }

    if (this.#trashOverlap) {
      this.notesStore.dispatch({
        type: "DELETE_NOTE",
        id: this.#dragSession.noteId,
      });
    }

    this.#dragSession.capturedElement.releasePointerCapture(
      this.#dragSession.pointerId,
    );
    this.#dragSession = null;
    this.#setTrashOverlap(false);
    this.#setInteractionState({ type: "idle" });
  }

  #endResize(): void {
    if (!this.#resizeSession) {
      return;
    }
    this.#resizeSession.capturedElement.releasePointerCapture(
      this.#resizeSession.pointerId,
    );
    this.#resizeSession = null;
    this.#setInteractionState({ type: "idle" });
  }

  #handlePointerUp = (event: PointerEvent): void => {
    if (this.#dragSession && event.pointerId === this.#dragSession.pointerId) {
      this.#endDrag();
    }
    if (
      this.#resizeSession &&
      event.pointerId === this.#resizeSession.pointerId
    ) {
      this.#endResize();
    }
  };

  #attachWindowListeners(): void {
    window.addEventListener("pointermove", this.#handlePointerMove);
    window.addEventListener("pointerup", this.#handlePointerUp);
    window.addEventListener("pointercancel", this.#handlePointerUp);
  }

  get interactionState(): InteractionState {
    return this.#interactionState;
  }

  get isTrashOverlapped(): boolean {
    return this.#trashOverlap;
  }

  subscribeInteraction = (listener: Listener): Unsubscribe => {
    this.#interactionListeners.add(listener);
    return () => this.#interactionListeners.delete(listener);
  };

  subscribeTrashOverlap = (listener: Listener): Unsubscribe => {
    this.#trashOverlapListeners.add(listener);
    return () => this.#trashOverlapListeners.delete(listener);
  };

  setTrashChecker(checker: TrashChecker | null): void {
    this.#trashChecker = checker;
  }

  startDrag(
    noteId: NoteId,
    event: React.PointerEvent,
    noteElement: Element,
  ): void {
    if (this.#interactionState.type !== "idle") {
      return;
    }

    const note = this.notesStore.getNote(noteId);
    if (!note) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    this.#dragSession = {
      noteId,
      startPointer: this.pointerService.getScreenPositionFromEvent(
        event.nativeEvent,
      ),
      startPosition: { x: note.x, y: note.y },
      capturedElement: noteElement,
      pointerId: event.pointerId,
    };

    this.#setInteractionState({ type: "dragging", noteId });
  }

  startResize(
    noteId: NoteId,
    event: React.PointerEvent,
    noteElement: Element,
  ): void {
    if (this.#interactionState.type !== "idle") {
      return;
    }

    const note = this.notesStore.getNote(noteId);
    if (!note) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    this.#resizeSession = {
      noteId,
      startPointer: this.pointerService.getScreenPositionFromEvent(
        event.nativeEvent,
      ),
      startSize: { width: note.width, height: note.height },
      capturedElement: noteElement,
      pointerId: event.pointerId,
    };

    this.#setInteractionState({ type: "resizing", noteId });
  }
}
