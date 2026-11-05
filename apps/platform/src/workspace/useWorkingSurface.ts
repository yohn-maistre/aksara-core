import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspace } from "./state";
import type { Data } from "./shared";

/** One serialized save queue. A revision conflict preserves local changes and
 * stops writes until explicitly reloaded; old scopes never update the new UI. */
export function useWorkingSurface(initial: Data) {
  const { api, scope, session, refresh, beforeNavigate } = useWorkspace();
  const context = session!.scope;
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState(initial.revision ? "Saved" : "Unsaved");
  const [problem, setProblem] = useState("");
  const latest = useRef(initial),
    revision = useRef(initial.revision || 0);
  const saved = useRef(initial.revision ? JSON.stringify(initial) : "");
  const pending = useRef<Promise<void> | null>(null);
  const alive = useRef(true),
    conflict = useRef(false);
  const flush = useCallback(async (): Promise<void> => {
    if (conflict.current)
      throw new Error(
        "Reload the newer draft before leaving, or copy your unsaved text.",
      );
    if (pending.current) {
      await pending.current;
      return flush();
    }
    const next = latest.current;
    const fingerprint = JSON.stringify(next);
    if (fingerprint === saved.current) return;
    if (!next.title.trim())
      throw new Error("Give this working document a title before saving.");
    if (alive.current) {
      setStatus("Saving…");
      setProblem("");
    }
    const job = (async () => {
      try {
        const result = await api("kernel/workspace-save", {
          id: next.id,
          kind: next.kind,
          revision: revision.current,
          title: next.title,
          content: next.content,
          body: next.body,
          source_ids: next.source_ids,
        });
        revision.current = result.revision;
        saved.current = fingerprint;
        if (alive.current && scope.current === context) setStatus("Saved");
        await refresh();
      } catch (e) {
        if ((e as Data).status === 409) conflict.current = true;
        if (alive.current && scope.current === context) {
          setStatus(
            (e as Data).status === 409
              ? "Newer version available"
              : "Not saved",
          );
          setProblem((e as Error).message);
        }
        throw e;
      }
    })();
    pending.current = job;
    try {
      await job;
    } finally {
      pending.current = null;
    }
    if (JSON.stringify(latest.current) !== saved.current) await flush();
  }, [api, context, refresh]);
  useEffect(() => {
    alive.current = true;
    beforeNavigate.current = flush;
    return () => {
      alive.current = false;
      if (beforeNavigate.current === flush) beforeNavigate.current = null;
    };
  }, [flush]);
  useEffect(() => {
    if (JSON.stringify(value) === saved.current || conflict.current) return;
    const timer = setTimeout(() => void flush().catch(() => {}), 700);
    return () => clearTimeout(timer);
  }, [value, flush]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== saved.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);
  const change = useCallback((patch: Data) => {
    latest.current = { ...latest.current, ...patch };
    setValue(latest.current);
    setStatus(conflict.current ? "Newer version available" : "Unsaved");
  }, []);
  const replace = (current: Data) => {
    latest.current = current;
    revision.current = current.revision;
    saved.current = JSON.stringify(current);
    conflict.current = false;
    setValue(current);
    setProblem("");
    setStatus("Saved");
  };
  return {
    value,
    change,
    replace,
    flush,
    status,
    problem,
    revision,
    dirty: JSON.stringify(value) !== saved.current,
  };
}
