import { useEffect, useState } from "react";

import {
  MIN_SCREEN_HEIGHT,
  MIN_SCREEN_WIDTH,
} from "@/constants/layout.constants";

function meetsMinimumScreenSize(): boolean {
  return (
    window.innerWidth >= MIN_SCREEN_WIDTH &&
    window.innerHeight >= MIN_SCREEN_HEIGHT
  );
}

export function useMinScreenSize(): boolean {
  const [meetsMinimum, setMeetsMinimum] = useState(meetsMinimumScreenSize);

  useEffect(() => {
    const handleResize = (): void => {
      setMeetsMinimum(meetsMinimumScreenSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return meetsMinimum;
}
