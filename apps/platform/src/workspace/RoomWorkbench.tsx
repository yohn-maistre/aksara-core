import { lazy, Suspense, useEffect, useState } from "react";
import {
  FileText,
  LayoutPanelLeft,
  MessageCircle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { useWorkspace } from "./state";
import { ConversationView } from "./ConversationView";
import { Composer } from "./Composer";
import { ActionButton } from "./controls";
const DocumentView = lazy(() =>
  import("./DocumentView").then((m) => ({ default: m.DocumentView })),
);
const CanvasView = lazy(() =>
  import("./CanvasView").then((m) => ({ default: m.CanvasView })),
);
const DrawingView = lazy(() =>
  import("./DrawingView").then((m) => ({ default: m.DrawingView })),
);
export function RoomWorkbench() {
  const w = useWorkspace();
  const [mode, setMode] = useState(
    () => localStorage.getItem("aksara-room-view") || "room",
  );
  const [loading, setLoading] = useState(false);
  const select = async (id: string) => {
    setLoading(true);
    try {
      await w.beforeNavigate.current?.();
      w.setActiveEntry(
        await w.api(`kernel/workspace-entry?id=${encodeURIComponent(id)}`),
      );
    } catch (e) {
      w.setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const changeMode = (value: string) => {
    setMode(value);
    localStorage.setItem("aksara-room-view", value);
  };
  useEffect(() => {
    if (mode === "workbench" && !w.activeEntry && w.entries.length)
      void select(w.entries[0].id);
  }, [mode, w.session?.scope, w.entries[0]?.id]);
  return (
    <div className="room-view" data-mode={mode}>
      <header className="room-header">
        <div>
          <h1>{w.lane?.name || "Shared room"}</h1>
          <p>{w.lane?.lane.audience.length} members · Shared conversation</p>
        </div>
        <div className="room-view-switch" aria-label="Channel view">
          <ActionButton
            variant={mode === "room" ? "soft" : "ghost"}
            aria-pressed={mode === "room"}
            onClick={() => changeMode("room")}
            startIcon={<MessageCircle size={15} />}
          >
            Room
          </ActionButton>
          <ActionButton
            variant={mode === "workbench" ? "soft" : "ghost"}
            aria-pressed={mode === "workbench"}
            onClick={() => changeMode("workbench")}
            startIcon={<LayoutPanelLeft size={15} />}
          >
            Workbench
          </ActionButton>
        </div>
      </header>
      <div className="room-panes">
        <section className="room-discussion" aria-label="Room conversation">
          <ConversationView embedded />
          <div className="surface-composer">
            <Composer />
          </div>
        </section>
        {mode === "workbench" && (
          <section className="room-artifact" aria-label="Room workbench">
            <div className="room-artifact-tabs">
              {w.entries.map((e) => (
                <button
                  key={e.id}
                  aria-pressed={w.activeEntry?.id === e.id}
                  onClick={() => void select(e.id)}
                >
                  <FileText size={14} />
                  {e.title}
                </button>
              ))}
              <button
                className="icon-button"
                aria-label="New room document"
                onClick={() => {
                  w.setDocTitle("");
                  w.setDocContent("");
                  w.setDocSources([]);
                  w.setShowDoc(true);
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {loading ? (
              <p className="view-loading" role="status">
                Opening the work…
              </p>
            ) : w.activeEntry ? (
              <Suspense
                fallback={
                  <p className="view-loading" role="status">
                    Opening the editor…
                  </p>
                }
              >
                {w.activeEntry.kind === "drawing" ? (
                  <DrawingView />
                ) : w.activeEntry.kind === "canvas" ? (
                  <CanvasView />
                ) : (
                  <DocumentView />
                )}
              </Suspense>
            ) : (
              <div className="empty">
                <FileText size={28} />
                <h2>A place to make things together.</h2>
                <p>
                  Start a page or ask Aksara to prepare a draft in this room.
                </p>
                <ActionButton
                  variant="outline"
                  onClick={() => {
                    w.setDocTitle("Untitled document");
                    w.setDocContent("");
                    w.setDocSources([]);
                    w.setShowDoc(true);
                  }}
                >
                  Start a document <ArrowUpRight size={14} />
                </ActionButton>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
