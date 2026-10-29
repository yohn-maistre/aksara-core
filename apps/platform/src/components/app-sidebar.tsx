// Adapted from shadcn sidebar-08 (base-nova, MIT). All navigation is host-owned.
import {
  BookOpen,
  Hash,
  House,
  Layers,
  LockKeyhole,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Sprout,
  Sun,
} from "lucide-react";
import { useWorkspace } from "../workspace/state";
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
  const { session, page, navigate, needs, switchContext, theme, setTheme } =
    useWorkspace();
  const { setOpenMobile, isMobile, state, toggleSidebar } = useSidebar();
  if (!session) return null;
  const go = (p: string) => {
    navigate(p);
    setOpenMobile(false);
  };
  const links = [
    ["Today", House],
    ["Ask", LockKeyhole],
    ["Library", BookOpen],
    ["Channels", Hash],
    ["Tools", Layers],
  ] as const;
  return (
    <Sidebar variant="inset" collapsible="icon" className="aksara-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="brand-button"
              tooltip="Aksara home"
              aria-label="Aksara home"
              onClick={() => go("Today")}
            >
              <Sprout />
              <span>
                Aksara<span className="brand-sub">Your living workspace</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main">
          <SidebarMenu>
            {links.map(([id, Icon]) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  tooltip={id === "Ask" ? "Private conversation" : id}
                  aria-label={id === "Ask" ? "Ask PRIVATE" : id}
                  aria-current={page === id ? "page" : undefined}
                  isActive={page === id}
                  onClick={() => go(id)}
                >
                  <Icon />
                  <span>{id === "Ask" ? "Private thread" : id}</span>
                  {id === "Today" && needs.length > 0 && (
                    <span
                      className="rail-count"
                      aria-label={`${needs.length} need you`}
                    >
                      {needs.length}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
        <div className="rail-channel-list">
          <p>Shared channels</p>
          {session.lanes
            .filter((l) => l.lane.audience.length > 1)
            .map((l) => (
              <button
                key={l.lane.id}
                onClick={() => {
                  void switchContext(session.profile.id, l.lane.id);
                  go("Conversation");
                }}
              >
                <Hash size={15} />
                {l.name}
              </button>
            ))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Toggle theme"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>
                {theme === "dark" ? "Light appearance" : "Dark appearance"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
          <SidebarMenuItem>
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
              onClick={() =>
                isMobile ? setOpenMobile(false) : toggleSidebar()
              }
            >
              {state === "collapsed" ? <PanelLeftOpen /> : <PanelLeftClose />}
              <span>{isMobile ? "Close navigation" : "Collapse sidebar"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
