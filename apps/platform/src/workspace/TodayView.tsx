import {
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  History,
  Plus,
  Users,
  X,
  LayoutDashboard,
} from "lucide-react";
import { lazy, Suspense, type ReactNode } from "react";
const MessageBody = lazy(() =>
  import("../surfaces").then((m) => ({ default: m.MessageBody })),
);
import { useWorkspace } from "./state";
import { shortDate, stateWord } from "./shared";
import { PREVIEW } from "../transport";
export function TodayView({ composer }: { composer?: ReactNode }) {
  const w = useWorkspace();
  if (!w.session) return null;
  const pending = w.needs[0];
  const latest = w.artifacts[0];
  const recent = w.visibleWorks.slice(0, 4);
  const openThread = () => w.navigate(w.privateLane ? "Ask" : "Conversation");
  const homeReply =
    w.homeReplyAfter === null
      ? null
      : [...w.messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.seq > w.homeReplyAfter!);
  return (
    <section className="home-surface" aria-label="Home">
      <header className="home-topline">
        <span>
          {w.session.profile.mode === "personal"
            ? "Your space"
            : "Aksara Commons"}
        </span>
        <time>{shortDate(new Date())}</time>
      </header>
      <div className="living-brief">
        <h1>
          {pending ? (
            <>
              A little attention.
              <br />
              <span>A meaningful next step.</span>
            </>
          ) : w.working.length ? (
            <>
              The work is moving.
              <br />
              <span>What’s on your mind?</span>
            </>
          ) : (
            <>
              A little space
              <br />
              <span>for what comes next.</span>
            </>
          )}
        </h1>
        <p>
          {pending
            ? "There’s work ready for your judgement."
            : w.working.length
              ? `${w.working.length} ${w.working.length === 1 ? "task is" : "tasks are"} continuing in this conversation.`
              : "Bring a question, an unfinished thought, or something we can make together."}
        </p>
        <div className="home-composer">{composer}</div>
        {!PREVIEW && !w.model && (
          <button className="text-button" onClick={() => w.navigate("Setup")}>
            Connect a model <ArrowUpRight size={14} />
          </button>
        )}
        {homeReply && (
          <section
            className="home-acknowledgment"
            aria-label="Latest Home reply"
          >
            <p>{homeReply.text.split("```", 1)[0].slice(0, 240)}</p>
            <button className="text-button" onClick={openThread}>
              Open conversation <ArrowUpRight size={14} />
            </button>
            <button
              className="icon-button"
              aria-label="Dismiss Home reply"
              onClick={() => w.setHomeReplyAfter(null)}
            >
              <X size={14} />
            </button>
          </section>
        )}
      </div>
      <div className="home-desk">
        <section className="home-attention">
          <div className="section-title">
            <h2>{pending ? "Needs your eye" : "Pick up the thread"}</h2>
            <button
              className="text-button"
              aria-label="Open Library"
              onClick={() => w.navigate("Library")}
            >
              Library <ArrowUpRight size={14} />
            </button>
          </div>
          {pending ? (
            <button
              className="attention-document"
              onClick={() => void w.openWork(pending)}
            >
              <span className="paper-tab">
                <FileText size={20} />
              </span>
              <h3>{pending.request.replace(/^Create document: /, "")}</h3>
              <p>{pending.display_safe_summary || stateWord(pending.state)}</p>
              <span className="text-button">
                Review the work <ArrowUpRight size={14} />
              </span>
            </button>
          ) : latest ? (
            <button
              className="attention-document"
              onClick={() =>
                void w.run(async () =>
                  w.setDetail(
                    await w.api(
                      `kernel/artifact?id=${encodeURIComponent(latest.id)}`,
                    ),
                  ),
                )
              }
            >
              <span className="paper-tab">
                <FileText size={20} />
              </span>
              <h3>{latest.title}</h3>
              <p>
                {latest.visibility === "private"
                  ? "A source in your private Library."
                  : "A source to build on together."}
              </p>
              <span className="text-button">
                Open document <ArrowUpRight size={14} />
              </span>
            </button>
          ) : (
            <div className="home-first-page">
              <h3>Every good thing starts somewhere.</h3>
              <p>
                A note can become a plan. A few sources can become shared
                understanding.
              </p>
              <button
                className="text-button"
                onClick={() => {
                  w.setDocTitle("");
                  w.setDocContent("");
                  w.setDocSources([]);
                  w.setShowDoc(true);
                }}
              >
                Give an idea a page <Plus size={15} />
              </button>
            </div>
          )}
        </section>
        <section className="home-continuity">
          <h2>
            {w.working.length ? "Moving quietly" : "In this conversation"}
          </h2>
          {recent.length ? (
            recent.map((item: any) => (
              <button
                className="continuity-row"
                key={item.id}
                disabled={!!w.at}
                onClick={() => void w.openWork(item)}
              >
                <span
                  className={`work-dot state-${item.state.toLowerCase()}`}
                />
                <span>
                  <strong>{item.request}</strong>
                  <small>{stateWord(item.state)}</small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))
          ) : (
            <p className="panel-empty">
              Ask Aksara to help. You’ll find the work and its results here.
            </p>
          )}
          {!homeReply && w.messages.length > 0 && (
            <button className="text-button" onClick={openThread}>
              Continue our conversation <ArrowUpRight size={14} />
            </button>
          )}
          <div className="home-starts">
            <button onClick={() => w.navigate("Channels")}>
              <Users size={17} />
              <span>Think together</span>
              <ArrowUpRight size={14} />
            </button>
            <button onClick={w.newCanvas}>
              <LayoutDashboard size={17} />
              <span>Open a shared table</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </section>
      </div>
      {w.entries.length > 0 && (
        <section className="home-working-pages">
          <div className="section-title">
            <h2>On the desk</h2>
            <span>Saved in this conversation</span>
          </div>
          {w.entries.slice(0, 3).map((e) => (
            <button
              key={e.id}
              className="working-page-row"
              onClick={() => void w.openEntry(e.id)}
            >
              {e.kind === "canvas" ? (
                <LayoutDashboard size={18} />
              ) : (
                <FileText size={18} />
              )}
              <strong>{e.title}</strong>
              <small>Revision {e.revision}</small>
              <ArrowUpRight size={14} />
            </button>
          ))}
        </section>
      )}
      {w.pinnedReplies.map((seq) => {
        const reply = w.messages.find(
          (m) => m.seq === seq && m.role === "assistant",
        );
        return reply ? (
          <section
            className="home-working-pages pinned-reading"
            key={seq}
            aria-label="Pinned reply"
          >
            <div className="section-title">
              <h2>From our conversation</h2>
              <button
                className="icon-button"
                aria-label="Unpin reply from Home"
                onClick={() =>
                  w.setPinnedReplies((ids) => ids.filter((id) => id !== seq))
                }
              >
                <X size={15} />
              </button>
            </div>
            <Suspense fallback={<p>Opening reply…</p>}>
              <MessageBody text={reply.text} />
            </Suspense>
            <button className="text-button" onClick={openThread}>
              Open thread <ArrowUpRight size={14} />
            </button>
          </section>
        ) : null;
      })}
      <details className="home-history">
        <summary>
          <History size={15} />
          Recorded work
        </summary>
        <label>
          Choose a date{" "}
          <input
            type="date"
            aria-label="Historical date"
            max={new Date().toLocaleDateString("en-CA")}
            value={w.at}
            onChange={(e) => w.setAt(e.target.value)}
          />
        </label>
        {w.at && (
          <>
            <p>Recorded states only; past content is not reconstructed.</p>
            {w.visibleWorks.length ? (
              w.visibleWorks.map((item: any) => (
                <p key={item.id}>
                  {item.request} · {stateWord(item.state)}
                </p>
              ))
            ) : (
              <h3>No recorded work for this date</h3>
            )}
            <button className="text-button" onClick={() => w.setAt("")}>
              Return to now
            </button>
          </>
        )}
      </details>
    </section>
  );
}
