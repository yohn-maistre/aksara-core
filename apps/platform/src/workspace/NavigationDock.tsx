import { BookOpen, Hash, House, Layers, MoreHorizontal } from "lucide-react";
import { Dock, DockItem } from "../components/ui/dock";
import { useSidebar } from "../components/ui/sidebar";
import { useWorkspace } from "./state";
export function MobileDock() {
  const { page, navigate } = useWorkspace();
  const { setOpenMobile } = useSidebar();
  return (
    <nav className="mobile-dock" aria-label="Main navigation">
      <Dock className="mobile-dock-items">
        {(
          [
            ["Today", "Home", House],
            ["Library", "Library", BookOpen],
            ["Channels", "Channels", Hash],
            ["Tools", "Tools", Layers],
          ] as const
        ).map(([destination, label, Icon]) => (
          <DockItem
            key={destination}
            aria-label={label}
            aria-current={
              page === destination ||
              (destination === "Channels" && page === "Conversation")
                ? "page"
                : undefined
            }
            onClick={() => navigate(destination)}
          >
            <Icon size={22} />
            <span className="dock-phone-label">
              {label === "Tools" ? "Packs" : label}
            </span>
          </DockItem>
        ))}
        <DockItem
          aria-label="Open navigation"
          onClick={() => setOpenMobile(true)}
        >
          <MoreHorizontal size={22} />
          <span className="dock-phone-label">More</span>
        </DockItem>
      </Dock>
    </nav>
  );
}
