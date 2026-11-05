import type { ReactNode } from "react";
import { AppSidebar } from "../components/app-sidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { PREVIEW } from "../transport";
import { PreviewNotice } from "./shared";
import { useWorkspace } from "./state";
import { MobileDock } from "./NavigationDock";
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { session, navExpanded, setNavExpanded } = useWorkspace();
  return (
    <SidebarProvider
      open={navExpanded}
      onOpenChange={setNavExpanded}
      className="reading-shell"
    >
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <AppSidebar />
      <div className="workspace-inset">
        <PreviewNotice />
        {!PREVIEW && session?.test_host && (
          <div className="preview-notice" role="status">
            Protected development host · Synthetic data · Real Rust backend
          </div>
        )}
        {children}
      </div>
      <MobileDock />
    </SidebarProvider>
  );
}
