// Adapted from OpenDuet's shell/{header,tab-bar,menu-sheet,app-shell}.tsx,
// MIT, pin 60fd4c7. See third_party/openduet/LICENSE and docs/donors.md.
// Presentation only: Aksara owns session, scope, channel data and navigation.
import { motion } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  BookOpen,
  Hash,
  House,
  Layers,
  LockKeyhole,
  MessageCircle,
  Moon,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import { DuetIcon } from "../duet/icons";
import { MicOrb } from "../duet/mic-orb";
import { DURATION, EASE_OUT } from "../../lib/motion";
import { useReducedMotionPreference } from "../../lib/reduced-motion";

type Navigate = (page: string) => void;
const tabs = [
  { id: "Today", icon: "tasks", label: "Today" },
  { id: "Ask", icon: "chat", label: "Ask" },
  { id: "Library", icon: "sparkle", label: "Library" },
] as const;

/** OpenDuet's 46px glass discs, central presence and compact page chrome. */
export function ShellHeader({
  name,
  page,
  menuOpen,
  onMenu,
  onHome,
  onSettings,
  onBack,
  working,
  drafting,
}: {
  name: string;
  page: string;
  menuOpen: boolean;
  onMenu: () => void;
  onHome: () => void;
  onSettings: () => void;
  onBack: () => void;
  working: boolean;
  drafting: boolean;
}) {
  const primary = ["Today", "Ask", "Conversation", "Library"].includes(page);
  return (
    <header className="shell-header">
      <button
        className="shell-disc"
        aria-label={primary ? "Open navigation" : "Back to Today"}
        aria-expanded={primary ? menuOpen : undefined}
        onClick={primary ? onMenu : onBack}
      >
        <DuetIcon name={primary ? "menu" : "chevronLeft"} size={21} />
      </button>
      <button
        className="shell-presence"
        onClick={onHome}
        aria-label="Aksara home"
      >
        <MicOrb
          size={60}
          state={working ? "thinking" : drafting ? "listening" : "idle"}
        />
        <span>Aksara</span>
      </button>
      <button className="shell-disc" onClick={onSettings} aria-label="Settings">
        <span className="type-nav font-semibold">
          {name.match(/\p{L}|\p{N}/u)?.[0]?.toUpperCase() ?? "?"}
        </span>
      </button>
    </header>
  );
}

/** Upstream floating tab capsule; counts come from the eligible Aksara queue. */
export function TabBar({
  current,
  waiting,
  navigate,
}: {
  current: string;
  waiting: number;
  navigate: Navigate;
}) {
  const reduced = useReducedMotionPreference();
  const bar = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--aksara-tab-space",
        `${Math.ceil(el.getBoundingClientRect().height) + 38}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <nav ref={bar} aria-label="Main" className="shell-tabs duet-glass">
      {tabs.map((tab) => {
        const on =
          tab.id === current ||
          (current === "Conversation" && tab.id === "Ask");
        const badge = tab.id === "Today" ? waiting : 0;
        return (
          <button
            key={tab.id}
            aria-current={on ? "page" : undefined}
            aria-label={tab.id === "Ask" ? "Ask PRIVATE" : tab.label}
            className={`shell-tab ${on ? "is-current" : ""}`}
            onClick={() => navigate(tab.id)}
          >
            {on && (
              <motion.span
                aria-hidden
                className="tab-capsule"
                layoutId={reduced ? undefined : "duet-tab-capsule"}
                transition={{ duration: DURATION.enter, ease: EASE_OUT }}
              />
            )}
            <DuetIcon name={tab.icon} size={20} stroke={on ? 2.1 : 1.9} />
            <span>{tab.label}</span>
            {badge > 0 && (
              <span className="tab-badge" aria-label={`${badge} need you`}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/** Focus-trapped menu sheet, using the existing accessible Base UI primitives. */
export function MenuSheet({
  open,
  onOpenChange,
  page,
  profile,
  lanes,
  currentLane,
  navigate,
  onChannel,
  theme,
  onTheme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  page: string;
  profile: { name: string; mode: string };
  lanes: { name: string; lane: { id: string; audience: string[] } }[];
  currentLane: string;
  navigate: Navigate;
  onChannel: (id: string) => void;
  theme: string;
  onTheme: () => void;
}) {
  const go = (target: string) => {
    onOpenChange(false);
    navigate(target);
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="menu-backdrop" />
        <Dialog.Popup className="menu-sheet">
          <div className="menu-heading">
            <div>
              <Dialog.Title>Aksara</Dialog.Title>
              <Dialog.Description>
                {profile.name} ·{" "}
                {profile.mode === "personal"
                  ? "Personal space"
                  : "Aksara Commons"}
              </Dialog.Description>
            </div>
            <Dialog.Close className="shell-disc" aria-label="Close navigation">
              <X size={20} />
            </Dialog.Close>
          </div>
          <nav aria-label="Workspace" className="menu-primary">
            {[
              ["Today", House, "Work that needs you"],
              ["Ask", LockKeyhole, "Your private thread"],
              ["Library", BookOpen, "Sources and documents"],
            ].map(([label, Icon, sub]) => {
              const Glyph = Icon as typeof House;
              const target = label as string;
              return (
                <button
                  key={target}
                  aria-label={target === "Ask" ? "Ask PRIVATE" : target}
                  aria-current={page === target ? "page" : undefined}
                  onClick={() => go(target)}
                >
                  <Glyph size={22} />
                  <span>
                    <strong>{target}</strong>
                    <small>{sub as string}</small>
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="menu-channels">
            <p>Channels</p>
            {lanes
              .filter((l) => l.lane.audience.length > 1)
              .map((l) => (
                <button
                  key={l.lane.id}
                  className={l.lane.id === currentLane ? "is-current" : ""}
                  onClick={() => {
                    onOpenChange(false);
                    onChannel(l.lane.id);
                  }}
                >
                  <Hash size={22} />
                  <span>
                    <strong>{l.name}</strong>
                    <small>{l.lane.audience.length} current members</small>
                  </span>
                </button>
              ))}
            <button onClick={() => go("Channels")} aria-label="Channels">
              <MessageCircle size={22} />
              <span>Manage channels</span>
            </button>
          </div>
          <nav aria-label="Manage" className="menu-utilities">
            <button onClick={() => go("Tools")}>
              <Layers size={21} />
              Tools
            </button>
            <button onClick={onTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={21} /> : <Sun size={21} />}{" "}
              {theme === "light" ? "Dark appearance" : "Light appearance"}
            </button>
            <button onClick={() => go("Settings")}>
              <Settings2 size={21} />
              Settings
            </button>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
