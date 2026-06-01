import styles from "./Spinner.module.scss";

interface SpinnerProps {
  label?: string;
  size?: "sm" | "md";
}

export default function Spinner({ label, size = "md" }: SpinnerProps) {
  return (
    <div
      className={styles.wrapper}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? "Loading"}
    >
      <span
        className={`${styles.spinner} ${size === "sm" ? styles.spinnerSm : ""}`}
      />
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
