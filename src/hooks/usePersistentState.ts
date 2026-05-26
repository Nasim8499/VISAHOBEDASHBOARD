import { useEffect, useRef, useState } from "react";

/**
 * Persist state to localStorage with a versioned key.
 * Falls back gracefully when storage is unavailable (SSR / private mode).
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const initialRef = useRef(initial);
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return typeof initialRef.current === "function"
        ? (initialRef.current as () => T)()
        : (initialRef.current as T);
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return typeof initialRef.current === "function"
      ? (initialRef.current as () => T)()
      : (initialRef.current as T);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [key, state]);

  return [state, setState] as const;
}
