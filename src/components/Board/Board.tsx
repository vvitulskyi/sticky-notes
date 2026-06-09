import { useState, useCallback } from "react";

import ColorPicker from "@/components/ColorPicker/ColorPicker";
import NoteLayer from "@/components/NoteLayer/NoteLayer";
import Spinner from "@/components/Spinner/Spinner";
import TrashZone from "@/components/TrashZone/TrashZone";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useBoard } from "@/hooks/useBoard";
import { useTrashZone } from "@/hooks/useTrashZone";
import { useViewport } from "@/hooks/useViewport";

import styles from "./Board.module.scss";

import type { NoteColor } from "@/types/note";

export default function Board() {
  const { noteOrder, addNote } = useBoard();
  const { isSaving } = useApiStatus();
  const { trashRef, isHighlighted } = useTrashZone();
  const { connectViewportRef, worldTransformStyle } = useViewport();
  const [selectedColor, setSelectedColor] = useState<NoteColor>("yellow");

  const handleAddNote = useCallback(() => {
    addNote(selectedColor);
  }, [addNote, selectedColor]);

  return (
    <div className={styles.board}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddNote}
        >
          Add note
        </button>
        <ColorPicker
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          ariaLabel="Default note color"
        />
        {isSaving ? <Spinner size="sm" label="Saving…" /> : null}
      </div>
      <div ref={connectViewportRef} className={styles.viewportLayer}>
        <div className={styles.worldLayer} style={worldTransformStyle}>
          <NoteLayer noteOrder={noteOrder} />
        </div>
      </div>
      <TrashZone ref={trashRef} isHighlighted={isHighlighted} />
    </div>
  );
}
