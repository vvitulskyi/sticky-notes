import Board from "@/components/Board/Board";
import MinScreenPlaceholder from "@/components/MinScreenPlaceholder/MinScreenPlaceholder";
import Spinner from "@/components/Spinner/Spinner";
import { useMinScreenSize } from "@/hooks/useMinScreenSize";
import { usePersistence } from "@/hooks/usePersistence";

import styles from "./App.module.scss";

export default function App() {
  const meetsMinScreen = useMinScreenSize();
  const { isLoading } = usePersistence();

  if (!meetsMinScreen) {
    return <MinScreenPlaceholder />;
  }

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <Spinner label="Loading…" />
      </div>
    );
  }

  return <Board />;
}
