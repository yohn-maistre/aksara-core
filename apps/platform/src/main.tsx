const SetupView = lazy(() =>
  import("./workspace/SetupView").then((m) => ({ default: m.SetupView })),
);
import { X } from "lucide-react";
import { MotionConfig } from "motion/react";
import {
  lazy,
  StrictMode,
  Suspense,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import "./duet.css";
import "./style.css";
import "./workspace.css";
import "./atmosphere.css";
import "./expressive.css";
import { motion, useReducedMotion } from "motion/react";
import { Composer } from "./workspace/Composer";
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
  const {
    session,
    page,
    error,
    setError,
    api,
    openWork,
    run,
    setDetail,
    navigate,
  } = useWorkspace();
  const reduced = useReducedMotion();
  const routeKey = `${session?.scope}:${page}`;
  const [settled, setSettled] = useState("");
  const previous = useRef(page);
  useLayoutEffect(() => {
    const mustContract =
      previous.current === "Today" &&
      page !== "Today" &&
      page !== "Ask" &&
      innerWidth > 1100 &&
      !reduced;
    previous.current = page;
    if (!mustContract) {
      setSettled(routeKey);
      return;
    }
    // Completion callback is primary; bounded fallback handles layout cancellation.
    const timer = setTimeout(() => setSettled(routeKey), 600);
    return () => clearTimeout(timer);
  }, [routeKey, reduced]);
  const ready = settled === routeKey || !!reduced;
  useEffect(() => {
    if (page === "Ask" && ready && !document.querySelector('[role="dialog"]'))
      document
        .querySelector<HTMLTextAreaElement>(
          '.page-ask textarea[aria-label="Message Aksara"]',
        )
        ?.focus({ preventScroll: true });
  }, [page, ready, session?.scope]);
  useEffect(() => {
    if (page !== "Ask") return;
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector('[role="dialog"], [role="menu"]')
      )
        navigate("Today");
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
  return (
    <SurfacePortProvider port={port} key={session.scope}>
      <WorkspaceShell>
        <main
          id="workspace-content"
          tabIndex={-1}
          className="workspace-stage"
          data-home={page === "Today"}
          data-private={page === "Ask"}
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
          {page !== "Today" && (
            <motion.section
              key={`active-surface:${session.scope}:${page}`}
              layoutId={
                page === "Ask" ? `aksara-personal:${session.scope}` : undefined
              }
              initial={{
                opacity: reduced ? 1 : 0,
                x: reduced ? 0 : -8,
                clipPath:
                  page === "Ask" || reduced
                    ? "inset(0% 0% 0% 0% round 38px)"
                    : "inset(0% 100% 0% 0% round 28px)",
              }}
              animate={{
                opacity: ready ? 1 : 0,
                x: ready ? 0 : -8,
                clipPath: ready
                  ? `inset(0% 0% 0% 0% round ${page === "Ask" ? 38 : 28}px)`
                  : "inset(0% 100% 0% 0% round 28px)",
              }}
              transition={{ duration: reduced ? 0 : 0.17 }}
              inert={!ready}
              aria-hidden={!ready}
              className={`work-surface content page-${page.toLowerCase()}`}
              aria-label="Active workspace"
            >
              {page === "Ask" && (
                <button
                  className="private-thread-close icon-button"
                  aria-label="Close private conversation"
                  onClick={() => navigate("Today")}
                >
                  <X size={22} />
                </button>
              )}
              <div className="surface-body">
                <Suspense
                  fallback={
                    <p className="view-loading" role="status">
                      Opening workspace…
                    </p>
                  }
                >
                  {(page === "Ask" || page === "Conversation") && (
                    <ConversationView />
                  )}
                  {page === "Channels" && <ChannelsView />}
                  {page === "Library" && <LibraryView />}
                  {page === "Tools" && <ToolsView />}
                  {page === "Settings" && <SettingsView />}
                  {page === "Setup" && <SetupView />}
                </Suspense>
              </div>
              {!["Settings", "Setup"].includes(page) && (
                <div className="surface-composer">
                  <Composer />
                </div>
              )}
            </motion.section>
          )}
          <TodayView
            key="continuing-home"
            compact={page !== "Today"}
            onSettled={() => setSettled(routeKey)}
            composer={
              page === "Today" ? <Composer presentation="line" /> : undefined
            }
          />
        </main>
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
