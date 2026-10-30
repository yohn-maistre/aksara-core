import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, ShieldCheck, Volume2, X } from "lucide-react";
import { OutcomePill } from "../components/duet/kit";
import { WorkspacePane } from "../components/octopus/WorkspacePane";
import {
  ExpandableScreen,
  ExpandableScreenContent,
} from "../components/ui/expandable-screen";
import { PREVIEW } from "../transport";

import { stateWord } from "./shared";
import { useWorkspace } from "./state";
import { FilePreview } from "./FilePreview";

export function WorkspaceOverlays() {
  const {
    session,
    page,
    setError,
    busy,
    audioRef,
    audioSeq,
    stopAudio,
    me,
    model,
    detail,
    setDetail,
    selected,
    setSelected,
    effects,
    approved,
    setApproved,
    showDoc,
    setShowDoc,
    docTitle,
    setDocTitle,
    docContent,
    setDocContent,
    docSources,
    setDocSources,
    device,
    api,
    refresh,
    run,
    openWork,
    proposeDoc,
    artifacts,
  } = useWorkspace();
  if (!session) return null;
  return (
    <>
      {" "}
      {audioSeq !== null && (
        <aside className="voice-player" aria-label="Local read-aloud controls">
          <Volume2 size={17} />
          <span>Local read-aloud</span>
          <button
            onClick={() =>
              void audioRef.current
                ?.play()
                .catch(() => setError("Tap Play again to start audio."))
            }
          >
            Play
          </button>
          <button onClick={stopAudio}>Stop</button>
        </aside>
      )}
      <ExpandableScreen
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <ExpandableScreenContent className="dialog">
            <Dialog.Title>Work & review</Dialog.Title>
            <Dialog.Close className="dialog-close" aria-label="Close work">
              <X size={20} />
            </Dialog.Close>
            {selected && (
              <>
                <p>{selected.request}</p>
                <OutcomePill
                  tone={selected.state === "COMPLETED" ? "green" : "neutral"}
                  icon={null}
                >
                  {stateWord(selected.state)}
                </OutcomePill>
                {effects.map((e) => (
                  <section className="effect-review" key={e.prepared.id}>
                    <h3>{e.prepared.capability}</h3>
                    <p>Exact proposed arguments · {e.prepared.status}</p>
                    <pre>{JSON.stringify(e.args, null, 2)}</pre>
                    {e.receipt ? (
                      <div className="notice">
                        <ShieldCheck size={18} />
                        {PREVIEW ? "Preview result:" : "Receipt:"}{" "}
                        {e.receipt.outcome} ·{" "}
                        {e.receipt.verified_sha256?.slice(0, 16)}
                      </div>
                    ) : (
                      <div className="review-actions">
                        <button
                          className="secondary"
                          disabled={
                            busy ||
                            me.role !== "operator" ||
                            e.args.redacted ||
                            !["PREPARED", "APPROVED"].includes(
                              e.prepared.status,
                            )
                          }
                          onClick={() =>
                            void run(async () => {
                              const a = await api("kernel/approve", {
                                id: e.prepared.id,
                                args_hash: e.prepared.args_hash,
                              });
                              setApproved((v) => ({
                                ...v,
                                [e.prepared.id]: a,
                              }));
                            })
                          }
                        >
                          {approved[e.prepared.id]
                            ? "Approved for exact arguments"
                            : PREVIEW
                              ? "Try sample approval"
                              : "Approve exact proposal"}
                        </button>
                        <button
                          className="primary"
                          disabled={busy || !approved[e.prepared.id]}
                          onClick={() =>
                            void run(async () => {
                              const a = approved[e.prepared.id];
                              await api(
                                `kernel/${e.prepared.capability === "device.indicate" ? "device-execute" : "execute"}`,
                                { id: a.id, lease: a.lease },
                              );
                              await refresh();
                              await openWork(selected);
                            })
                          }
                        >
                          {PREVIEW
                            ? "Create sample document"
                            : "Execute approved effect"}
                        </button>
                      </div>
                    )}
                    {me.role !== "operator" && !e.receipt && (
                      <p className="muted">
                        An Operator must review this proposal in the same
                        eligible context.
                      </p>
                    )}
                  </section>
                ))}
                {!effects.length && (
                  <p className="muted">
                    No effect has been proposed for this thread.
                  </p>
                )}
                <button
                  className="text-button"
                  onClick={() =>
                    void run(async () => {
                      try {
                        await api("kernel/model-interrupt", {
                          work_id: selected.id,
                        });
                      } catch {
                        await api("kernel/cancel", { id: selected.id });
                      }
                      setSelected(null);
                      await refresh();
                    })
                  }
                >
                  Cancel / interrupt this work
                </button>
              </>
            )}
          </ExpandableScreenContent>
        </Dialog.Portal>
      </ExpandableScreen>
      <ExpandableScreen
        open={!!detail}
        onOpenChange={(v) => {
          if (!v) setDetail(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <ExpandableScreenContent className="dialog">
            <Dialog.Title>{detail?.artifact.title}</Dialog.Title>
            <Dialog.Close className="dialog-close" aria-label="Close document">
              <X size={20} />
            </Dialog.Close>
            {detail && (
              <>
                <p className="fingerprint">SHA-256 {detail.artifact.sha256}</p>
                <FilePreview detail={detail} key={`${session.scope}:${detail.artifact.id}`} />
                <div className="review-actions">
                  <button
                    className="secondary"
                    disabled={typeof detail.content !== "string"}
                    onClick={() => {
                      setDocSources([detail.artifact.id]);
                      setDocTitle(`Notes on ${detail.artifact.title}`);
                      setDocContent(detail.content);
                      setDetail(null);
                      setShowDoc(true);
                    }}
                  >
                    Draft from this source
                  </button>
                  <button
                    className="secondary"
                    disabled={typeof detail.content !== "string"}
                    onClick={() =>
                      void run(async () => {
                        await api("kernel/memory-candidate", {
                          text: Array.from(detail.content as string)
                            .slice(0, 300)
                            .join(""),
                          source_artifact_id: detail.artifact.id,
                          visibility: detail.artifact.visibility,
                          purpose: "knowledge",
                          kind: "semantic",
                          evidence_kind: "source_fact",
                          retention_seconds: 604800,
                        });
                        setDetail(null);
                        await refresh();
                      })
                    }
                  >
                    Propose evidence for memory
                  </button>
                  <button
                    className="text-button danger"
                    disabled={me.id !== detail.artifact.owner}
                    onClick={() =>
                      void run(async () => {
                        await api("kernel/withdraw", {
                          id: detail.artifact.id,
                        });
                        setDetail(null);
                        await refresh();
                      })
                    }
                  >
                    Withdraw source
                  </button>
                </div>
              </>
            )}
          </ExpandableScreenContent>
        </Dialog.Portal>
      </ExpandableScreen>
      <ExpandableScreen open={showDoc} onOpenChange={setShowDoc}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <ExpandableScreenContent className="dialog">
            <Dialog.Title>Give an idea a page</Dialog.Title>
            <Dialog.Description>
              Draft locally, review the exact content, then approve its creation
              in this context.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Close editor">
              <X size={20} />
            </Dialog.Close>
            <WorkspacePane
              label="Document context"
              primary={
                <>
                  {" "}
                  <form className="source-form" onSubmit={proposeDoc}>
                    <input
                      aria-label="Document title"
                      placeholder="Untitled document"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      required
                      maxLength={256}
                    />
                    <textarea
                      className="editor"
                      aria-label="Document content"
                      placeholder="A beginning, in your own words…"
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      required
                      maxLength={500000}
                    />
                    {docSources.length > 0 && (
                      <p>
                        Linked to {docSources.length} eligible source. Its
                        restrictions follow this document.
                      </p>
                    )}
                    <button className="primary" disabled={busy}>
                      Prepare for review <ArrowUpRight size={15} />
                    </button>
                  </form>
                </>
              }
              secondary={
                <div className="document-context">
                  <h3>In this draft</h3>
                  <p>
                    Local editing · {docContent.length.toLocaleString()}{" "}
                    characters
                  </p>
                  <h3>Source trail</h3>
                  {docSources.length ? (
                    docSources.map((id) => (
                      <p key={id}>
                        {artifacts.find((a) => a.id === id)?.title ||
                          "Source unavailable"}
                      </p>
                    ))
                  ) : (
                    <p>No Library sources attached.</p>
                  )}
                  <p>
                    Source restrictions follow derived documents. Creating this
                    page still needs your exact review.
                  </p>
                </div>
              }
            />
          </ExpandableScreenContent>
        </Dialog.Portal>
      </ExpandableScreen>
    </>
  );
}
