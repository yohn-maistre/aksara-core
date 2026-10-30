import { ChevronDown, Sprout } from "lucide-react";
import { useState } from "react";
import { DynamicIsland } from "../components/ui/dynamic-island";
import { useWorkspace } from "./state";
import { stateWord } from "./shared";
export function WorkIsland() {
  const { working, needs, openWork } = useWorkspace();
  const [expanded, setExpanded] = useState(false);
  const items = [...working, ...needs].slice(0, 4);
  if (!items.length) return null;
  return (
    <DynamicIsland expanded={expanded}>
      <button
        className="island-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <Sprout size={17} />
        <span>
          {working.length
            ? "Work in progress"
            : `${needs.length} need${needs.length === 1 ? "s" : ""} you`}
        </span>
        <ChevronDown size={15} />
      </button>
      {expanded && (
        <div className="island-work-list">
          {items.map((w) => (
            <button key={w.id} onClick={() => void openWork(w)}>
              <span>{w.request}</span>
              <small>{stateWord(w.state)}</small>
            </button>
          ))}
        </div>
      )}
    </DynamicIsland>
  );
}
