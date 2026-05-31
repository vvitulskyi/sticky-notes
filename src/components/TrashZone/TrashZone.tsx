import { forwardRef } from "react";

import styles from "./TrashZone.module.scss";

interface TrashZoneProps {
  isHighlighted: boolean;
}

const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(function TrashZone(
  { isHighlighted },
  ref,
) {
  const className = [
    styles.trashZone,
    isHighlighted ? styles.trashZoneActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={className} aria-label="Trash zone">
      <span className={styles.label}>
        Drop here
        <br />
        to delete
      </span>
    </div>
  );
});

export default TrashZone;
