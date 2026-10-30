import { useRef, useEffect } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { PREVIEW } from "../transport";

import { type Data } from "./shared";
import { useWorkspace } from "./state";

// Composer geometry/auto-grow adapted from the user-supplied 21st Ask Bar.
// Canonical messages, provider consent and Library attachments remain host-owned.
export function Composer({
  presentation = "bar",
}: {
  presentation?: "line" | "bar";
}) {
  const {
    composerInput,
    session,
    busy,
    artifacts,
    providers,
    attached,
    setAttached,
    draft,
    setDraft,
    provider,
    setProvider,
    model,
    setModel,
    consent,
    setConsent,
    selected,
    send,
    working,
    navigate,
  } = useWorkspace();
  const optionsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (
        optionsRef.current?.open &&
        !optionsRef.current.parentElement?.contains(e.target as Node)
      )
        optionsRef.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  if (!session) return null;
  return (
    <div className="composer-wrap" data-presentation={presentation}>
      {provider !== "local" && !PREVIEW ? (
        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          Send this prompt and earlier consented turns for this provider to{" "}
          {provider === "codex-chatgpt" ? "Codex / ChatGPT" : "OpenCode"}.
          Experimental hosted data terms apply; Library and local-only turns are
          excluded.
        </label>
      ) : (
        !model && (
          <p className="composer-note">
            No local model found.{" "}
            <button onClick={() => navigate("Settings")}>
              Set up local models
            </button>
          </p>
        )
      )}
      {!PREVIEW &&
        provider === "codex-chatgpt" &&
        !providers.codex?.connected && (
          <p className="composer-note">
            Connect your ChatGPT subscription in{" "}
            <button onClick={() => navigate("Setup")}>model setup</button>, then
            choose a model.
          </p>
        )}

      <form
        className="composer ask-bar"
        data-expanded={draft.includes("\n") || attached.length > 0}
        onSubmit={(e) => {
          optionsRef.current?.removeAttribute("open");
          void send(e);
        }}
      >
        <details
          ref={optionsRef}
          className="composer-options"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              optionsRef.current!.open = false;
              optionsRef.current!.querySelector("summary")?.focus();
            }
          }}
        >
          <summary aria-label="Model & sources">
            <Plus size={20} />
            <span className="sr-only">Model &amp; sources</span>
          </summary>
          <div className="composer-options-body">
            {(provider === "local" || provider === "preview") &&
              artifacts.length > 0 && (
                <details className="source-picker">
                  <summary>
                    Reference Library sources locally{" "}
                    {attached.length > 0 && `· ${attached.length} selected`}
                  </summary>
                  {artifacts.map((a) => (
                    <label key={a.id}>
                      <input
                        type="checkbox"
                        checked={attached.includes(a.id)}
                        disabled={
                          !attached.includes(a.id) && attached.length >= 8
                        }
                        onChange={(e) =>
                          setAttached((v) =>
                            e.target.checked
                              ? [...v, a.id]
                              : v.filter((id) => id !== a.id),
                          )
                        }
                      />
                      {a.title}
                    </label>
                  ))}
                </details>
              )}
            <div className="model-picker">
              <select
                aria-label="Model provider"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  setConsent(false);
                  setAttached([]);
                  setModel(
                    e.target.value === "local"
                      ? providers.local?.models[0]?.id || ""
                      : e.target.value === "codex-chatgpt"
                        ? providers.codex?.models?.[0]?.id || ""
                        : "big-pickle",
                  );
                }}
              >
                {PREVIEW && (
                  <option value="preview">
                    Guided UI demo · no model calls
                  </option>
                )}
                {!PREVIEW && (
                  <option value="local">Local · stays on this host</option>
                )}
                {!PREVIEW && (
                  <option value="opencode-free">
                    OpenCode free · experimental
                  </option>
                )}
                {!PREVIEW && (
                  <option value="codex-chatgpt">
                    Codex · ChatGPT subscription
                  </option>
                )}
              </select>
              <select
                aria-label="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="">Choose a model</option>
                {(PREVIEW
                  ? ["guided-demo"]
                  : provider === "local"
                    ? (providers.local?.models || []).map((m: Data) => m.id)
                    : provider === "codex-chatgpt"
                      ? (providers.codex?.models || []).map((m: Data) => m.id)
                      : providers.opencode?.models || []
                ).map((id: string) => (
                  <option value={id} key={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="composer-note">
            {PREVIEW
              ? "Guided sample · no model connection"
              : "Model replies are drafts. Review before acting."}
          </p>
        </details>
        <textarea
          rows={1}
          ref={composerInput}
          aria-label="Message Aksara"
          placeholder="Message Aksara…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={16000}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="button"
          className="composer-mode"
          aria-label="Choose model and sources"
          onClick={() => {
            if (optionsRef.current)
              optionsRef.current.open = !optionsRef.current.open;
          }}
        >
          {PREVIEW ? "Preview" : provider === "local" ? "Local" : "Hosted"}
          {attached.length ? ` · ${attached.length}` : ""}
        </button>
        <button
          type="submit"
          className="send"
          disabled={
            busy ||
            !draft.trim() ||
            !model ||
            working.length > 0 ||
            (provider !== "local" && !PREVIEW && !consent)
          }
          aria-label="Send message"
        >
          <ArrowUp size={20} />
        </button>
      </form>
    </div>
  );
}
