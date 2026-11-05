import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  Monitor,
  Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";
import { stateWord, type Data } from "./shared";
import { useWorkspace } from "./state";
import { PREVIEW } from "../transport";
/** Result links come from canonical model note IDs / verified receipts. */
export function WorkActivity() {
  const w = useWorkspace();
  const [results, setResults] = useState<Data[]>([]);
  const work = [
    ...w.working,
    ...w.works.filter((x) => !w.working.includes(x)),
  ].slice(0, 6);
  const signature = work
    .map((x) => `${x.id}:${x.revision}:${x.state}`)
    .join("|");
  const artifactSignature = w.artifacts.map((a) => a.id).join("|");
  useEffect(() => {
    let current = true;
    setResults([]);
    void Promise.all(
      work.map((item) =>
        w
          .api(`kernel/work-artifacts?id=${encodeURIComponent(item.id)}`)
          .then((items: Data[]) =>
            items.map((a) => ({ ...a, work_id: item.id })),
          )
          .catch(() => []),
      ),
    ).then((groups) => {
      if (current) setResults(groups.flat());
    });
    return () => {
      current = false;
    };
  }, [w.session?.scope, signature, artifactSignature]);
  const visibleResults = results.filter((a) =>
    w.artifacts.some((visible) => visible.id === a.id),
  );
  return (
    <aside className="thread-activity" aria-label="Thread work">
      <h2>{w.working.length ? "Moving quietly" : "In this thread"}</h2>
      {work.length ? (
        work.map((item) => (
          <button
            key={item.id}
            className="activity-work"
            onClick={() => void w.openWork(item)}
          >
            <Workflow size={17} />
            <span>
              <strong>{item.request}</strong>
              <small>
                {w.backgroundWorkIds.has(item.id) ? "Background · " : ""}
                {stateWord(item.state)}
              </small>
            </span>
            <ArrowUpRight size={13} />
          </button>
        ))
      ) : (
        <p className="activity-empty">
          As we work, tasks and their results will stay here.
        </p>
      )}
      {visibleResults.length > 0 && (
        <div className="activity-artifact">
          <h3>Results from this work</h3>
          {visibleResults.map((a) => (
            <button
              key={`${a.work_id}:${a.id}`}
              onClick={() =>
                void w.run(async () =>
                  w.setDetail(
                    await w.api(
                      `kernel/artifact?id=${encodeURIComponent(a.id)}`,
                    ),
                  ),
                )
              }
            >
              <FileText size={18} />
              <span>{a.title}</span>
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      )}
      {w.entries.length > 0 && (
        <div className="activity-artifact">
          <h3>On our desk</h3>
          {w.entries.slice(0, 6).map((e) => (
            <button key={e.id} onClick={() => void w.openEntry(e.id)}>
              {e.kind === "canvas" ? (
                <LayoutDashboard size={17} />
              ) : (
                <FileText size={17} />
              )}
              <span>{e.title}</span>
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      )}
      <button
        className="text-button"
        onClick={() => {
          w.setDocTitle("Meeting notes");
          w.setDocContent(
            "# Meeting notes\n\n## What we want to resolve\n\n## Proposals\n\n## Decisions\n\n## Next steps\n",
          );
          w.setDocSources([]);
          w.setDetail(null);
          w.setShowDoc(true);
        }}
      >
        Start a meeting note <ArrowUpRight size={13} />
      </button>
      <details className="computer-status">
        <summary>
          <Monitor size={17} />
          Computer
        </summary>
        <p>
          {PREVIEW
            ? "Connect a window from your local Aksara host."
            : w.privateLane
              ? "Manage the window Aksara can see and use, with a time-limited connection."
              : "Shared channels need an isolated computer. Your personal desktop stays private."}
        </p>
        <button className="text-button" onClick={() => w.navigate("Tools")}>
          Manage computer access <ArrowUpRight size={13} />
        </button>
      </details>
    </aside>
  );
}
