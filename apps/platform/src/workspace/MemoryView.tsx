import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Search,
  RotateCw,
} from "lucide-react";
import { useWorkspace } from "./state";
import { ActionButton, AppInput } from "./controls";
export function MemoryView() {
  const w = useWorkspace();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const search = async (q = query) => {
    const seq = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const result = await w.api("memory/recall", { query: q, limit: 20 });
      if (seq === generation.current) setView(result);
    } catch (e) {
      if (seq === generation.current) {
        setView(null);
        setError((e as Error).message);
      }
    } finally {
      if (seq === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    void search("");
    return () => {
      generation.current++;
    };
  }, [w.session?.scope]);
  const results = (view?.results || []).filter(
    (r: any) => filter === "all" || r.kind === filter,
  );
  const labels: Record<string, string> = {
    reviewed: "Reviewed knowledge",
    wiki: "Wiki",
    person: "People",
    procedure: "Procedure",
    episode: "Episode",
    note: "Memory note",
  };
  return (
    <section className="memory-view" aria-label="Workspace knowledge">
      <div className="memory-intro">
        <BookOpen size={21} />
        <div>
          <h2>Knowledge that stays with the work.</h2>
          <p>
            Reviewed sources, working wiki pages and useful lessons, with their
            origins intact.
          </p>
        </div>
      </div>
      <form
        className="memory-search"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <AppInput
          aria-label="Search memory"
          placeholder="Ask a question or find a remembered detail…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ActionButton
          color="accent"
          disabled={loading}
          type="submit"
          startIcon={<Search size={15} />}
        >
          Search knowledge
        </ActionButton>
      </form>
      <div className="view-tabs" aria-label="Knowledge views">
        {[
          ["all", "All knowledge"],
          ["reviewed", "Reviewed"],
          ["wiki", "Wiki"],
          ["person", "People"],
          ["procedure", "Procedures"],
        ].map(([id, label]) => (
          <ActionButton
            variant={filter === id ? "soft" : "ghost"}
            color="neutral"
            aria-pressed={filter === id}
            key={id}
            onClick={() => setFilter(id)}
          >
            {label}
          </ActionButton>
        ))}
      </div>
      {error ? (
        <div className="empty" role="alert">
          <h3>Knowledge could not load.</h3>
          <p>{error}</p>
          <ActionButton variant="outline" onClick={() => void search()}>
            Try again
          </ActionButton>
        </div>
      ) : loading ? (
        <div className="loading-rows" role="status">
          Looking through eligible knowledge…
        </div>
      ) : results.length ? (
        <div className="knowledge-records">
          {results.map((r: any) => (
            <article className="knowledge-record" key={r.id}>
              <div>
                <span className="knowledge-kind">
                  {labels[r.kind] || "Working knowledge"}
                </span>
                <span className="status-chip">{r.review}</span>
              </div>
              <h3>
                {r.title.replace(/^(Wiki: |People: |Procedure draft: )/, "")}
              </h3>
              <p>{r.text}</p>
              <button
                className="text-button"
                onClick={() =>
                  void w.run(async () =>
                    w.setDetail(
                      await w.api(
                        `kernel/artifact?id=${encodeURIComponent(r.source_id)}`,
                      ),
                    ),
                  )
                }
              >
                Open original source <ArrowUpRight size={14} />
              </button>
              {r.truncated && (
                <small>
                  Excerpt shown. Open the original for the full source.
                </small>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <BookOpen size={26} />
          <h3>
            {query
              ? "No matching knowledge in this view."
              : "Useful knowledge starts with a source."}
          </h3>
          <p>
            {query
              ? "Try another question or search the Library's source content."
              : "Ask Aksara to save a wiki page or a useful procedure. Reviewed excerpts appear separately from working notes."}
          </p>
        </div>
      )}
      {view && (
        <p className="memory-footnote">
          {view.engine.id === "preview"
            ? "Disconnected sample preview."
            : "Recalled locally. Nothing was sent to a model."}{" "}
          Results follow current access and source withdrawal.
        </p>
      )}
    </section>
  );
}
