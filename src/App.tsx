import Board from "@/components/Board/Board";
import MinScreenPlaceholder from "@/components/MinScreenPlaceholder/MinScreenPlaceholder";
import { useMinScreenSize } from "@/hooks/useMinScreenSize";
import { usePersistence } from "@/hooks/usePersistence";

export default function App() {
  const meetsMinScreen = useMinScreenSize();
  const { isReady } = usePersistence();

  if (!meetsMinScreen) {
    return <MinScreenPlaceholder />;
  }

  if (!isReady) {
    return null;
  }

  return <Board />;
}
