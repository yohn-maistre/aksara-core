import type { ReactNode } from "react";
import { AppSidebar } from "../components/app-sidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { PREVIEW } from "../transport";
import { PreviewNotice } from "./shared";
import { useWorkspace } from "./state";
import { MobileDock } from "./NavigationDock";
import {PrivatePane} from "./PrivatePane";
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { session, navExpanded, setNavExpanded,assistantPanelOpen } = useWorkspace();
  return (
    <SidebarProvider
      open={navExpanded}
      onOpenChange={setNavExpanded}
      className="reading-shell"
      data-private-open={assistantPanelOpen}
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
      <PrivatePane/>
      <MobileDock />
    </SidebarProvider>
  );
}
