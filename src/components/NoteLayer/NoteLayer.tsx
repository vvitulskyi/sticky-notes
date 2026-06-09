import { memo } from "react";

import Note from "@/components/Note/Note";

import type { NoteId } from "@/types/note";

interface NoteLayerProps {
  noteOrder: NoteId[];
}

function NoteLayer({ noteOrder }: NoteLayerProps) {
  return (
    <>
      {noteOrder.map((noteId) => (
        <Note key={noteId} noteId={noteId} />
      ))}
    </>
  );
}

export default memo(NoteLayer);
