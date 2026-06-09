import type { Ref } from "react";

import styles from "./TrashZone.module.scss";

interface TrashZoneProps {
  ref?: Ref<HTMLDivElement>;
}

function TrashZone({ ref }: TrashZoneProps) {
  return (
    <div ref={ref} className={styles.trashZoneHitArea} aria-label="Trash zone">
      <div className={styles.trashZone} data-trash-visual>
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
