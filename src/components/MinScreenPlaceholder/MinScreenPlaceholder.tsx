import {
  MIN_SCREEN_HEIGHT,
  MIN_SCREEN_WIDTH,
} from "@/constants/layout.constants";

import styles from "./MinScreenPlaceholder.module.scss";

export default function MinScreenPlaceholder() {
  return (
    <div className={styles.placeholder} role="status" aria-live="polite">
      <div className={styles.content}>
        <h1 className={styles.title}>Desktop only</h1>
        <p className={styles.message}>
          This app is designed for desktop use. Please resize your window or
          switch to a larger display.
        </p>
        <p className={styles.resolution}>
          Minimum resolution: {MIN_SCREEN_WIDTH}×{MIN_SCREEN_HEIGHT}
        </p>
      </div>
    </div>
  );
}
