import type { Note } from "@/types/note";

export function normalizeNotes(raw: unknown[]): Note[] {
  return raw.map((item, index) => {
    const note = item as Partial<Note>;
    return {
      id: note.id ?? `note-restored-${index}`,
      x: note.x ?? 100,
      y: note.y ?? 100,
      width: note.width ?? 200,
      height: note.height ?? 200,
      text: note.text ?? "",
      color: note.color ?? "yellow",
      zIndex: typeof note.zIndex === "number" ? note.zIndex : index + 1,
    };
  });
}
