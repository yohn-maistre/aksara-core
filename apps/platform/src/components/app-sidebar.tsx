import {
  BookOpen,
  ChevronDown,
  Hash,
  House,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "../workspace/state";
import { ContextMenu } from "../workspace/ContextMenu";
import { Mark } from "../workspace/shared";
export function AppSidebar() {
  const w = useWorkspace();
  const [channelsOpen, setChannelsOpen] = useState(true);
  if (!w.session) return null;
  const { session, page, navExpanded, navigate, setNavExpanded } = w;
  const links = [
    ["Today", "Home", House],
    ["Ask", "Aksara", MessageCircle],
    ["Library", "Library", BookOpen],
    ["Channels", "Channels", Hash],
    ["Canvas", "Shared table", LayoutDashboard],
    ["Tools", "Capabilities", Layers],
  ] as const;
  return (
    <aside
      className="reading-nav"
      data-expanded={navExpanded}
      aria-label="Workspace navigation"
    >
      <button
        className="reading-brand"
        aria-label="Aksara Home"
        onClick={() => navigate("Today")}
      >
        <Mark />
        <span>
          Aksara
          <small>
            {session.profile.mode === "personal"
              ? "Personal space"
              : "Community office"}
          </small>
        </span>
      </button>
      <nav aria-label="Main">
        {links.map(([id, label, Icon]) => (
          <div key={id}>
            <button
              className="reading-nav-link"
              title={label}
              aria-label={
                id === "Tools" ? "Tools" : id === "Ask" ? "Ask PRIVATE" : label
              }
              aria-current={
                page === id || (id === "Channels" && page === "Conversation")
                  ? "page"
                  : undefined
              }
              onClick={() => (id === "Canvas" ? w.newCanvas() : navigate(id))}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "Channels" && navExpanded && <ChevronDown size={13} />}
            </button>
            {id === "Channels" && navExpanded && (
              <div className="reading-channels">
                {session.lanes
                  .filter((l) => l.lane.audience.length > 1)
                  .map((l) => (
                    <button
                      key={l.lane.id}
                      className="reading-channel"
                      aria-label={`Open channel ${l.name}`}
                      aria-current={
                        session.lane === l.lane.id && page === "Conversation"
                          ? "page"
                          : undefined
                      }
                      disabled={w.busy}
                      onClick={() =>
                        void w.run(async () => {
                          await w.beforeNavigate.current?.();
                          const s = await w.api("scope", {
                            profile: session.profile.id,
                            lane: l.lane.id,
                          });
                          w.accept(s);
                          w.setPage("Conversation");
                        })
                      }
                    >
                      <Hash size={14} />
                      <span>{l.name}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="reading-nav-footer">
        <button
          className="reading-nav-link"
          aria-label="Settings"
          onClick={() => navigate("Settings")}
        >
          <Settings2 size={18} />
          <span>Settings</span>
        </button>
        <ContextMenu />
        <button
          className="reading-nav-link nav-fold"
          aria-label={navExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setNavExpanded(!navExpanded)}
        >
          {navExpanded ? (
            <PanelLeftClose size={17} />
          ) : (
            <PanelLeftOpen size={17} />
          )}
          <span>Collapse sidebar</span>
        </button>
      </div>
    </aside>
  );
}
