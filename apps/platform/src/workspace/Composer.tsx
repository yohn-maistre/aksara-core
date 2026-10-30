import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { useSidebar } from "../components/ui/sidebar";
import { ArrowUp, Plus } from "lucide-react";
import { PREVIEW } from "../transport";

import { type Data } from "./shared";
import { useWorkspace } from "./state";
import { KEY_PROVIDERS, modelsFor, providerName } from "./provider-options";

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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const { isMobile } = useSidebar();
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
          {providerName(provider)}. Experimental hosted data terms apply;
          Library and local-only turns are excluded.
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
        KEY_PROVIDERS.includes(provider) &&
        !providers.hosted?.[provider]?.connected && (
          <p className="composer-note">
            Connect {providerName(provider)} in{" "}
            <button onClick={() => navigate("Setup")}>model setup</button>.
          </p>
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
          setOptionsOpen(false);
          void send(e);
        }}
      >
        <Popover.Root
          open={optionsOpen}
          onOpenChange={setOptionsOpen}
          modal={isMobile}
        >
          <Popover.Trigger
            type="button"
            className="composer-options-trigger icon-button"
            aria-label="Model & sources"
          >
            <Plus size={20} />
            <span className="sr-only">Model &amp; sources</span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner
              side="top"
              align="start"
              sideOffset={12}
              collisionPadding={12}
              className="composer-options-positioner"
            >
              <Popover.Popup className="composer-options-popup">
                <div className="composer-options-heading">
                  <Popover.Title>Model &amp; sources</Popover.Title>
                  <Popover.Close className="text-button">Done</Popover.Close>
                </div>
                {(provider === "local" || provider === "preview") &&
                  artifacts.length > 0 && (
                    <details className="source-picker">
                      <summary>
                        Reference Library sources locally{" "}
                        {attached.length > 0 && `· ${attached.length} selected`}
                      </summary>
                      {artifacts
                        .filter(
                          (a) =>
                            !a.media_type ||
                            a.media_type.startsWith("text/") ||
                            a.media_type === "application/json",
                        )
                        .map((a) => (
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
                        modelsFor(providers, e.target.value)[0]?.id || "",
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
                    {!PREVIEW &&
                      KEY_PROVIDERS.map((id) => (
                        <option value={id} key={id}>
                          {providerName(id)}
                          {providers.hosted?.[id]?.connected
                            ? ""
                            : " · connect in setup"}
                        </option>
                      ))}
                  </select>
                  <select
                    aria-label="Model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Choose a model</option>
                    {modelsFor(providers, PREVIEW ? "preview" : provider)
                      .map((m: Data) => m.id)
                      .map((id: string) => (
                        <option value={id} key={id}>
                          {id}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="composer-note">
                  {PREVIEW
                    ? "Guided sample · no model connection"
                    : "Model replies are drafts. Review before acting."}
                </p>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
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
          onClick={() => setOptionsOpen((v) => !v)}
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
            (!PREVIEW &&
              KEY_PROVIDERS.includes(provider) &&
              !providers.hosted?.[provider]?.connected) ||
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
