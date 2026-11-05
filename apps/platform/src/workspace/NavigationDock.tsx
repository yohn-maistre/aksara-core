import {
  BookOpen,
  Hash,
  House,
  LayoutGrid,
  Layers,
  Settings,
  Sparkles,
} from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { useState } from "react";
import { useSidebar } from "../components/ui/sidebar";
import { useWorkspace } from "./state";
import { AksaraLauncher } from "./AksaraLauncher";
export function MobileSpaces() {
  const { page, navigate } = useWorkspace();
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  if (!isMobile) return null;
  const go = (destination: string) => {
    setOpen(false);
    navigate(destination);
  };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className="spaces-trigger icon-button"
        aria-label="Spaces"
      >
        <LayoutGrid size={20} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="top"
          align="start"
          sideOffset={12}
          className="spaces-positioner"
        >
          <Popover.Popup
            className="spaces-menu"
            aria-label="Workspace destinations"
          >
            <nav aria-label="Main navigation">
              <div className="spaces-circles">
                {(
                  [
                    ["Today", "Home", House],
                    ["Library", "Library", BookOpen],
                    ["Channels", "Channels", Hash],
                    ["Tools", "Capabilities", Layers],
                  ] as const
                ).map(([destination, label, Icon]) => (
                  <button
                    key={destination}
                    aria-label={label}
                    aria-current={page === destination ? "page" : undefined}
                    onClick={() => go(destination)}
                  >
                    <span>
                      <Icon size={22} />
                    </span>
                    <small>{label}</small>
                  </button>
                ))}
              </div>
              <div className="spaces-secondary">
                <button onClick={() => go("Ask")}>
                  <Sparkles size={16} />
                  Ask Aksara
                </button>
                <button onClick={() => go("Settings")} aria-label="Settings">
                  <Settings size={18} />
                </button>
              </div>
            </nav>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
export function MobileDock() {
  const { page } = useWorkspace();
  const { isMobile } = useSidebar();
  if (!isMobile || ["Ask", "Conversation", "Document", "Canvas"].includes(page)) return null;
  return (
    <div className="mobile-dock mobile-launchers">
      <MobileSpaces />
      <AksaraLauncher />
    </div>
  );
}
