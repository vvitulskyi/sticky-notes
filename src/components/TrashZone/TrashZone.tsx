import type { Ref } from "react";

import styles from "./TrashZone.module.scss";

interface TrashZoneProps {
  isHighlighted: boolean;
  ref?: Ref<HTMLDivElement>;
}

function TrashZone({ isHighlighted, ref }: TrashZoneProps) {
  const visualClassName = [
    styles.trashZone,
    isHighlighted ? styles.trashZoneActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={styles.trashZoneHitArea} aria-label="Trash zone">
      <div className={visualClassName}>
        <span className={styles.label}>
          Drop here
          <br />
          to delete
        </span>
      </div>
    </div>
  );
}

export default TrashZone;
