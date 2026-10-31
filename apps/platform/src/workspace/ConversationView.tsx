import {
  ArrowUpRight,
  LockKeyhole,
  MoreHorizontal,
  Sprout,
  Volume2,
  Users,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { PREVIEW } from "../transport";
const MessageBody = lazy(() =>
  import("../surfaces").then((m) => ({ default: m.MessageBody })),
);

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { WorkActivity } from "./WorkActivity";
import {
  SpeechBubbleRoot,
  SpeechBubbleBody,
  SpeechBubbleText,
} from "../components/ui/speech-bubble";
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
    foregroundWorking,
    pinnedReplies,
    setPinnedReplies,
  } = useWorkspace();
  const [showWork, setShowWork] = useState(false);
  if (!session) return null;
  return (
    <>
      <>
        <div className="page-heading chat-heading">
          <h1>{privateLane ? "Private thread" : lane?.name}</h1>
          <span className="privacy-chip">
            {privateLane ? <LockKeyhole size={14} /> : <Users size={14} />}
            {privateLane ? "Only you" : `${lane?.lane.audience.length} members`}
          </span>
          <button
            className="thread-work-toggle"
            aria-pressed={showWork}
            onClick={() => setShowWork(!showWork)}
          >
            {showWork ? "Conversation" : "Activity"}
          </button>
        </div>
        <div className="thread-layout" data-show-work={showWork}>
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
                        ? m.run.kind === "background"
                          ? "Aksara · task result"
                          : "Aksara"
                        : m.run.owner === me.id
                          ? m.run.kind === "background"
                            ? "Background task"
                            : "You"
                          : "Member"}
                      <small>
                        {m.run.provider === "preview"
                          ? "preview"
                          : m.run.provider === "local"
                            ? "local"
                            : "hosted"}
                      </small>
                    </span>
                    <SpeechBubbleRoot className="chat-bubble">
                      <SpeechBubbleBody>
                        <SpeechBubbleText>
                          <Suspense
                            fallback={<p className="message-text">{m.text}</p>}
                          >
                            <MessageBody text={m.text} />
                          </Suspense>
                        </SpeechBubbleText>
                      </SpeechBubbleBody>
                    </SpeechBubbleRoot>
                    {m.role === "assistant" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="message-menu-trigger icon-button"
                          aria-label="Message actions"
                        >
                          <MoreHorizontal size={17} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="workspace-context-menu"
                        >
                          {providers.voice?.configured && (
                            <DropdownMenuItem
                              disabled={busy}
                              onClick={() => void speak(m.seq)}
                            >
                              <Volume2 size={15} />
                              Read aloud locally
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            disabled={
                              !pinnedReplies.includes(m.seq) &&
                              pinnedReplies.length >= 4
                            }
                            onClick={() =>
                              setPinnedReplies((current) =>
                                current.includes(m.seq)
                                  ? current.filter((seq) => seq !== m.seq)
                                  : current.length < 4
                                    ? [...current, m.seq]
                                    : current,
                              )
                            }
                          >
                            {pinnedReplies.includes(m.seq)
                              ? "Unpin from Home"
                              : "Pin to Home"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDocTitle("Conversation note");
                              setDocContent(m.text);
                              setDocSources(m.run.source_ids || []);
                              setShowDoc(true);
                            }}
                          >
                            Turn into a document <ArrowUpRight size={14} />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </article>
              ))}
              {foregroundWorking.length > 0 && (
                <div className="turn-status">
                  <span className="typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>Working on this turn…</span>
                  <button
                    onClick={() =>
                      void run(async () => {
                        for (const w of foregroundWorking)
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
                  This turn was interrupted. Check your connection, then send a
                  new turn.
                </div>
              )}
            </div>
          </div>
          <WorkActivity />
        </div>
      </>
    </>
  );
}
