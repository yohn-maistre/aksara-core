import { Hash, LockKeyhole } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar } from "../components/app-sidebar";
import { SurfacePage } from "../components/octopus/SurfacePage";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "../components/ui/sidebar";
import { PREVIEW } from "../transport";
import { PreviewNotice } from "./shared";
import { useWorkspace } from "./state";
import { MobileDock } from "./NavigationDock";
import { ContextMenu } from "./ContextMenu";
function Atmosphere() {
  const { ambientMotion } = useWorkspace();
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <div
      className="ambient-field"
      aria-hidden
      data-moving={ambientMotion && visible}
    >
      <div className="smoke-layer smoke-layer-one" />
      <div className="smoke-layer smoke-layer-two" />
    </div>
  );
}
function WorkspaceHeader() {
  const { session, privateLane, lane } = useWorkspace();
  const { isMobile } = useSidebar();
  if (!session) return null;
  if (!isMobile)
    return (
      <div className="workspace-caption">
        <span className="location-name">
          {session.profile.mode === "personal"
            ? "Personal space"
            : "Aksara Commons"}
        </span>
        <span className="scope-badge">
          {privateLane ? <LockKeyhole size={12} /> : <Hash size={12} />}{" "}
          {privateLane ? "Only you" : lane?.name}
        </span>
      </div>
    );
  return (
    <header className="workspace-topbar">
      <span className="location-name">
        {session.profile.mode === "personal"
          ? "Personal space"
          : "Aksara Commons"}
      </span>
      <span className="mobile-context">
        <ContextMenu />
      </span>
      <span className="scope-badge">
        {privateLane ? <LockKeyhole size={13} /> : <Hash size={13} />}
        <span>{privateLane ? "Only you" : lane?.name}</span>
      </span>
    </header>
  );
}
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { session, navExpanded, setNavExpanded } = useWorkspace();
  return (
    <SidebarProvider
      open={navExpanded}
      onOpenChange={setNavExpanded}
      className="atmospheric-shell"
      style={
        {
          "--sidebar-width-icon": "4.75rem",
          "--sidebar-width": "14rem",
        } as React.CSSProperties
      }
    >
      <Atmosphere />
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <AppSidebar />
      <SidebarInset className="workspace-inset">
        <WorkspaceHeader />
        <PreviewNotice />
        {!PREVIEW && session?.test_host && (
          <div className="preview-notice" role="status">
            Protected development host · Synthetic data · Real Rust backend
          </div>
        )}
        <SurfacePage>{children}</SurfacePage>
      </SidebarInset>
      <MobileDock />
    </SidebarProvider>
  );
}
