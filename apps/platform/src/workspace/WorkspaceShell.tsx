import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Check, Settings2 } from "lucide-react";
import {
  ChevronDown,
  Hash,
  LockKeyhole,
  PanelLeft,
  Sprout,
} from "lucide-react";
import type { ReactNode } from "react";
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
function WorkspaceHeader() {
  const {
    session,
    profiles,
    busy,
    switchContext,
    lane,
    privateLane,
    page,
    navigate,
  } = useWorkspace();
  const { toggleSidebar, isMobile, state } = useSidebar();
  if (!session) return null;
  return (
    <header className="workspace-topbar">
      <div className="workspace-location">
        <button
          className="icon-button sidebar-toggle"
          aria-label={
            isMobile
              ? "Open navigation"
              : state === "collapsed"
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
          onClick={toggleSidebar}
        >
          <PanelLeft size={19} />
        </button>
        <span className="location-name">
          {session.profile.mode === "personal"
            ? "Personal space"
            : "Aksara Commons"}
        </span>
        <span className="location-divider">/</span>
        <span className="location-page">
          {page === "Ask" ? "Private thread" : page}
        </span>
      </div>
      <div className="workspace-identity">
        <span className="scope-badge">
          {privateLane ? <LockKeyhole size={13} /> : <Hash size={13} />}
          <span>{privateLane ? "Only you" : lane?.name}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="identity-button"
            aria-label={`Context: ${session.profile.name}`}
          >
            <span className="identity-initial">{session.profile.name[0]}</span>
            <span>{session.profile.name}</span>
            <ChevronDown size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="workspace-context-menu">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Your spaces</DropdownMenuLabel>
              {profiles
                .filter((p) => p.actor === session.profile.actor)
                .map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    disabled={busy}
                    onClick={() => void switchContext(p.id)}
                  >
                    {p.mode === "personal" ? (
                      <LockKeyhole size={16} />
                    ) : (
                      <Sprout size={16} />
                    )}
                    <span>
                      {p.mode === "personal"
                        ? "Personal space"
                        : "Community workspace"}
                    </span>
                    {p.id === session.profile.id && <Check size={14} />}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("Settings")}>
              <Settings2 size={16} />
              Settings & connections
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { session } = useWorkspace();
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width-icon": "3.25rem",
          "--sidebar-width": "15rem",
        } as React.CSSProperties
      }
    >
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <AppSidebar />
      <SidebarInset className="workspace-inset">
        <WorkspaceHeader />
        <PreviewNotice />
        {!PREVIEW && session?.test_host && (
          <div className="preview-notice" role="status">
            Protected development test host · Synthetic data only. Real Rust
            backend; production enrollment is not enabled.
          </div>
        )}
        <SurfacePage>{children}</SurfacePage>
        <footer className="workspace-footer">
          <Sprout size={13} />
          <span>
            {PREVIEW
              ? "A space to try things · changes reset on reload"
              : "Aksara · your context, your decisions"}
          </span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
