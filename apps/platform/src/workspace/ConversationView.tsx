import { ArrowUpRight, LockKeyhole, Sprout, Volume2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { PREVIEW } from "../transport";
const MessageBody = lazy(() =>
  import("../surfaces").then((m) => ({ default: m.MessageBody })),
);

import { Composer } from "./Composer";
import { Empty, Mark } from "./shared";
import { useWorkspace } from "./state";

export function ConversationView() {
  const {
    session,
    page,
    busy,
    works,
    messages,
    providers,
    me,
    draft,
    provider,
    model,
    setShowDoc,
    setDocTitle,
    setDocContent,
    setDocSources,
    api,
    refresh,
    speak,
    run,
    switchContext,
    send,
    lane,
    privateLane,
    working,
  } = useWorkspace();
  if (!session) return null;
  return (
    <>
      <>
        <div className="page-heading chat-heading">
          <h1>{privateLane ? "Private Ask" : lane?.name}</h1>
          <span className="privacy-chip">
            <LockKeyhole size={14} />
            {privateLane ? "Only you" : `${lane?.lane.audience.length} members`}
          </span>
        </div>
        {!privateLane && (
          <div className="notice">
            You’re in a shared Channel.{" "}
            <button
              onClick={() => {
                const l = session.lanes.find(
                  (l) => l.lane.audience.length === 1,
                );
                if (l) void switchContext(session.profile.id, l.lane.id);
              }}
            >
              Return to private Ask
            </button>
          </div>
        )}
        <div className="conversation">
          <div className="conversation-scroll">
            {messages.length >= 200 && (
              <p className="composer-note">
                Showing the latest 200 eligible messages. Earlier messages
                remain in canonical storage.
              </p>
            )}
            {!messages.length && (
              <Empty icon={<Mark />} title="Where shall we begin?">
                {PREVIEW
                  ? "Try a conversation with the guided UI demo."
                  : "Ask a question or work through an idea. Choose your model below."}
              </Empty>
            )}
            {messages.map((m) => (
              <article key={m.seq} className={`message ${m.role}`}>
                <span className="avatar">
                  {m.role === "assistant" ? (
                    <Sprout size={18} />
                  ) : m.run.owner === me.id ? (
                    session.profile.name[0]
                  ) : (
                    "M"
                  )}
                </span>
                <div>
                  <span className="message-label">
                    {m.role === "assistant"
                      ? "Aksara · model draft"
                      : m.run.owner === me.id
                        ? "You"
                        : "Member"}
                    <small>
                      {m.run.provider === "preview"
                        ? "preview"
                        : m.run.provider === "local"
                          ? "local"
                          : "hosted"}
                    </small>
                  </span>
                  <Suspense fallback={<p className="message-text">{m.text}</p>}>
                    <MessageBody text={m.text} />
                  </Suspense>
                  {m.role === "assistant" && providers.voice?.configured && (
                    <button
                      className="text-button voice-button"
                      disabled={busy}
                      onClick={() => void speak(m.seq)}
                    >
                      <Volume2 size={14} />
                      Read aloud locally
                    </button>
                  )}
                  {m.role === "assistant" && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setDocTitle("Conversation note");
                        setDocContent(m.text);
                        setDocSources(m.run.source_ids || []);
                        setShowDoc(true);
                      }}
                    >
                      Turn into a document <ArrowUpRight size={13} />
                    </button>
                  )}
                </div>
              </article>
            ))}
            {working.length > 0 && (
              <div className="turn-status">
                <span className="typing">
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  A turn is in progress. Results appear after the host accepts
                  them.
                </span>
                <button
                  onClick={() =>
                    void run(async () => {
                      for (const w of working)
                        await api("kernel/model-interrupt", {
                          work_id: w.id,
                        });
                      await refresh();
                    })
                  }
                >
                  Interrupt / recover
                </button>
              </div>
            )}
            {works[0]?.state === "FAILED" && (
              <div className="notice" role="status">
                The latest model turn did not produce an accepted reply. Check
                the local worker or hosted quota, then send a new turn when
                ready. No effect was performed.
              </div>
            )}
          </div>
          <Composer />
        </div>
      </>
    </>
  );
}
