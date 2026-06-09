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
  #trashHitArea: HTMLElement | null = null;
  #interactionListeners = new Set<Listener>();

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

  #getTrashVisual(): HTMLElement | null {
    return (
      this.#trashHitArea?.querySelector<HTMLElement>("[data-trash-visual]") ??
      null
    );
  }

  #setDragTrashOverlap(overlapped: boolean): void {
    if (!this.#dragSession || this.#dragSession.isOverTrash === overlapped) {
      return;
    }

    this.#dragSession.isOverTrash = overlapped;

    const noteEl = this.#dragSession.capturedElement as HTMLElement;
    if (overlapped) {
      noteEl.dataset.overTrash = "true";
    } else {
      delete noteEl.dataset.overTrash;
    }

    const trashVisual = this.#getTrashVisual();
    if (!trashVisual) {
      return;
    }
    if (overlapped) {
      trashVisual.dataset.active = "true";
    } else {
      delete trashVisual.dataset.active;
    }
  }

  #beginDragVisuals(): void {
    if (!this.#dragSession) {
      return;
    }
    const noteEl = this.#dragSession.capturedElement as HTMLElement;
    noteEl.dataset.dragging = "true";
  }

  #clearDragVisuals(): void {
    if (!this.#dragSession) {
      return;
    }

    const noteEl = this.#dragSession.capturedElement as HTMLElement;
    delete noteEl.dataset.dragging;
    delete noteEl.dataset.overTrash;
    noteEl.style.transform = "";

    const trashVisual = this.#getTrashVisual();
    if (trashVisual) {
      delete trashVisual.dataset.active;
    }
  }

  #handlePointerMove = (event: PointerEvent): void => {
    if (this.#dragSession && event.pointerId === this.#dragSession.pointerId) {
      const current = this.pointerService.getScreenPositionFromEvent(event);
      const delta = this.pointerService.getWorldDelta(
        current,
        this.#dragSession.startPointer,
      );
      const position = applyDelta(this.#dragSession.startPosition, delta);
      this.#dragSession.currentPosition = position;

      (this.#dragSession.capturedElement as HTMLElement).style.transform =
        `translate3d(${position.x}px, ${position.y}px, 0)`;

      if (this.#trashChecker) {
        this.#setDragTrashOverlap(
          this.#trashChecker(this.#dragSession.noteId, position),
        );
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

    const dragSession = this.#dragSession;

    if (dragSession.isOverTrash) {
      this.notesStore.dispatch({
        type: "DELETE_NOTE",
        id: dragSession.noteId,
      });
    } else {
      this.notesStore.dispatch({
        type: "UPDATE_NOTE",
        id: dragSession.noteId,
        patch: {
          x: dragSession.currentPosition.x,
          y: dragSession.currentPosition.y,
        },
      });
    }

    this.#clearDragVisuals();

    this.#dragSession.capturedElement.releasePointerCapture(
      this.#dragSession.pointerId,
    );
    this.#dragSession = null;
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

  subscribeInteraction = (listener: Listener): Unsubscribe => {
    this.#interactionListeners.add(listener);
    return () => this.#interactionListeners.delete(listener);
  };

  setTrashChecker(checker: TrashChecker | null): void {
    this.#trashChecker = checker;
  }

  setTrashHitArea(element: HTMLElement | null): void {
    this.#trashHitArea = element;
  }

  startDrag(
    noteId: NoteId,
    event: React.PointerEvent,
    noteElement: Element,
  ): void {
    if (this.#dragSession || this.#resizeSession) {
      return;
    }

    const note = this.notesStore.getNote(noteId);
    if (!note) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startPosition = { x: note.x, y: note.y };

    this.#dragSession = {
      noteId,
      startPointer: this.pointerService.getScreenPositionFromEvent(
        event.nativeEvent,
      ),
      startPosition,
      currentPosition: startPosition,
      isOverTrash: false,
      capturedElement: noteElement,
      pointerId: event.pointerId,
    };

    this.#beginDragVisuals();
  }

  startResize(
    noteId: NoteId,
    event: React.PointerEvent,
    noteElement: Element,
  ): void {
    if (this.#dragSession || this.#resizeSession) {
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
