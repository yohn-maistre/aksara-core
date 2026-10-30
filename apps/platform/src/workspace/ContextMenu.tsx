import {
  Check,
  ChevronDown,
  LockKeyhole,
  Moon,
  Settings2,
  Sprout,
  Sun,
  Waves,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useWorkspace } from "./state";
export function ContextMenu() {
  const {
    session,
    profiles,
    busy,
    switchContext,
    navigate,
    theme,
    setTheme,
    ambientMotion,
    setAmbientMotion,
  } = useWorkspace();
  if (!session) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="identity-button"
        aria-label={`Context: ${session.profile.name}`}
      >
        <span className="identity-initial">{session.profile.name[0]}</span>
        <span className="identity-name">{session.profile.name}</span>
        <ChevronDown size={14} className="identity-chevron" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="workspace-context-menu"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Your spaces</DropdownMenuLabel>
          {profiles
            .filter((p) => p.actor === session.profile.actor)
            .map((p) => (
              <DropdownMenuItem
                key={p.id}
                disabled={busy}
                onClick={() => void switchContext(p.id)}
              >
                {p.mode === "personal" ? (
                  <LockKeyhole size={16} />
                ) : (
                  <Sprout size={16} />
                )}
                <span>
                  {p.mode === "personal"
                    ? "Personal space"
                    : "Community workspace"}
                </span>
                {p.id === session.profile.id && <Check size={14} />}
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span>
            {theme === "dark" ? "Light appearance" : "Dark appearance"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAmbientMotion(!ambientMotion)}>
          <Waves size={16} />
          <span>
            {ambientMotion
              ? "Pause background motion"
              : "Enable background motion"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("Settings")}>
          <Settings2 size={16} />
          <span>Settings & connections</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
