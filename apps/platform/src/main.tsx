import { lazy, StrictMode, Suspense, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import "./duet.css";
import "twenty-ui/style.css";
import "twenty-ui/theme-light.css";
import "twenty-ui/theme-dark.css";
import "./industrial.css";
import { Composer } from "./workspace/Composer";
import { ConversationView } from "./workspace/ConversationView";
import { useWorkspace, WorkspaceProvider } from "./workspace/state";
import { SurfacePortProvider, type SurfacePort } from "./workspace/SurfacePort";
import {HomeWorkbench} from "./workspace/HomeWorkbench";
import {RoomWorkbench} from "./workspace/RoomWorkbench";
import {WorkspaceTheme} from "./workspace/controls";
import { Welcome } from "./workspace/Welcome";
import { WorkspaceOverlays } from "./workspace/WorkspaceOverlays";
import { WorkspaceShell } from "./workspace/WorkspaceShell";
const SetupView = lazy(() =>
  import("./workspace/SetupView").then((m) => ({ default: m.SetupView })),
);
const ChannelsView = lazy(() =>
  import("./workspace/ChannelsView").then((m) => ({ default: m.ChannelsView })),
);
const LibraryView = lazy(() =>
  import("./workspace/LibraryView").then((m) => ({ default: m.LibraryView })),
);
const SettingsView = lazy(() =>
  import("./workspace/SettingsView").then((m) => ({ default: m.SettingsView })),
);
const ToolsView = lazy(() =>
  import("./workspace/ToolsView").then((m) => ({ default: m.ToolsView })),
);
const DocumentView = lazy(() =>
  import("./workspace/DocumentView").then((m) => ({ default: m.DocumentView })),
);
const CanvasView = lazy(() =>
  import("./workspace/CanvasView").then((m) => ({ default: m.CanvasView })),
);
const DrawingView=lazy(()=>import("./workspace/DrawingView").then(m=>({default:m.DrawingView})));
function App() {
  const {
    session,
    page,
    error,
    setError,
    api,
    openWork,
    run,
    setDetail,
    closeAssistant,
  } = useWorkspace();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (page !== "Ask") return;
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector('[role="dialog"],[role="menu"]')
      )
        closeAssistant();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [page, session?.scope]);
  const port = useMemo<SurfacePort>(
    () => ({
      scope: session?.scope || "",
      resolve: (plan) => api("surfaces/resolve", plan),
      open: async (component, id) => {
        if (component === "SourceList" || component === "DocumentPreview")
          await run(async () =>
            setDetail(
              await api(`kernel/artifact?id=${encodeURIComponent(id)}`),
            ),
          );
        else
          await openWork(
            await api(`kernel/thread?id=${encodeURIComponent(id)}`),
          );
      },
    }),
    [session?.scope, api],
  );
  if (!session) return <Welcome />;
  const conversation = ["Ask", "Conversation"].includes(page);
  return (
    <SurfacePortProvider port={port}>
      <WorkspaceShell>
        <main
          id="workspace-content"
          tabIndex={-1}
          className="workspace-stage"
          data-page={page}
          key={session.scope}
        >
          {error && (
            <div role="alert" className="error toast">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          <motion.section
            key={page}
            initial={reduced ? false : { opacity: 0.65, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`work-surface content page-${page.toLowerCase()}`}
            aria-label="Active workspace"
          >
            <div className="surface-body">
              <Suspense
                fallback={
                  <p className="view-loading" role="status">
                    Opening workspace…
                  </p>
                }
              >
                {page === "Today" && (
                  <HomeWorkbench composer={<Composer presentation="line" />} />
                )}
                {page==="Ask"&&<ConversationView/>}
                {page==="Conversation"&&<RoomWorkbench/>}
                {page === "Channels" && <ChannelsView />}
                {page === "Library" && <LibraryView />}
                {page === "Tools" && <ToolsView />}
                {page === "Settings" && <SettingsView />}
                {page === "Canvas" && <CanvasView />}
                {page === "Drawing" && <DrawingView />}
                {page === "Document" && (
                  <div className="document-layout">
                    <aside
                      className="document-thread"
                      aria-label="Document conversation"
                    >
                      <ConversationView />
                      <Composer />
                    </aside>
                    <DocumentView />
                  </div>
                )}
              </Suspense>
            </div>
            {page==="Ask" && (
              <div className="surface-composer">
                <Composer />
              </div>
            )}
          </motion.section>
        </main>
      </WorkspaceShell>
      <Suspense fallback={null}>
        <SetupView />
      </Suspense>
      <WorkspaceOverlays />
    </SurfacePortProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <WorkspaceProvider>
        <WorkspaceTheme><App /></WorkspaceTheme>
      </WorkspaceProvider>
    </MotionConfig>
  </StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  navigator.serviceWorker.register("/sw.js").catch(() => {});
