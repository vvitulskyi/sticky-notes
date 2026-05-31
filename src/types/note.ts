export type NoteId = string;

export const NOTE_COLORS = [
  "yellow",
  "pink",
  "blue",
  "green",
  "purple",
  "orange",
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export interface Note {
  id: NoteId;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: NoteColor;
  zIndex: number;
}

export const DEFAULT_NOTE_WIDTH = 200;
export const DEFAULT_NOTE_HEIGHT = 200;

const NOTE_PADDING = 8;
const HEADER_DRAG_WIDTH = 32;
const HEADER_GAP = 6;
const COMPACT_SWATCH_SIZE = 16;
const COMPACT_SWATCH_GAP = 4;
const HEADER_ROW_HEIGHT = 16;
const HEADER_BOTTOM_SPACING = 10;
const MIN_TEXT_AREA_HEIGHT = 40;

const MIN_HEADER_CONTENT_WIDTH =
  NOTE_COLORS.length * COMPACT_SWATCH_SIZE +
  (NOTE_COLORS.length - 1) * COMPACT_SWATCH_GAP +
  HEADER_GAP +
  HEADER_DRAG_WIDTH;

/** Fits compact color picker (6 swatches) + drag handle + horizontal padding */
export const MIN_NOTE_WIDTH = MIN_HEADER_CONTENT_WIDTH + NOTE_PADDING * 2;

/** Fits header row + minimal text area + vertical padding */
export const MIN_NOTE_HEIGHT =
  NOTE_PADDING * 2 +
  HEADER_ROW_HEIGHT +
  HEADER_BOTTOM_SPACING +
  MIN_TEXT_AREA_HEIGHT;
