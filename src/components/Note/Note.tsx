import { memo, useRef, useCallback } from "react";

import ColorPicker from "@/components/ColorPicker/ColorPicker";
import {
  useNote,
  useUpdateNoteText,
  useUpdateNoteColor,
  usePromoteNote,
} from "@/hooks/useBoard";
import { useDrag } from "@/hooks/useDrag";
import { useResize } from "@/hooks/useResize";
import {
  useInteractionState,
  useTrashOverlapForNote,
} from "@/hooks/useTrashZone";

import styles from "./Note.module.scss";

import type { NoteColor } from "@/types/note";
import type { NoteId } from "@/types/note";

interface NoteProps {
  noteId: NoteId;
}

function NoteComponent({ noteId }: NoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const note = useNote(noteId);
  const updateText = useUpdateNoteText(noteId);
  const updateColor = useUpdateNoteColor(noteId);
  const promoteNote = usePromoteNote(noteId);
  const { onDragPointerDown } = useDrag(noteId);
  const { onResizePointerDown } = useResize(noteId);
  const { isDragging, isResizing } = useInteractionState(noteId);
  const isOverTrash = useTrashOverlapForNote(noteId);

  const handleNotePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      promoteNote();
    },
    [promoteNote],
  );

  const handleDragDown = useCallback(
    (event: React.PointerEvent) => {
      if (noteRef.current) {
        onDragPointerDown(event, noteRef.current);
      }
    },
    [onDragPointerDown],
  );

  const handleResizeDown = useCallback(
    (event: React.PointerEvent) => {
      if (noteRef.current) {
        onResizePointerDown(event, noteRef.current);
      }
    },
    [onResizePointerDown],
  );

  const handleColorSelect = useCallback(
    (color: NoteColor) => {
      updateColor(color);
    },
    [updateColor],
  );

  if (!note) {
    return null;
  }

  const classNames = [
    styles.note,
    styles[note.color],
    isDragging ? styles.noteDragging : "",
    isResizing ? styles.noteResizing : "",
    isOverTrash ? styles.noteOverTrash : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dragHandleClass = [
    styles.dragHandle,
    isDragging ? styles.dragHandleDragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={noteRef}
      className={classNames}
      data-note-id={note.id}
      onPointerDownCapture={handleNotePointerDown}
      style={{
        transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
      }}
    >
      <div className={styles.headerBar}>
        <div className={styles.colorPickerWrap}>
          <ColorPicker
            selectedColor={note.color}
            onSelectColor={handleColorSelect}
            compact
            ariaLabel="Change note color"
          />
        </div>
        <div
          className={dragHandleClass}
          onPointerDown={handleDragDown}
          aria-label="Drag note"
        />
      </div>
      <textarea
        className={styles.textarea}
        value={note.text}
        onChange={(e) => updateText(e.target.value)}
        placeholder="Write a note..."
      />
      <div className={styles.resizeHandle} onPointerDown={handleResizeDown} />
    </div>
  );
}

export default memo(NoteComponent);
