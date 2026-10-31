import { ArrowUpRight, FileText, Monitor, Sprout } from "lucide-react";
import { stateWord } from "./shared";
import { useWorkspace } from "./state";
import { PREVIEW } from "../transport";
/** Actual authorized work and artifacts only. No simulated tool traces or computer screenshots. */
export function WorkActivity() {
  const {
    works,
    working,
    artifacts,
    openWork,
    api,
    run,
    setDetail,
    navigate,
    backgroundWorkIds,
    privateLane,
  } = useWorkspace();
  const work = [...working, ...works.filter((w) => !working.includes(w))].slice(
    0,
    4,
  );
  return (
    <aside className="thread-activity" aria-label="Thread work">
      <h2>{working.length ? "In progress" : "In this thread"}</h2>
      {work.length ? (
        work.map((w) => (
          <button
            key={w.id}
            className="activity-work"
            onClick={() => void openWork(w)}
          >
            <Sprout
              size={17}
              className={working.includes(w) ? "is-working" : ""}
            />
            <span>
              <strong>{w.request}</strong>
              <small>
                {backgroundWorkIds.has(w.id) ? "Background · " : ""}
                {stateWord(w.state)}
              </small>
            </span>
            <ArrowUpRight size={13} />
          </button>
        ))
      ) : (
        <p className="activity-empty">Work will appear here.</p>
      )}
      {artifacts[0] && (
        <div className="activity-artifact">
          <h3>From your Library</h3>
          <button
            onClick={() =>
              void run(async () =>
                setDetail(
                  await api(
                    `kernel/artifact?id=${encodeURIComponent(artifacts[0].id)}`,
                  ),
                ),
              )
            }
          >
            <FileText size={27} />
            <span>{artifacts[0].title}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}
      <details className="computer-status">
        <summary>
          <Monitor size={17} />
          Computer
        </summary>
        <p>
          {PREVIEW
            ? "Connect a window from your local Aksara host."
            : privateLane
              ? "Manage the window Aksara can see and use, with a time-limited connection."
              : "Shared channels need their own isolated computer. Your personal desktop stays private."}
        </p>
        <button className="text-button" onClick={() => navigate("Tools")}>
          Manage computer access <ArrowUpRight size={13} />
        </button>
      </details>
    </aside>
  );
}
