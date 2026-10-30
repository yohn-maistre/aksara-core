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
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 19 12 5l7 14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Aksara</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="sidebar-assistant">
          <AksaraLauncher />
        </div>
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
                    (state === "expanded" || isMobile) &&
                    session.lanes.some((l) => l.lane.audience.length > 1) && (
                      <div className="channel-branch">
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
                        {channelsOpen &&
                          session.lanes
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
                                {l.name}
                              </button>
                            ))}
                      </div>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </Dock>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className="rail-presence" aria-hidden />
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
