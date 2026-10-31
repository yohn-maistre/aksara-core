import { BookOpen, Hash, House, MoreHorizontal } from "lucide-react";
import { Dock, DockItem } from "../components/ui/dock";
import { useSidebar } from "../components/ui/sidebar";
import { useWorkspace } from "./state";
import { AksaraLauncher } from "./AksaraLauncher";
export function MobileDock() {
  const { page, navigate } = useWorkspace();
  const { setOpenMobile, isMobile } = useSidebar();
  // CSS-hidden responsive origins still participate in Motion's layout group.
  // Mount just one launcher so an invisible phone source cannot hide the rail.
  if (!isMobile) return null;
  return (
    <nav className="mobile-dock" aria-label="Main navigation">
      <Dock className="mobile-dock-items">
        {(
          [
            ["Today", "Home", House],
            ["Library", "Library", BookOpen],
          ] as const
        ).map(([destination, label, Icon]) => (
          <DockItem
            key={destination}
            aria-label={label}
            aria-current={page === destination ? "page" : undefined}
            onClick={() => navigate(destination)}
          >
            <Icon size={22} />
            <span className="dock-phone-label">{label}</span>
          </DockItem>
        ))}
        <AksaraLauncher />
        <DockItem
          aria-label="Channels"
          aria-current={
            page === "Channels" || page === "Conversation" ? "page" : undefined
          }
          onClick={() => navigate("Channels")}
        >
          <Hash size={22} />
          <span className="dock-phone-label">Channels</span>
        </DockItem>
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
