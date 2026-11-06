import { useEffect, useState, type ReactNode, lazy, Suspense } from "react";
import { ArrowUpRight, FileText, History, X } from "lucide-react";
import { useWorkspace } from "./state";
import { shortDate, stateWord } from "./shared";
const MessageBody = lazy(() =>
  import("../surfaces").then((m) => ({ default: m.MessageBody })),
);
export function HomeWorkbench({ composer }: { composer?: ReactNode }) {
  const w = useWorkspace();
  const [overview, setOverview] = useState<any>(null);
  const [problem, setProblem] = useState("");
  useEffect(() => {
    if (!w.session) return;
    let live = true;
    setOverview(null);
    setProblem("");
    const update = () =>
      w
        .api("kernel/home-overview")
        .then((v) => {
          if (live) {
            setOverview(v);
            setProblem("");
          }
        })
        .catch((e) => {
          if (live) setProblem(e.message);
        });
    void update();
    const timer = setInterval(() => {
      if (!document.hidden) void update();
    }, 5000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [w.session?.scope, w.api]);
  if (!w.session) return null;
  const work = overview?.work || [];
  const pages = overview?.artifacts || [];
  const go = async (row: any, action: () => Promise<void>) => {
    await w.beforeNavigate.current?.();
    if (row.lane !== w.session!.lane) {
      const s = await w.api("scope", {
        profile: w.session!.profile.id,
        lane: row.lane,
      });
      w.accept(s);
    }
    await action();
  };
  const working = work.filter((r: any) =>
    ["HEARD", "WORKING"].includes(r.work.state),
  );
  const needs = work.filter((r: any) =>
    ["NEEDS_INPUT", "AWAITING_APPROVAL"].includes(r.work.state),
  );
  const completed = work.filter(
    (r: any) =>
      !["HEARD", "WORKING", "NEEDS_INPUT", "AWAITING_APPROVAL"].includes(
        r.work.state,
      ),
  );
  return (
    <section className="home-surface" aria-label="Home">
      <header className="home-topline">
        <time>{shortDate(new Date())}</time>
      </header>
      <div className="living-brief">
        <h1>Work, taking shape.</h1>
        <p>Pick up a thought, follow the work, or make something together.</p>
        <div className="home-composer">{composer}</div>
        {w.messages.length > 0 && (
          <button
            className="text-button home-continue"
            onClick={() => w.navigate(w.privateLane ? "Ask" : "Conversation")}
          >
            Current conversation <ArrowUpRight size={14} />
          </button>
        )}
      </div>
      {problem && (
        <p role="alert" className="error">
          {problem}
        </p>
      )}
      <div className="home-workbench-layout">
        <section className="home-workbench" aria-label="Workspace workbench">
          <div className="section-title">
            <h2>On the workbench</h2>
            <button
              aria-label="Open Library from Home"
              className="text-button"
              onClick={() => w.navigate("Library")}
            >
              Library <ArrowUpRight size={14} />
            </button>
          </div>
          {!overview && !problem ? (
            <div className="loading-rows" role="status">
              Loading your work…
            </div>
          ) : pages.length || work.length ? (
            <div className="artifact-previews">
              {pages.map((row: any) => (
                <button
                  key={row.entry.id}
                  className="artifact-preview"
                  onClick={() =>
                    void w.run(() => go(row, () => w.openEntry(row.entry.id)))
                  }
                >
                  <span className="artifact-preview-top">
                    <FileText size={17} />
                    <span>
                      {row.entry.kind === "drawing"
                        ? "Drawing"
                        : row.entry.kind === "canvas"
                          ? "Source table"
                          : "Working document"}
                    </span>
                    <ArrowUpRight size={14} />
                  </span>
                  <strong>{row.entry.title}</strong>
                  <p>
                    {row.preview.replace(/^#+ /gm, "") ||
                      "A working page, ready for your next thought."}
                  </p>
                  <small>
                    {row.private ? "Only you" : row.channel} · Revision{" "}
                    {row.entry.revision}
                  </small>
                </button>
              ))}
              {!pages.length &&
                work.slice(0, 4).map((row: any) => (
                  <button
                    className="artifact-preview work-preview"
                    key={row.work.id}
                    onClick={() =>
                      void w.run(() => go(row, () => w.openWork(row.work)))
                    }
                  >
                    <span className="artifact-preview-top">
                      <FileText size={17} />
                      <span>{stateWord(row.work.state)}</span>
                      <ArrowUpRight size={14} />
                    </span>
                    <strong>
                      {row.work.request.replace(/^Create document: /, "")}
                    </strong>
                    <p>
                      {row.work.display_safe_summary ||
                        stateWord(row.work.state)}
                    </p>
                    <small>{row.private ? "Only you" : row.channel}</small>
                  </button>
                ))}
            </div>
          ) : (
            <div className="home-first-page">
              <FileText size={24} />
              <h3>A place for your first piece of work.</h3>
              <p>
                Start a conversation or bring a source. Its work and results
                will stay here.
              </p>
              <button
                className="text-button"
                onClick={() => w.setAssistantPanelOpen(true)}
              >
                Talk to Aksara <ArrowUpRight size={14} />
              </button>
            </div>
          )}
          {w.pinnedReplies
            .map((seq) => w.messages.find((m) => m.seq === seq))
            .filter(Boolean)
            .map((m: any) => (
              <section
                aria-label="Pinned reply"
                className="home-panel pinned-reading"
                key={m.seq}
              >
                <div className="section-title">
                  <h3>From our conversation</h3>
                  <button
                    aria-label="Remove Home panel"
                    onClick={() =>
                      w.setPinnedReplies((ids) =>
                        ids.filter((i) => i !== m.seq),
                      )
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
                <Suspense fallback={<p>Opening note…</p>}>
                  <MessageBody text={m.text} />
                </Suspense>
              </section>
            ))}
        </section>
        <aside className="home-activity" aria-label="Work activity">
          <h2>The latest</h2>
          {[
            ["Needs you", needs],
            ["Working", working],
            ["Recently finished", completed],
          ].map(([label, rows]: any) => (
            <section className="activity-group" key={label}>
              <h3>
                {label}
                <span>{rows.length}</span>
              </h3>
              {rows.length ? (
                rows.slice(0, 6).map((row: any) => (
                  <button
                    className="activity-row"
                    key={row.work.id}
                    onClick={() =>
                      void w.run(() => go(row, () => w.openWork(row.work)))
                    }
                  >
                    <span
                      className={`work-dot state-${row.work.state.toLowerCase()}`}
                    />
                    <span>
                      <strong>
                        {row.work.request.replace(/^Create document: /, "")}
                      </strong>
                      <small>
                        {row.private ? "Only you" : row.channel} ·{" "}
                        {stateWord(row.work.state)}
                      </small>
                    </span>
                    <ArrowUpRight size={13} />
                  </button>
                ))
              ) : (
                <p className="panel-empty">
                  {label === "Needs you"
                    ? "Nothing waiting on you."
                    : label === "Working"
                      ? "No work running right now."
                      : "Finished work will appear here."}
                </p>
              )}
            </section>
          ))}
        </aside>
      </div>
      <details className="home-history">
        <summary>
          <History size={15} />
          Recorded work
        </summary>
        <label>
          History date
          <input
            aria-label="History date"
            type="date"
            value={w.at}
            onChange={(e) => w.setAt(e.target.value)}
          />
        </label>
        {w.history &&
          (w.history.work.length ? (
            w.history.work.map((r: any) => (
              <p key={r.work.id}>
                {r.work.request} · {stateWord(r.work.state)}
              </p>
            ))
          ) : (
            <p>No recorded work for this date</p>
          ))}
      </details>
      {overview?.truncated && (
        <p className="composer-note">
          Showing the latest accessible work. Open a channel for its full
          history.
        </p>
      )}
    </section>
  );
}
