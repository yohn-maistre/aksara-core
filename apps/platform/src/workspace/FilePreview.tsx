import { lazy, Suspense, useEffect, useState } from "react";
import { PREVIEW } from "../transport";
import type { Data } from "./shared";
import { useWorkspace } from "./state";
const SheetEditor = lazy(() =>
  import("./SheetEditor").then((m) => ({ default: m.SheetEditor })),
);
export function FilePreview({ detail }: { detail: Data }) {
  const {
    api,
    run,
    scope,
    setDocContent,
    setDocSources,
    setDocTitle,
    setDetail,
    setShowDoc,
  } = useWorkspace();
  const [file, setFile] = useState<Data | null>(null),
    [editing, setEditing] = useState(false);
  const artifact = detail.artifact,
    media =
      artifact.media_type ||
      (artifact.title.toLowerCase().endsWith(".csv")
        ? "text/csv"
        : "text/plain");
  useEffect(() => {
    let live = true;
    if (!PREVIEW && media.startsWith("image/"))
      void api(`kernel/file?id=${encodeURIComponent(artifact.id)}`)
        .then((value) => {
          if (live) setFile(value);
        })
        .catch(() => {});
    return () => {
      live = false;
    };
  }, [artifact.id, media, api]);
  const propose = (content: string) => {
    setDocContent(content);
    setDocTitle(`Revision of ${artifact.title}`);
    setDocSources([artifact.id]);
    setDetail(null);
    setShowDoc(true);
  };
  return (
    <div className="file-preview">
      <div className="file-toolbar">
        <span>
          {media} · {artifact.bytes.toLocaleString()} bytes
        </span>
        {!PREVIEW && (
          <button
            className="text-button"
            onClick={() =>
              void run(async () => {
                const context = scope.current,
                  value = await api(
                    `kernel/file?id=${encodeURIComponent(artifact.id)}`,
                  );
                if (scope.current !== context) return;
                const bytes = Uint8Array.from(atob(value.content_base64), (c) =>
                  c.charCodeAt(0),
                );
                const url = URL.createObjectURL(
                  new Blob([bytes], { type: "application/octet-stream" }),
                );
                const link = document.createElement("a");
                link.href = url;
                link.download = artifact.title.replace(/[\\/:*?"<>|]/g, "_");
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              })
            }
          >
            Download original
          </button>
        )}
        {typeof detail.content === "string" && (
          <button className="text-button" onClick={() => setEditing((v) => !v)}>
            {editing
              ? "Read original"
              : media === "text/csv"
                ? "Edit spreadsheet"
                : "Edit a draft"}
          </button>
        )}
      </div>
      {editing && media === "text/csv" ? (
        <Suspense fallback={<p role="status">Opening spreadsheet editor…</p>}>
          <SheetEditor
            content={detail.content}
            title={artifact.title}
            onPropose={propose}
          />
        </Suspense>
      ) : editing ? (
        <TextDraft content={detail.content} onPropose={propose} />
      ) : media.startsWith("image/") ? (
        file ? (
          <img
            className="original-image"
            src={`data:${media};base64,${file.content_base64}`}
            alt={artifact.title}
          />
        ) : (
          <p role="status">Loading eligible image…</p>
        )
      ) : typeof detail.content === "string" ? (
        <pre className="document-content">{detail.content}</pre>
      ) : (
        <p>
          This original is preserved for download. PDF rendering and Office
          conversion are not enabled in this build.
        </p>
      )}
    </div>
  );
}
function TextDraft({
  content,
  onPropose,
}: {
  content: string;
  onPropose: (value: string) => void;
}) {
  const [draft, setDraft] = useState(content);
  return (
    <div>
      <textarea
        className="file-text-editor"
        aria-label="File draft"
        maxLength={50000}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button
        className="secondary"
        disabled={!draft.trim() || draft === content}
        onClick={() => onPropose(draft)}
      >
        Review as a new document
      </button>
      <p className="composer-note">
        The original stays intact. Saving this proposal requires exact review
        and produces a new document linked to its source.
      </p>
    </div>
  );
}
