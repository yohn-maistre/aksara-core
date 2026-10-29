const SetupView = lazy(() =>
  import("./workspace/SetupView").then((m) => ({ default: m.SetupView })),
);
import { X } from "lucide-react";
import { MotionConfig } from "motion/react";
import { lazy, StrictMode, Suspense, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./duet.css";
import "./style.css";
import "./workspace.css";
import { ConversationView } from "./workspace/ConversationView";
import { useWorkspace, WorkspaceProvider } from "./workspace/state";
import { SurfacePortProvider, type SurfacePort } from "./workspace/SurfacePort";
import { TodayView } from "./workspace/TodayView";
import { Welcome } from "./workspace/Welcome";
import { WorkspaceOverlays } from "./workspace/WorkspaceOverlays";
import { WorkspaceShell } from "./workspace/WorkspaceShell";
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
function App() {
  const { session, page, error, setError, api, openWork, run, setDetail } =
    useWorkspace();
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
  return (
    <SurfacePortProvider port={port} key={session.scope}>
      <WorkspaceShell>
        <Suspense
          fallback={
            <p className="view-loading" role="status">
              Opening workspace…
            </p>
          }
        >
          <main
            id="workspace-content"
            tabIndex={-1}
            className={`content page-${page.toLowerCase()}`}
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
            {page === "Today" && <TodayView />}
            {(page === "Ask" || page === "Conversation") && (
              <ConversationView />
            )}
            {page === "Channels" && <ChannelsView />}
            {page === "Library" && <LibraryView />}
            {page === "Tools" && <ToolsView />}
            {page === "Settings" && <SettingsView />}
            {page === "Setup" && <SetupView />}
          </main>
        </Suspense>
      </WorkspaceShell>
      <WorkspaceOverlays />
    </SurfacePortProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </MotionConfig>
  </StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  navigator.serviceWorker.register("/sw.js").catch(() => {});
