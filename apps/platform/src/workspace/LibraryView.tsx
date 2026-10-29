import { ArrowUpRight, BookOpen, FileText, Plus, Search } from "lucide-react";
import { DuetCard } from "../components/duet/kit";

import { Empty } from "./shared";
import { useWorkspace } from "./state";

export function LibraryView() {
  const {
    session,
    page,
    setError,
    busy,
    artifacts,
    uploadedText,
    setUploadedText,
    query,
    setQuery,
    hits,
    setHits,
    setDetail,
    setShowDoc,
    setDocTitle,
    setDocContent,
    setDocSources,
    api,
    accept,
    refresh,
    run,
    privateLane,
  } = useWorkspace();
  if (!session) return null;
  return (
    <>
      <>
        <div className="page-heading">
          <div>
            <h1>Library</h1>
            <p>
              Original sources, useful documents, and the evidence behind your
              work.
            </p>
          </div>
          <button
            className="primary"
            onClick={() => {
              setDocTitle("");
              setDocContent("");
              setDocSources([]);
              setShowDoc(true);
            }}
          >
            <Plus size={16} />
            New document
          </button>
        </div>
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () =>
              setHits(
                await api(`kernel/search?query=${encodeURIComponent(query)}`),
              ),
            );
          }}
        >
          <Search size={18} />
          <input
            aria-label="Search Library"
            placeholder="Find something in your Library…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="secondary" disabled={busy || !query.trim()}>
            Search
          </button>
        </form>
        {hits.length > 0 && (
          <div className="search-results">
            {hits.map((h) => (
              <button
                key={h.block_id}
                onClick={() =>
                  void run(async () =>
                    setDetail(await api(`kernel/artifact?id=${h.artifact_id}`)),
                  )
                }
              >
                <strong>{h.title}</strong>
                <p>{h.text}</p>
              </button>
            ))}
          </div>
        )}
        <div className="section-title">
          <h2>Your sources & documents</h2>
          <span>{artifacts.length} items visible here</span>
        </div>
        <DuetCard>
          {artifacts.length ? (
            artifacts.map((a) => (
              <button
                className="library-row"
                key={a.id}
                onClick={() =>
                  void run(async () =>
                    setDetail(await api(`kernel/artifact?id=${a.id}`)),
                  )
                }
              >
                <span className="file-icon">
                  <FileText size={20} />
                </span>
                <span>
                  <strong>{a.title}</strong>
                  <small>
                    {a.visibility === "private" ? "Private" : "Community"} ·{" "}
                    {a.bytes.toLocaleString()} bytes · Original preserved
                  </small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))
          ) : (
            <Empty
              icon={<BookOpen size={28} />}
              title="Make room for what you know."
            >
              Add a source below, or create a document. Sources become
              searchable only where they’re eligible.
            </Empty>
          )}
        </DuetCard>
        <DuetCard className="settings-card">
          <h2>Bring in a source</h2>
          <p>
            Add UTF-8 text or Markdown. Original bytes are kept locally, with a
            SHA-256 fingerprint.
          </p>
          <form
            className="source-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fields = new FormData(form);
              void run(async () => {
                await api("kernel/ingest", {
                  title: fields.get("title"),
                  content: uploadedText ?? fields.get("content"),
                  visibility: privateLane ? "private" : "institution",
                  purpose: "knowledge",
                  provenance: "Aksara Library · manual text input",
                });
                form.reset();
                setUploadedText(null);
                await refresh();
              });
            }}
          >
            <input
              name="title"
              aria-label="Source title"
              placeholder="Source title"
              required
              maxLength={256}
            />
            <textarea
              name="content"
              aria-label="Source content"
              onChange={() => setUploadedText(null)}
              placeholder="Paste the original text…"
              required
              maxLength={1000000}
            />
            <div className="form-footer">
              <label className="file-upload">
                Or choose .txt / .md
                <input
                  type="file"
                  accept="text/plain,text/markdown,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1048576) {
                      setError("Maximum source size is 1 MiB");
                      return;
                    }
                    const form = e.currentTarget.form!;
                    void file
                      .arrayBuffer()
                      .then((bytes) =>
                        new TextDecoder("utf-8", {
                          fatal: true,
                          ignoreBOM: true,
                        }).decode(bytes),
                      )
                      .then((text) => {
                        (
                          form.elements.namedItem("title") as HTMLInputElement
                        ).value = file.name;
                        (
                          form.elements.namedItem(
                            "content",
                          ) as HTMLTextAreaElement
                        ).value = text;
                        setUploadedText(text);
                      })
                      .catch(() =>
                        setError("This file is not valid UTF-8 text."),
                      );
                  }}
                />
              </label>
              <button className="primary" disabled={busy}>
                Add source
              </button>
            </div>
          </form>
        </DuetCard>
      </>
    </>
  );
}
