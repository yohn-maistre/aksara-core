import {
  ArrowDownUp,
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderOpen,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Empty } from "./shared";
import { LibraryUpload } from "./LibraryUpload";
import { useWorkspace } from "./state";
export function LibraryView() {
  const {
    session,
    setError,
    busy,
    artifacts,
    memories,
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
    refresh,
    run,
    privateLane,
  } = useWorkspace();
  const [importOpen, setImportOpen] = useState(false);
  const [collection, setCollection] = useState("all");
  const [sort, setSort] = useState("recent");
  const visibleIds = new Set(artifacts.map((a) => a.id));
  const knowledge = memories.filter((m) =>
    visibleIds.has(m.source_artifact_id),
  );
  const isDocument = (a: (typeof artifacts)[number]) =>
    a.provenance?.startsWith("effect:") || a.provenance === "governed artifact";
  const collectionFiles = artifacts.filter(
    (a) =>
      collection === "all" ||
      (collection === "documents" ? isDocument(a) : !isDocument(a)),
  );
  const collectionIds = new Set(collectionFiles.map((a) => a.id));
  const contentHits = hits.filter((h) => collectionIds.has(h.artifact_id));
  const files = collectionFiles.filter((a) =>
    a.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  if (sort === "name") files.sort((a, b) => a.title.localeCompare(b.title));
  if (!session) return null;
  const open = (id: string) =>
    void run(async () =>
      setDetail(await api(`kernel/artifact?id=${encodeURIComponent(id)}`)),
    );
  return (
    <>
      <div className="page-heading library-heading">
        <h1>Library</h1>
        <div className="library-actions">
          <LibraryUpload />
          <button
            className="text-button"
            onClick={() => {
              setDocTitle("");
              setDocContent("");
              setDocSources([]);
              setShowDoc(true);
            }}
          >
            New document <ArrowUpRight size={15} />
          </button>
          <button
            className="secondary"
            aria-label="Import source"
            onClick={() => setImportOpen(!importOpen)}
          >
            <Plus size={16} />
            Add source
          </button>
        </div>
      </div>
      <section className="knowledge-section" aria-label="Reviewed knowledge">
        <div className="section-title">
          <h2>Reviewed knowledge</h2>
          <span>
            {knowledge.length
              ? `${knowledge.length} ${knowledge.length === 1 ? "excerpt" : "excerpts"}`
              : "Build on what you know"}
          </span>
        </div>
        {knowledge.length ? (
          <div className="knowledge-grid">
            {knowledge.map((m) => (
              <button
                key={m.id}
                className="knowledge-card"
                onClick={() => open(m.source_artifact_id)}
              >
                <BookOpen size={19} />
                <h3>
                  {artifacts.find((a) => a.id === m.source_artifact_id)
                    ?.title || "Knowledge excerpt"}
                </h3>
                <p>{m.text}</p>
                <span>
                  Reviewed excerpt <ArrowUpRight size={14} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="knowledge-empty">
            <BookOpen size={21} />
            <span>Knowledge grows from reviewed sources.</span>
          </div>
        )}
      </section>
      <section className="file-explorer" aria-label="Files and documents">
        <div className="section-title">
          <h2>
            <FolderOpen size={18} />
            Files & documents
          </h2>
          <button
            className="text-button"
            aria-label="Change file sort"
            onClick={() => setSort(sort === "recent" ? "name" : "recent")}
          >
            <ArrowDownUp size={14} />
            {sort === "recent" ? "Recent" : "Name"}
          </button>
        </div>
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim())
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
            placeholder="Search your Library…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHits([]);
            }}
          />
          {query && (
            <button
              type="button"
              className="icon-button"
              aria-label="Clear Library search"
              onClick={() => {
                setQuery("");
                setHits([]);
              }}
            >
              <X size={16} />
            </button>
          )}
          <button className="text-button" disabled={busy || !query.trim()}>
            Search content
          </button>
        </form>
        <div className="collection-tabs" aria-label="File collections">
          {[
            ["all", "All files"],
            ["sources", "Sources"],
            ["documents", "Documents"],
          ].map(([id, title]) => (
            <button
              key={id}
              aria-pressed={collection === id}
              onClick={() => setCollection(id)}
            >
              {title}
            </button>
          ))}
        </div>
        {contentHits.length > 0 && (
          <div className="search-results">
            {contentHits.map((h) => (
              <button key={h.block_id} onClick={() => open(h.artifact_id)}>
                <strong>{h.title}</strong>
                <p>{h.text}</p>
              </button>
            ))}
          </div>
        )}
        {files.length ? (
          <div className="file-rows">
            {files.map((a) => (
              <button
                className="library-row"
                key={a.id}
                onClick={() => open(a.id)}
              >
                <FileText size={21} />
                <span>
                  <strong>{a.title}</strong>
                  <small>
                    {a.visibility === "private" ? "Private" : "Community"} ·{" "}
                    {isDocument(a) ? "Document" : "Source"}
                  </small>
                </span>
                <span className="file-size">
                  {a.bytes < 1024
                    ? `${a.bytes} B`
                    : `${(a.bytes / 1024).toFixed(1)} KB`}
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        ) : artifacts.length ? (
          !contentHits.length && (
            <p className="panel-empty">No files match this view.</p>
          )
        ) : (
          <Empty
            icon={<BookOpen size={26} />}
            title="Make room for what you know."
          >
            Add a source or create your first document.
          </Empty>
        )}
      </section>
      <details
        className="source-import"
        open={importOpen}
        onToggle={(e) => setImportOpen(e.currentTarget.open)}
      >
        <summary>
          Bring in a source <Plus size={15} />
        </summary>
        <p>UTF-8 text or Markdown · original bytes preserved.</p>
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
      </details>
    </>
  );
}
