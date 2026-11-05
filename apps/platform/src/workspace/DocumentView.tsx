import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  FileText,
  LockKeyhole,
  MessageCircle,
  Save,
  Sparkles,
  Users,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useWorkspace } from "./state";
import { useWorkingSurface } from "./useWorkingSurface";
import { FilePreview } from "./FilePreview";
import type { Data } from "./shared";
import { PREVIEW } from "../transport";
const BlockEditor = lazy(() =>
  import("./BlockEditor").then((m) => ({ default: m.BlockEditor })),
);

export function DocumentView() {
  const [draftId] = useState(() => `page_${crypto.randomUUID()}`);
  const w = useWorkspace();
  const {
    activeEntry,
    detail,
    showDoc,
    session,
    navigate,
    setDetail,
    setShowDoc,
    setDocTitle,
    setDocContent,
    setDocSources,
    docTitle,
    docContent,
    docSources,
  } = w;
  const isText =
    detail &&
    typeof detail.content === "string" &&
    (!detail.artifact.media_type ||
      ["text/plain", "text/markdown"].includes(detail.artifact.media_type));
  if (detail)
    return (
      <div className="document-plane">
        <header className="document-topbar">
          <button
            className="text-button"
            aria-label="Back to Library"
            onClick={() => {
              setDetail(null);
              navigate("Library");
            }}
          >
            <ArrowLeft size={16} />
            Library
          </button>
          <RoomReturn />
          <span>
            {detail.artifact.visibility === "private"
              ? "Only you"
              : "Community source"}
          </span>
          {isText && !PREVIEW && (
            <button
              className="text-button"
              onClick={() =>
                void w.run(async () => {
                  const context = w.scope.current;
                  const original = await w.api(
                    `kernel/file?id=${encodeURIComponent(detail.artifact.id)}`,
                  );
                  if (w.scope.current !== context) return;
                  const bytes = Uint8Array.from(
                    atob(original.content_base64),
                    (c) => c.charCodeAt(0),
                  );
                  const url = URL.createObjectURL(
                    new Blob([bytes], { type: "application/octet-stream" }),
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = detail.artifact.title.replace(
                    /[\\/:*?"<>|]/g,
                    "_",
                  );
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                })
              }
            >
              Download original
            </button>
          )}
          {isText && (
            <button
              className="secondary"
              onClick={() => {
                setDocTitle(detail.artifact.title);
                setDocContent(detail.content);
                setDocSources([detail.artifact.id]);
                setDetail(null);
                setShowDoc(true);
              }}
            >
              Edit a working copy <ArrowUpRight size={14} />
            </button>
          )}
        </header>
        <article className="reading-document">
          <h1>{detail.artifact.title}</h1>
          <p className="document-byline">
            Preserved source · {detail.artifact.owner}
          </p>
          {isText ? (
            <Suspense fallback={<p>Opening document…</p>}>
              <BlockEditor
                key={detail.artifact.id}
                content={detail.content}
                title={detail.artifact.title}
                readOnly
              />
            </Suspense>
          ) : (
            <FilePreview detail={detail} />
          )}
          <details className="source-fingerprint">
            <summary>Source details</summary>
            <p>Original bytes preserved. SHA-256 {detail.artifact.sha256}</p>
          </details>
          <div className="document-source-actions">
            <button
              className="text-button"
              onClick={() =>
                void w.run(async () => {
                  await w.api("kernel/memory-candidate", {
                    text: Array.from(detail.content || "")
                      .slice(0, 300)
                      .join(""),
                    source_artifact_id: detail.artifact.id,
                    visibility: detail.artifact.visibility,
                    purpose: "knowledge",
                    kind: "semantic",
                    evidence_kind: "source_fact",
                    retention_seconds: 604800,
                  });
                  await w.refresh();
                })
              }
              disabled={!isText}
            >
              Propose evidence for memory
            </button>
            <button
              className="text-button danger"
              disabled={w.me.id !== detail.artifact.owner}
              onClick={() =>
                void w.run(async () => {
                  await w.api("kernel/withdraw", { id: detail.artifact.id });
                  setDetail(null);
                  navigate("Library");
                  await w.refresh();
                })
              }
            >
              Withdraw source
            </button>
          </div>
        </article>
      </div>
    );
  if (!activeEntry && !showDoc)
    return (
      <div className="empty">
        <FileText />
        <h2>Open a document from Library.</h2>
        <button onClick={() => navigate("Library")}>Go to Library</button>
      </div>
    );
  const initial = activeEntry || {
    id: draftId,
    revision: 0,
    kind: "document",
    title: docTitle || "Untitled document",
    content: docContent,
    body: [],
    source_ids: docSources,
  };
  return (
    <WorkingDocument
      key={`${session?.scope}:${initial.id}`}
      initial={initial}
    />
  );
}

function WorkingDocument({ initial }: { initial: Data }) {
  const w = useWorkspace();
  const { value, change, replace, flush, status, problem, revision } =
    useWorkingSurface(initial);
  const [selection, setSelection] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);
  const [reloading, setReloading] = useState(false);
  const snapshot = async () => {
    await flush();
    return w.api("kernel/workspace-snapshot", {
      id: value.id,
      revision: revision.current,
    });
  };
  const help = () =>
    void w.run(async () => {
      const source = await snapshot();
      await w.refresh();
      w.setAttached([source.id]);
      w.setDraft(
        selection
          ? `Help me with this passage from “${value.title}”:\n\n${selection}\n\n`
          : `Help us improve “${value.title}”. Read the attached working snapshot and suggest the next useful change.`,
      );
      w.navigate(w.privateLane ? "Ask" : "Conversation");
    });
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([value.content], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${value.title.replace(/[\\/:*?"<>|]/g, "_")}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="document-plane">
      <header className="document-topbar">
        <button
          className="text-button"
          aria-label="Back to Library"
          onClick={() => w.navigate("Library")}
        >
          <ArrowLeft size={16} />
          Library
        </button>
        <RoomReturn />
        <span className="document-save" role="status">
          {status === "Saved" ? <Check size={14} /> : <Save size={14} />}{" "}
          {status}
        </span>
        <button
          className="icon-button"
          title="Download Markdown"
          aria-label="Download Markdown"
          onClick={download}
        >
          <Download size={17} />
        </button>
        <button
          className="secondary"
          disabled={w.busy}
          onClick={() => void w.run(flush)}
        >
          Save draft
        </button>
      </header>
      {problem && (
        <div role="alert" className="draft-problem">
          <p>
            {problem} Download your unsaved text before loading the saved
            version.
          </p>
          <button
            className="secondary"
            disabled={reloading}
            onClick={() =>
              void w.run(async () => {
                setReloading(true);
                try {
                  const current = await w.api(
                    `kernel/workspace-entry?id=${encodeURIComponent(value.id)}`,
                  );
                  replace(current);
                  setEditorVersion((v) => v + 1);
                } finally {
                  setReloading(false);
                }
              })
            }
          >
            Load saved version
          </button>
          <button className="text-button" onClick={download}>
            Download my unsaved text
          </button>
        </div>
      )}
      <article className="reading-document">
        <input
          className="document-title-input"
          aria-label="Document title"
          value={value.title}
          maxLength={256}
          placeholder="Untitled document"
          onChange={(e) => {
            const title = e.target.value;
            const prefix = `# ${value.title}\n`;
            change({
              title,
              content: value.content.startsWith(prefix)
                ? `# ${title}\n${value.content.slice(prefix.length)}`
                : value.content,
            });
          }}
        />
        <div className="document-byline">
          {w.privateLane ? <LockKeyhole size={13} /> : <Users size={13} />}{" "}
          {w.privateLane ? "Only you" : `Working draft · ${w.lane?.name}`}
          <span>{PREVIEW ? "Tab-only sample" : "Autosave on this host"}</span>
        </div>
        <Suspense fallback={<p role="status">Opening the writing desk…</p>}>
          <BlockEditor
            key={`${value.id}:${editorVersion}`}
            content={value.content}
            title={value.title}
            blocks={value.body}
            onSelection={setSelection}
            onChange={(body, content) => change({ body, content })}
          />
        </Suspense>
      </article>
      <footer className="document-bottom">
        <button
          className="text-button"
          onClick={help}
          disabled={w.busy || !value.content.trim()}
        >
          <Sparkles size={16} />
          {selection ? "Help with selection" : "Aksara, help here"}
        </button>
        <span>
          {value.source_ids.length
            ? `${value.source_ids.length} linked sources`
            : "Original working draft"}
        </span>
        <button
          className="primary"
          disabled={w.busy || !value.content.trim() || !value.title.trim()}
          onClick={() =>
            void w.run(async () => {
              const source = await snapshot();
              await w.refresh();
              w.setActiveEntry({ ...value, revision: revision.current });
              await w.prepareDocument(value.title, value.content, [source.id]);
            })
          }
        >
          Prepare for review <ArrowUpRight size={15} />
        </button>
      </footer>
    </div>
  );
}

function RoomReturn() {
  const w = useWorkspace();
  return (
    <button
      className="text-button document-room-return"
      aria-label="Back to conversation"
      title="Back to conversation"
      onClick={() => w.navigate(w.privateLane ? "Ask" : "Conversation")}
    >
      <MessageCircle size={17} />
      {w.privateLane ? "Your conversation" : w.lane?.name || "Conversation"}
    </button>
  );
}
