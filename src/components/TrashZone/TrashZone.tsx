import type { Ref } from "react";

import styles from "./TrashZone.module.scss";

interface TrashZoneProps {
  isHighlighted: boolean;
  ref?: Ref<HTMLDivElement>;
}

function TrashZone({ isHighlighted, ref }: TrashZoneProps) {
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
}

export default TrashZone;
