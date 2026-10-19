import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface Options {
  /** Autosave runs only while enabled (drafts). */
  enabled: boolean;
  /** Increment on every edit. */
  rev: number;
  /** Persist the current state. Resolve true on success. */
  save: () => Promise<boolean>;
  delayMs?: number;
}

/** Debounced autosave. `saveNow` flushes immediately and is also used by the Save button. */
export function useAutosave({ enabled, rev, save, delayMs = 2500 }: Options) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;
  const inflight = useRef<Promise<boolean> | null>(null);

  // If a save is already running, wait for it, then save again so the latest edits are always included
  // (clicking Publish during an autosave must not silently do nothing).
  const saveNow = useCallback(async () => {
    while (inflight.current) await inflight.current.catch(() => false);
    setStatus("saving");
    const run = (async () => {
      try {
        const ok = await saveRef.current();
        setStatus(ok ? "saved" : "error");
        if (ok) setSavedAt(new Date());
        return ok;
      } catch {
        setStatus("error");
        return false;
      }
    })();
    inflight.current = run;
    const result = await run;
    if (inflight.current === run) inflight.current = null;
    return result;
  }, []);

  useEffect(() => {
    if (!enabled || rev === 0) return;
    setStatus("pending");
    const t = setTimeout(saveNow, delayMs);
    return () => clearTimeout(t);
  }, [rev, enabled, delayMs, saveNow]);

  return { status, savedAt, saveNow, setStatus };
}
