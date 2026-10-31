// shadcn sidebar-08 (MIT), adapted for a regular full-height Aksara navigation spine.
import {
  BookOpen,
  ChevronDown,
  Hash,
  House,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dock, DockItem } from "./ui/dock";
import { useWorkspace } from "../workspace/state";
import { ContextMenu } from "../workspace/ContextMenu";
import { Mark } from "../workspace/shared";
import { AksaraLauncher } from "../workspace/AksaraLauncher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
export function AppSidebar() {
  const { session, page, navigate, api, accept, run, busy, working } =
    useWorkspace();
  const { setOpenMobile, isMobile, state, toggleSidebar } = useSidebar();
  const [channelsOpen, setChannelsOpen] = useState(true);
  if (!session) return null;
  const go = (p: string) => {
    navigate(p);
    setOpenMobile(false);
  };
  const links = [
    ["Today", "Home", House],
    ["Library", "Library", BookOpen],
    ["Channels", "Channels", Hash],
    ["Tools", "Capabilities", Layers],
  ] as const;
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="aksara-sidebar"
      data-working={working.length > 0}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="brand-button"
              tooltip="Aksara Home"
              aria-label="Aksara Home"
              onClick={() => go("Today")}
            >
              <Mark />
              <span className="brand-wordmark">aksara</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main">
          <Dock vertical className="desktop-dock">
            <SidebarMenu>
              {links.map(([id, label, Icon]) => (
                <SidebarMenuItem key={id}>
                  <DockItem
                    className="navigation-dock-item"
                    title={label}
                    aria-label={id === "Tools" ? "Tools" : label}
                    aria-current={
                      page === id ||
                      (id === "Channels" && page === "Conversation")
                        ? "page"
                        : undefined
                    }
                    onClick={() => go(id)}
                  >
                    <Icon />
                    <span className="dock-label">{label}</span>
                  </DockItem>
                  {id === "Channels" &&
                    session.lanes.some((l) => l.lane.audience.length > 1) && (
                      <div
                        className="channel-branch"
                        data-expanded={state === "expanded" || isMobile}
                        aria-hidden={state !== "expanded" && !isMobile}
                        inert={state !== "expanded" && !isMobile}
                      >
                        <button
                          className="branch-toggle"
                          aria-label="Show shared channels"
                          aria-expanded={channelsOpen}
                          onClick={() => setChannelsOpen(!channelsOpen)}
                        >
                          <span>Shared</span>
                          <ChevronDown
                            size={13}
                            style={{
                              transform: channelsOpen
                                ? "none"
                                : "rotate(-90deg)",
                            }}
                          />
                        </button>
                        <div
                          className="channel-branch-list"
                          data-open={channelsOpen}
                        >
                          <div>
                            {session.lanes
                              .filter((l) => l.lane.audience.length > 1)
                              .map((l) => (
                                <button
                                  key={l.lane.id}
                                  className="branch-channel"
                                  disabled={busy}
                                  aria-current={
                                    session.lane === l.lane.id &&
                                    page === "Conversation"
                                      ? "page"
                                      : undefined
                                  }
                                  aria-label={`Open channel ${l.name}`}
                                  onClick={() =>
                                    void run(async () => {
                                      const s = await api("scope", {
                                        profile: session.profile.id,
                                        lane: l.lane.id,
                                      });
                                      accept(s);
                                      go("Conversation");
                                    })
                                  }
                                >
                                  <span>{l.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </Dock>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        {!isMobile && (
          <div className="sidebar-assistant">
            <AksaraLauncher />
          </div>
        )}
        <SidebarMenuButton
          tooltip={
            state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"
          }
          aria-label={
            isMobile
              ? "Close navigation"
              : state === "collapsed"
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
          onClick={() => (isMobile ? setOpenMobile(false) : toggleSidebar())}
        >
          {isMobile ? (
            <X />
          ) : state === "collapsed" ? (
            <PanelLeftOpen />
          ) : (
            <PanelLeftClose />
          )}
          <span>{isMobile ? "Close navigation" : "Collapse sidebar"}</span>
        </SidebarMenuButton>
        <ContextMenu />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              aria-label="Settings"
              isActive={page === "Settings"}
              onClick={() => go("Settings")}
            >
              <Settings2 />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
