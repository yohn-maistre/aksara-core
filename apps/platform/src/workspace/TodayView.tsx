import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  FileText,
  History,
  LockKeyhole,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { Expandable, ExpandableContent } from "../components/ui/expandable";
import { HaloProgress } from "../components/ui/halo-progress";
import { PREVIEW } from "../transport";
import { Composer } from "./Composer";
import { shortDate, stateWord, type Work } from "./shared";
import { useWorkspace } from "./state";
const MessageBody = lazy(() =>
  import("../surfaces").then((m) => ({ default: m.MessageBody })),
);
function WorkSection({
  title,
  items,
  empty,
  historical = false,
}: {
  title: string;
  items: Work[];
  empty: string;
  historical?: boolean;
}) {
  const { openWork } = useWorkspace();
  const [expanded, setExpanded] = useState(true);
  return (
    <Expandable
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      transitionDuration={0.2}
      className="work-section"
    >
      <button
        className="section-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <h2>
          {title}
          <span>{items.length}</span>
        </h2>
        <ChevronDown
          size={16}
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>
      <ExpandableContent>
        {items.length ? (
          items.map((w) => (
            <button
              key={w.id}
              className={`work-row state-${w.state.toLowerCase()}`}
              disabled={historical}
              aria-label={`${w.state === "AWAITING_APPROVAL" ? "Review" : "Open"} ${w.request}`}
              onClick={() => void openWork(w)}
            >
              <span className="work-state-icon">
                {w.state === "COMPLETED" ? (
                  <Check size={17} />
                ) : w.state === "AWAITING_APPROVAL" ? (
                  <LockKeyhole size={16} />
                ) : (
                  <Circle size={15} />
                )}
              </span>
              <span>
                <strong>{w.request}</strong>
                <small>{stateWord(w.state)}</small>
              </span>
              {!historical && <ArrowUpRight size={15} />}
            </button>
          ))
        ) : (
          <p className="section-empty">{empty}</p>
        )}
      </ExpandableContent>
    </Expandable>
  );
}
export function TodayView() {
  const {
    session,
    privateLane,
    lane,
    at,
    setAt,
    visibleWorks,
    working,
    artifacts,
    navigate,
    setShowDoc,
    api,
    setDetail,
    run,
    messages,
  } = useWorkspace();
  if (!session) return null;
  const latest = messages.filter((m) => m.role === "assistant").at(-1);
  return (
    <>
      <div className="today-heading">
        <div>
          <p className="eyebrow">
            {at ? "Recorded work" : shortDate(new Date())}
          </p>
          <h1>{at ? "A look back." : `Hello, ${session.profile.name}.`}</h1>
        </div>
        <div
          className="today-presence"
          aria-label={
            working.length ? "Aksara has work in progress" : "Aksara is ready"
          }
        >
          <span
            className={`aksara-presence ${working.length ? "is-working" : ""}`}
            aria-hidden
          />
          <span>
            Aksara
            <span>{working.length ? "Work in progress" : "Here with you"}</span>
          </span>
        </div>
      </div>
      {!PREVIEW &&
        !localStorage.getItem(`aksara-setup:${session.profile.id}`) && (
          <div className="setup-invitation">
            <span>Choose how Aksara thinks.</span>
            <button className="text-button" onClick={() => navigate("Setup")}>
              Set up your connection <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      {!at && (
        <section className="embedded-aksara" aria-label="Aksara on Today">
          <div className="embedded-prompt">
            <p>
              {privateLane
                ? "What would you like to make room for?"
                : `What shall we work on in ${lane?.name}?`}
            </p>
            <button
              className="text-button"
              onClick={() => navigate(privateLane ? "Ask" : "Conversation")}
            >
              Open conversation <ArrowUpRight size={14} />
            </button>
          </div>
          <Composer />
          {latest && (
            <div className="today-reply">
              <span className="eyebrow">
                Aksara · latest reply{PREVIEW ? " · sample" : ""}
              </span>
              <Suspense fallback={<p>{latest.text}</p>}>
                <MessageBody text={latest.text} />
              </Suspense>
              <button
                className="text-button"
                onClick={() => navigate(privateLane ? "Ask" : "Conversation")}
              >
                Continue this thread <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </section>
      )}
      <div className="today-section-heading">
        <h2>{at ? "Recorded activity" : "In your space"}</h2>
        <label className="date-picker">
          <History size={14} />
          <span>{at ? "Viewing history" : "History"}</span>
          <input
            aria-label="Historical date"
            type="date"
            value={at}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => setAt(e.target.value)}
          />
          {at && (
            <button aria-label="Return to now" onClick={() => setAt("")}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      {at && (
        <p className="history-notice">
          Recorded work states only. Past documents, messages and membership are
          not reconstructed.
        </p>
      )}
      {at && !visibleWorks.length && (
        <div className="history-empty">
          <h3>No recorded work for this date</h3>
          <p>History begins when real work is recorded.</p>
        </div>
      )}
      <div className="today-grid">
        <div className="today-work">
          <WorkSection
            title="Needs you"
            items={visibleWorks.filter((w: Work) =>
              ["AWAITING_APPROVAL", "NEEDS_INPUT"].includes(w.state),
            )}
            empty="Nothing waiting on your decision."
            historical={!!at}
          />
          <WorkSection
            title="Moving along"
            items={visibleWorks.filter((w: Work) =>
              ["HEARD", "WORKING"].includes(w.state),
            )}
            empty="Room for the next idea."
            historical={!!at}
          />
          {working.length > 0 && !at && (
            <HaloProgress
              value={null}
              label="Work in progress · no time estimate"
              translucent={false}
            />
          )}
          <WorkSection
            title="Recently settled"
            items={visibleWorks
              .filter((w: Work) =>
                ["COMPLETED", "FAILED", "CANCELLED"].includes(w.state),
              )
              .slice(0, 5)}
            empty="Completed work will find its place here."
            historical={!!at}
          />
        </div>
        <aside className="today-side" aria-label="Workspace resources">
          <section className="tonal-panel library-glance">
            <div className="section-heading">
              <BookOpen size={18} />
              <h2>Your Library</h2>
              <button
                className="icon-button"
                aria-label="Open Library"
                onClick={() => navigate("Library")}
              >
                <ArrowUpRight size={17} />
              </button>
            </div>
            <p>Sources, notes, and things worth keeping.</p>
            {artifacts.slice(0, 3).map((a) => (
              <button
                className="artifact-glance"
                key={a.id}
                onClick={() =>
                  void run(async () =>
                    setDetail(
                      await api(
                        `kernel/artifact?id=${encodeURIComponent(a.id)}`,
                      ),
                    ),
                  )
                }
              >
                <FileText size={17} />
                <span>
                  {a.title}
                  <small>
                    {a.visibility === "private"
                      ? "Private"
                      : "Shared in this context"}
                  </small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))}
            <button className="text-button" onClick={() => navigate("Library")}>
              <Plus size={15} />
              Add a source
            </button>
          </section>
          <section className="tonal-panel warm-panel">
            <div className="section-heading">
              <Sparkles size={18} />
              <h2>A little room to create</h2>
            </div>
            <p>
              Turn a thought into a page. You’ll review it before it becomes
              part of this space.
            </p>
            <button className="pill-button" onClick={() => setShowDoc(true)}>
              Draft a document <ArrowUpRight size={15} />
            </button>
          </section>
          <p className="quiet-context">
            <LockKeyhole size={14} />
            {privateLane
              ? "This view belongs to your private thread."
              : `Shared with ${lane?.lane.audience.length} current members.`}{" "}
            Calendars and mail are not connected.
          </p>
        </aside>
      </div>
    </>
  );
}
