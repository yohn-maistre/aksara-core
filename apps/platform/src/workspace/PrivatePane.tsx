import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, X, LockKeyhole } from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "./state";
import { ConversationView } from "./ConversationView";
import { Composer } from "./Composer";
import { WorkspaceOverlays } from "./WorkspaceOverlays";
import { SurfacePortProvider, type SurfacePort } from "./SurfacePort";
const SetupView = lazy(() =>
  import("./SetupView").then((m) => ({ default: m.SetupView })),
);
const DrawingView = lazy(() =>
  import("./DrawingView").then((m) => ({ default: m.DrawingView })),
);
const SettingsView = lazy(() =>
  import("./SettingsView").then((m) => ({ default: m.SettingsView })),
);
const LibraryView = lazy(() =>
  import("./LibraryView").then((m) => ({ default: m.LibraryView })),
);
const DocumentView = lazy(() =>
  import("./DocumentView").then((m) => ({ default: m.DocumentView })),
);
import { Mark, type Session } from "./shared";

export function PrivatePane() {
  const w = useWorkspace();
  const [binding, setBinding] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [full, setFull] = useState(false);
  const [phone, setPhone] = useState(
    () => matchMedia("(max-width:760px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(max-width:760px)");
    const update = () => setPhone(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const overlay = phone || full;
  useEffect(() => {
    if (!w.assistantPanelOpen || !overlay) return;
    const pane = document.getElementById("private-aksara")!;
    const nodes = [...pane.parentElement!.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== pane,
    );
    const before = nodes.map((el) => el.inert);
    nodes.forEach((el) => (el.inert = true));
    [...pane.querySelectorAll<HTMLButtonElement>("button")].find(el=>el.getClientRects().length)?.focus();
    const trap = (e: KeyboardEvent) => {
      if (
        e.key !== "Tab" ||
        document.querySelector('[role="dialog"]:not(#private-aksara)')
      )
        return;
      const available = [
        ...pane.querySelectorAll<HTMLElement>(
          'button,input,textarea,select,a[href],[tabindex="0"]',
        ),
      ].filter(
        (el) => !el.hasAttribute("disabled") && el.getClientRects().length,
      );
      const first = available[0],
        last = available.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    pane.addEventListener("keydown", trap);
    return () => {
      nodes.forEach((el, i) => (el.inert = before[i]));
      pane.removeEventListener("keydown", trap);
    };
  }, [w.assistantPanelOpen, overlay]);
  const actor = w.session?.profile.actor;
  const identity = useRef(actor);
  const restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (w.assistantPanelOpen)
      restoreFocus.current = document.activeElement as HTMLElement;
  }, [w.assistantPanelOpen]);
  useEffect(() => {
    if (identity.current !== actor) {
      identity.current = actor;
      setBinding(null);
      setFull(false);
      setError("");
    }
  }, [actor]);
  useEffect(() => {
    if (!w.assistantPanelOpen || binding || !w.session) return;
    let live = true;
    setError("");
    void w
      .api("contexts/private", {})
      .then((s) => {
        if (live) setBinding(s);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [w.assistantPanelOpen, binding, actor, w.api]);
  const close = () => {
    w.setAssistantPanelOpen(false);
    setFull(false);
    requestAnimationFrame(() => restoreFocus.current?.focus());
  };
  useEffect(() => {
    if (!w.assistantPanelOpen) return;
    const escape = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !e.defaultPrevented &&
        !document.querySelector(
          '[role="dialog"]:not(#private-aksara),[role="menu"],[role="listbox"]',
        )
      ) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [w.assistantPanelOpen]);
  if (!w.session) return null;
  return (
    <aside
      id="private-aksara"
      className="private-pane"
      data-full={full}
      hidden={!w.assistantPanelOpen}
      role={overlay ? "dialog" : undefined}
      aria-modal={overlay ? true : undefined}
      aria-label="Private Aksara pane"
    >
      <header className="private-pane-header">
        <span className="private-mark">
          <Mark />
        </span>
        <div>
          <h2>Private thread</h2>
          <span>
            <LockKeyhole size={11} />
            Only you
          </span>
        </div>
        <button
          className="icon-button"
          aria-label={
            full ? "Return to compact private pane" : "Expand private thread"
          }
          onClick={() => setFull(!full)}
        >
          {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          className="icon-button"
          aria-label="Close private conversation"
          onClick={close}
        >
          <X size={18} />
        </button>
      </header>
      {error ? (
        <div className="private-pane-state" role="alert">
          <p>{error}</p>
          <button
            className="secondary"
            onClick={() => {
              setBinding(null);
              w.setAssistantPanelOpen(false);
              requestAnimationFrame(() => w.setAssistantPanelOpen(true));
            }}
          >
            Try again
          </button>
        </div>
      ) : binding?.context ? (
        <WorkspaceProvider
          key={`${actor}:${binding.context}`}
          contextKey={binding.context}
          embedded
          active={w.assistantPanelOpen}
        >
          <PrivateThread />
          <WorkspaceOverlays />
        </WorkspaceProvider>
      ) : (
        <div className="private-pane-state" role="status">
          Opening your private conversation…
        </div>
      )}
    </aside>
  );
}
function PrivateThread() {
  const w = useWorkspace();
  const port = useMemo<SurfacePort>(
    () => ({
      scope: w.session?.scope || "",
      resolve: (plan) => w.api("surfaces/resolve", plan),
      open: async (component, id) => {
        if (component === "SourceList" || component === "DocumentPreview")
          await w.run(async () =>
            w.setDetail(
              await w.api(`kernel/artifact?id=${encodeURIComponent(id)}`),
            ),
          );
        else
          await w.openWork(
            await w.api(`kernel/thread?id=${encodeURIComponent(id)}`),
          );
      },
    }),
    [w.session?.scope, w.api],
  );
  if (!w.session)
    return (
      <div className="private-pane-state" role="status">
        Checking private access…
      </div>
    );
  return (
    <SurfacePortProvider port={port}>
      <div className="private-pane-content">
        {w.page === "Document" ? (
          <Suspense fallback={<p role="status">Opening document…</p>}>
            <button className="text-button" onClick={() => w.navigate("Ask")}>
              ← Private conversation
            </button>
            <DocumentView />
          </Suspense>
        ) : (
          <Suspense fallback={<p role="status">Opening…</p>}>
            {w.page === "Drawing" ? (
              <DrawingView />
            ) : w.page === "Library" ? (
              <LibraryView />
            ) : w.page === "Settings" ? (
              <SettingsView />
            ) : (
              <ConversationView embedded />
            )}
          </Suspense>
        )}
        <div className="private-pane-composer">
          <Composer />
        </div>
        {w.error && (
          <p role="alert" className="error">
            {w.error}
          </p>
        )}
        <Suspense fallback={null}>
          <SetupView />
        </Suspense>
      </div>
    </SurfacePortProvider>
  );
}
