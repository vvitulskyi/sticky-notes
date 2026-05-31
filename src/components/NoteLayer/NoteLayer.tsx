import Note from "@/components/Note/Note";

import type { NoteId } from "@/types/note";

interface NoteLayerProps {
  noteOrder: NoteId[];
}

export default function NoteLayer({ noteOrder }: NoteLayerProps) {
  return (
    <>
      {noteOrder.map((noteId) => (
        <Note key={noteId} noteId={noteId} />
      ))}
    </>
  );
}
