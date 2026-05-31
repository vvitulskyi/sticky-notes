import { NOTE_COLORS, type NoteColor } from "@/types/note";

import styles from "./ColorPicker.module.scss";

const SWATCH_CLASS: Record<NoteColor, string> = {
  yellow: styles.swatchYellow,
  pink: styles.swatchPink,
  blue: styles.swatchBlue,
  green: styles.swatchGreen,
  purple: styles.swatchPurple,
  orange: styles.swatchOrange,
};

interface ColorPickerProps {
  selectedColor: NoteColor;
  onSelectColor: (color: NoteColor) => void;
  compact?: boolean;
  ariaLabel?: string;
}

export default function ColorPicker({
  selectedColor,
  onSelectColor,
  compact = false,
  ariaLabel = "Note color",
}: ColorPickerProps) {
  const pickerClass = [
    styles.colorPicker,
    compact ? styles.colorPickerCompact : "",
  ]
    .filter(Boolean)
    .join(" ");

  const swatchClass = compact ? styles.colorSwatchCompact : "";

  return (
    <div className={pickerClass} role="group" aria-label={ariaLabel}>
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={[
            styles.colorSwatch,
            SWATCH_CLASS[color],
            swatchClass,
            selectedColor === color ? styles.colorSwatchSelected : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`Select ${color} color`}
          aria-pressed={selectedColor === color}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onSelectColor(color)}
        />
      ))}
    </div>
  );
}
