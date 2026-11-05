import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, ShieldCheck, Volume2, X } from "lucide-react";
import { OutcomePill } from "../components/duet/kit";
import { WorkspacePane } from "../components/octopus/WorkspacePane";
import {
  ExpandableScreen,
  ExpandableScreenContent,
} from "../components/ui/expandable-screen";
import { PREVIEW } from "../transport";
import { lazy, Suspense } from "react";
const BlockEditor = lazy(() =>
  import("./BlockEditor").then((m) => ({ default: m.BlockEditor })),
);

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
                    <h3>
                      {e.prepared.capability === "artifact.create"
                        ? "Create this document"
                        : e.prepared.capability}
                    </h3>
                    {e.prepared.capability === "artifact.create" &&
                    !e.args.redacted ? (
                      <div className="review-document">
                        <p>
                          {e.args.visibility === "private"
                            ? "Only you"
                            : "Institution Library · eligible institutional members"}{" "}
                          · {e.args.source_ids?.length || 0} linked sources
                        </p>
                        <h4>{e.args.title}</h4>
                        <Suspense fallback={<pre>{e.args.content}</pre>}>
                          <BlockEditor
                            key={e.prepared.args_hash}
                            content={e.args.content}
                            title={e.args.title}
                            readOnly
                          />
                        </Suspense>
                      </div>
                    ) : null}
                    <details>
                      <summary>
                        Exact proposal details · {e.prepared.status}
                      </summary>
                      <pre>{JSON.stringify(e.args, null, 2)}</pre>
                    </details>
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
                            ? "This version is approved"
                            : PREVIEW
                              ? "Try sample approval"
                              : e.prepared.capability === "artifact.create"
                                ? "Approve this document"
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
                            : e.prepared.capability === "artifact.create"
                              ? "Save approved document"
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
    </>
  );
}
