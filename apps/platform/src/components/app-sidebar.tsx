// shadcn sidebar-08 (MIT), adapted for a regular full-height Aksara navigation spine.
import {
  BookOpen,
  ChevronDown,
  Hash,
  House,
  Layers,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Sprout,
  X,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "../workspace/state";
import { ContextMenu } from "../workspace/ContextMenu";
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
    ["Ask", "Private thread", MessageSquare],
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
              onClick={() =>
                isMobile ? setOpenMobile(false) : toggleSidebar()
              }
            >
              <Sprout />
              <span>Aksara</span>
              {state === "expanded" && (isMobile ? <X /> : <PanelLeftClose />)}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main">
          <SidebarMenu>
            {links.map(([id, label, Icon]) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  tooltip={label}
                  aria-label={
                    id === "Ask"
                      ? "Ask PRIVATE"
                      : id === "Today"
                        ? "Home"
                        : id === "Tools"
                          ? "Tools"
                          : label
                  }
                  aria-current={page === id ? "page" : undefined}
                  isActive={
                    page === id ||
                    (id === "Channels" && page === "Conversation")
                  }
                  onClick={() => go(id)}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
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
                            transform: channelsOpen ? "none" : "rotate(-90deg)",
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
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className="rail-presence" aria-hidden />
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
