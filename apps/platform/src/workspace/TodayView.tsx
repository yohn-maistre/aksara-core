import { WorkIsland } from "./WorkIsland";
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
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, lazy, Suspense, useState, type ReactNode } from "react";
import { Expandable, ExpandableContent } from "../components/ui/expandable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { PREVIEW } from "../transport";
import { ActivityCalendar } from "./ActivityCalendar";
import { shortDate, stateWord, type Work } from "./shared";
import { useWorkspace } from "./state";
const MessageBody = lazy(() =>
  import("../surfaces").then((m) => ({ default: m.MessageBody })),
);
function WorkSection({
  title,
  items,
  historical = false,
}: {
  title: string;
  items: Work[];
  historical?: boolean;
}) {
  const { openWork } = useWorkspace();
  const [expanded, setExpanded] = useState(true);
  if (!items.length) return null;
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
        <h3>
          {title}
          <span>{items.length}</span>
        </h3>
        <ChevronDown
          size={15}
          style={{ transform: expanded ? "none" : "rotate(-90deg)" }}
        />
      </button>
      <ExpandableContent>
        {items.map((w) => (
          <button
            key={w.id}
            className={`work-row state-${w.state.toLowerCase()}`}
            disabled={historical}
            aria-label={`${w.state === "AWAITING_APPROVAL" ? "Review" : "Open"} ${w.request}`}
            onClick={() => void openWork(w)}
          >
            <span className="work-state-icon">
              {w.state === "COMPLETED" ? (
                <Check size={16} />
              ) : w.state === "AWAITING_APPROVAL" ? (
                <LockKeyhole size={15} />
              ) : (
                <Circle size={14} />
              )}
            </span>
            <span>
              <strong>{w.request}</strong>
              <small>{stateWord(w.state)}</small>
            </span>
            {!historical && <ArrowUpRight size={14} />}
          </button>
        ))}
      </ExpandableContent>
    </Expandable>
  );
}
/** Same Home component contracts into the margin; scope changes remount it. */
export function TodayView({
  compact = false,
  composer,
  onSettled,
}: {
  compact?: boolean;
  composer?: ReactNode;
  onSettled?: () => void;
}) {
  const {
    session,
    privateLane,
    at,
    setAt,
    visibleWorks,
    working,
    artifacts,
    memories,
    navigate,
    setShowDoc,
    api,
    setDetail,
    run,
    needs,
    messages,
    pinnedReplies,
    setPinnedReplies,
    homeReplyAfter,
    setHomeReplyAfter,
  } = useWorkspace();
  const [panels, setPanels] = useState(["activity", "work", "library"]);
  const [wide, setWide] = useState(
    () => window.matchMedia("(min-width: 1101px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1101px)");
    const update = () => setWide(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (!session) return null;
  const eligibleMemories = memories.filter((m) =>
    artifacts.some((a) => a.id === m.source_artifact_id),
  );
  const homeReply =
    homeReplyAfter === null
      ? undefined
      : [...messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.seq > homeReplyAfter);
  const Heading = compact ? "h2" : "h1";
  const openThread = () => navigate(privateLane ? "Ask" : "Conversation");
  return (
    <motion.section
      layout="position"
      onLayoutAnimationComplete={onSettled}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="home-surface"
      data-compact={compact}
      aria-label="Home"
    >
      <div className="home-intro">
        <span className="home-label">Home</span>
        <p className="home-date">{shortDate(new Date())}</p>
        <Heading>
          {at ? (
            "A look back."
          ) : (
            <>
              Room for
              <br />
              <span>what matters.</span>
            </>
          )}
        </Heading>
        {!at && (
          <button className="text-button home-continue" onClick={openThread}>
            Continue our conversation <ArrowUpRight size={15} />
          </button>
        )}
        {!PREVIEW &&
          !localStorage.getItem(`aksara-setup:${session.profile.id}`) && (
            <button
              className="text-button home-setup"
              onClick={() => navigate("Setup")}
            >
              Connect a model <ArrowUpRight size={14} />
            </button>
          )}
      </div>
      {!compact && !at && composer && (
        <div className="home-composer">{composer}</div>
      )}
      {!compact && !at && homeReply && (
        <section className="home-reply-bubble" aria-label="Latest Home reply">
          <p>
            {homeReply.text.split("```", 1)[0].trim().slice(0, 240) ||
              "Your reply is ready to review."}
          </p>
          <button className="text-button" onClick={openThread}>
            Open conversation <ArrowUpRight size={14} />
          </button>
          <button
            className="icon-button"
            aria-label="Dismiss Home reply"
            onClick={() => setHomeReplyAfter(null)}
          >
            <X size={14} />
          </button>
        </section>
      )}
      {!compact && !at && <WorkIsland />}
      <div className="home-panels">
        {!at &&
          (!compact || wide) &&
          pinnedReplies.map((seq) => {
            const reply = messages.find(
              (m) => m.seq === seq && m.role === "assistant",
            );
            return reply ? (
              <section
                className="home-pinned-panel"
                key={seq}
                aria-label="Pinned reply"
              >
                <div className="home-panel-heading">
                  <h2>From our conversation</h2>
                  <button
                    className="icon-button"
                    aria-label="Unpin reply from Home"
                    onClick={() =>
                      setPinnedReplies((ids) => ids.filter((id) => id !== seq))
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

        {panels.includes("activity") && <ActivityCalendar />}
        {(panels.includes("work") || at) && (
          <section className="home-work-panel" aria-label="Your work">
            <div className="home-panel-heading">
              <h2>{at ? "Recorded work" : "Your work"}</h2>
              <label className="date-picker">
                <History size={14} />
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
                Recorded work states only. Past content is not reconstructed.
              </p>
            )}
            {at && !visibleWorks.length ? (
              <h3 className="history-empty">No recorded work for this date</h3>
            ) : (
              <>
                <WorkSection
                  title="Needs you"
                  items={visibleWorks.filter((w: Work) =>
                    ["AWAITING_APPROVAL", "NEEDS_INPUT"].includes(w.state),
                  )}
                  historical={!!at}
                />
                <WorkSection
                  title="Moving along"
                  items={visibleWorks.filter((w: Work) =>
                    ["HEARD", "WORKING"].includes(w.state),
                  )}
                  historical={!!at}
                />
                <WorkSection
                  title="Recently settled"
                  items={visibleWorks
                    .filter((w: Work) =>
                      ["COMPLETED", "FAILED", "CANCELLED"].includes(w.state),
                    )
                    .slice(0, 3)}
                  historical={!!at}
                />
                {!visibleWorks.length && (
                  <p className="panel-empty">
                    A little room for your next idea.
                  </p>
                )}
              </>
            )}
          </section>
        )}
        {panels.includes("library") && !at && (
          <section className="home-library-panel">
            <div className="home-panel-heading">
              <h2>
                <BookOpen size={17} />
                Your Library
              </h2>
              <button
                className="icon-button"
                aria-label="Open Library"
                onClick={() => navigate("Library")}
              >
                <ArrowUpRight size={17} />
              </button>
            </div>
            {artifacts.slice(0, compact ? 1 : 2).map((a) => (
              <button
                key={a.id}
                className="artifact-glance"
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
                <FileText size={20} />
                <span>
                  {a.title}
                  <small>
                    {a.visibility === "private" ? "Private" : "Community"}
                  </small>
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
            {!artifacts.length && (
              <p className="panel-empty">
                Sources, notes and things worth keeping.
              </p>
            )}
            <button
              className="text-button"
              onClick={() => {
                setShowDoc(true);
              }}
            >
              Create a document <Plus size={14} />
            </button>
          </section>
        )}
        {panels.includes("knowledge") && !at && (
          <section className="home-knowledge-panel">
            <h2>Reviewed knowledge</h2>
            {eligibleMemories.length ? (
              <p>
                {eligibleMemories.length} approved{" "}
                {eligibleMemories.length === 1 ? "excerpt" : "excerpts"} to
                build on.
              </p>
            ) : (
              <p className="panel-empty">Keep useful knowledge close.</p>
            )}
            <button className="text-button" onClick={() => navigate("Library")}>
              Explore knowledge <ArrowUpRight size={14} />
            </button>
          </section>
        )}
      </div>
      {!at && (
        <DropdownMenu>
          <DropdownMenuTrigger className="text-button home-add">
            <Plus size={16} />
            Add panel
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="workspace-context-menu">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Home panels</DropdownMenuLabel>
              {[
                ["activity", "Recorded activity"],
                ["work", "Your work"],
                ["library", "Library glance"],
                ["knowledge", "Reviewed knowledge"],
              ].map(([id, label]) => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={panels.includes(id)}
                  onCheckedChange={(checked) =>
                    setPanels((v) =>
                      checked ? [...v, id] : v.filter((p) => p !== id),
                    )
                  }
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <span className="sr-only">
        {working.length
          ? `${working.length} work items in progress`
          : `${needs.length} work items need you`}
      </span>
    </motion.section>
  );
}
