import {
  ArrowUpRight,
  Check,
  Cpu,
  Globe,
  KeyRound,
  LockKeyhole,
  Sprout,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Onboarding, ChoiceGroup } from "../components/ui/onboarding";
import { PREVIEW } from "../transport";
import { key, type Data } from "./shared";
import { useWorkspace } from "./state";
import { KEY_PROVIDERS, modelsFor, providerName } from "./provider-options";
import { ProviderKeyConnection } from "./ProviderKeyConnection";
export function SetupView() {
  const {
    session,
    privateLane,
    lane,
    setupOpen,
    setSetupOpen,
    providers,
    setProviders,
    provider,
    setProvider,
    model,
    setModel,
    consent,
    setConsent,
    navigate,
    api,
    run,
    busy,
    works,
    messages,
  } = useWorkspace();
  const [step, setStep] = useState<number>(1),
    [login, setLogin] = useState<Data | null>(null),
    [status, setStatus] = useState(""),
    [testId, setTestId] = useState("");
  const [previewChoice, setPreviewChoice] = useState("codex-chatgpt");
  const choice = PREVIEW ? previewChoice : provider;
  const pending = useRef<Data | null>(null);
  pending.current = login;
  useEffect(() => {
    if (!login || PREVIEW || !setupOpen) return;
    let stopped = false;
    const timer = setInterval(
      async () => {
        try {
          const result = await api("providers/codex/poll", {
            login_id: login.login_id,
          });
          if (stopped) return;
          if (result.status === "failed") {
            setLogin(null);
            setStatus(
              "Sign-in did not complete. Try again or choose another connection.",
            );
            return;
          }
          if (result.status !== "complete") return;
          const connection = await api("providers/codex");
          if (stopped) return;
          setProviders((p: Data) => ({ ...p, codex: connection }));
          setModel(connection.models?.[0]?.id || "");
          setLogin(null);
          setStatus(
            "ChatGPT sign-in saved. Send a test message to verify model access.",
          );
        } catch {
          if (!stopped) {
            setLogin(null);
            setStatus(
              "Sign-in could not complete. Try again, or choose another connection.",
            );
          }
        }
      },
      Math.max(5000, login.next_poll_ms || 5000),
    );
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [login, api, session?.scope, setupOpen]);
  useEffect(
    () => () => {
      const current = pending.current;
      if (current && !PREVIEW)
        void api("providers/codex/cancel", {
          login_id: current.login_id,
        }).catch(() => {});
    },
    [session?.scope, api],
  );
  if (!session) return null;
  const selectedModel = modelsFor(providers, PREVIEW ? "preview" : provider);
  const test = works.find((w) => w.id === testId);
  const testReply = messages.find(
    (m) => m.role === "assistant" && m.run?.work_id === testId,
  );
  const inspectCodex = async () => {
    if (login) await api("providers/codex/poll", { login_id: login.login_id });
    const result = await api("providers/codex");
    setProviders((p: Data) => ({ ...p, codex: result }));
    setStatus(
      result.connected
        ? "ChatGPT sign-in saved. A test message will verify current model access."
        : "Sign in with your ChatGPT account to connect this space. No separate CLI is required.",
    );
    if (result.connected) {
      setLogin(null);
      setModel(result.models[0]?.id || "");
    }
  };
  const choose = (value: string) => {
    if (PREVIEW) {
      setPreviewChoice(value);
      return;
    }
    setProvider(value);
    setConsent(false);
    setStatus("");
    setTestId("");
    setModel(modelsFor(providers, value)[0]?.id || "");
  };
  const close = () => {
    localStorage.setItem("aksara-onboarding-v2", "seen");
    setSetupOpen(false);
    if (login && !PREVIEW)
      void api("providers/codex/cancel", { login_id: login.login_id }).catch(
        () => {},
      );
    setLogin(null);
  };
  const connected =
    choice === "local"
      ? selectedModel.length > 0
      : choice === "codex-chatgpt"
        ? providers.codex?.connected
        : providers.hosted?.[choice]?.connected;
  return (
    <Dialog.Root
      open={setupOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="setup-backdrop" />
        <Dialog.Popup className="setup-dialog">
          <header className="setup-dialog-header">
            <span>
              ∧ <span>Aksara</span>
            </span>
            <button
              className="icon-button"
              aria-label="Close model setup"
              onClick={close}
            >
              <X size={19} />
            </button>
          </header>
          <Onboarding
            totalSteps={2}
            value={step}
            onValueChange={setStep}
            onComplete={close}
            className="setup-flow"
          >
            <div className="setup-dialog-body">
              <Dialog.Title>
                {step === 1
                  ? "Make yourself at home."
                  : "Let’s get your first reply."}
              </Dialog.Title>
              <Dialog.Description>
                {step === 1
                  ? "Connect a model, then start a conversation."
                  : "Your connection stays on this host. Choose what to send."}
              </Dialog.Description>
              {PREVIEW && (
                <p className="notice">
                  Setup preview · Sign-in and model calls are disconnected.
                </p>
              )}
              <p className="setup-context">
                {privateLane
                  ? "Only you"
                  : `Shared reply in #${lane?.name || "this channel"}`}
              </p>
              <Onboarding.Step step={1}>
                <ChoiceGroup
                  name="Model connection"
                  orientation="vertical"
                  value={KEY_PROVIDERS.includes(choice) ? "other" : choice}
                  onValueChange={(id) => choose(id === "other" ? "gemini" : id)}
                  className="setup-choices"
                >
                  {[
                    [
                      "codex-chatgpt",
                      "ChatGPT subscription",
                      "Sign in with your account.",
                    ],
                    [
                      "other",
                      "Another connection",
                      "Google AI Studio, Groq or OpenRouter.",
                    ],
                    [
                      "local",
                      "On this computer",
                      "Use an installed local model.",
                    ],
                  ].map(([id, title, detail]) => (
                    <ChoiceGroup.Item value={id} key={id}>
                      <span className="setup-radio" />
                      <span>
                        <strong>{title}</strong>
                        <small>{detail}</small>
                      </span>
                      <ArrowUpRight size={17} />
                    </ChoiceGroup.Item>
                  ))}
                </ChoiceGroup>
              </Onboarding.Step>
              <Onboarding.Step step={2}>
                {KEY_PROVIDERS.includes(choice) && (
                  <>
                    <label className="setup-field">
                      Connection
                      <select
                        aria-label="Setup provider"
                        value={choice}
                        disabled={PREVIEW}
                        onChange={(e) => choose(e.target.value)}
                      >
                        {KEY_PROVIDERS.map((id) => (
                          <option value={id} key={id}>
                            {providerName(id)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <ProviderKeyConnection id={choice} />
                  </>
                )}
                {choice === "codex-chatgpt" && (
                  <section className="setup-connection">
                    <h3>ChatGPT subscription</h3>
                    <p>
                      {providers.codex?.connected
                        ? "Sign-in saved. A completed reply confirms model access."
                        : "Sign in on OpenAI’s page. You won’t need to copy a token."}
                    </p>
                    <div className="setup-actions">
                      {!providers.codex?.connected && (
                        <button
                          className="primary"
                          disabled={busy || PREVIEW || !!login}
                          onClick={() =>
                            void run(async () => {
                              const result = await api(
                                "providers/codex/login",
                                {},
                              );
                              setLogin(result);
                              setStatus("Finish sign-in on OpenAI’s page.");
                            })
                          }
                        >
                          Sign in with ChatGPT
                        </button>
                      )}
                      <button
                        className="text-button"
                        disabled={busy || PREVIEW}
                        onClick={() => void run(inspectCodex)}
                      >
                        Refresh connection
                      </button>
                      {providers.codex?.connected && (
                        <button
                          className="text-button"
                          disabled={busy || PREVIEW}
                          onClick={() =>
                            void run(async () => {
                              await api("providers/codex/logout", {});
                              setProviders((p: Data) => ({
                                ...p,
                                codex: { connected: false, models: [] },
                              }));
                              setModel("");
                            })
                          }
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                    {login && (
                      <div className="device-code">
                        <span>One-time device code</span>
                        <strong>{login.user_code}</strong>
                        <a
                          href={login.verification_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open OpenAI sign-in <ArrowUpRight size={14} />
                        </a>
                      </div>
                    )}
                    {providers.codex?.connected && (
                      <p className="setup-meta">
                        {providers.codex.catalog_notice ||
                          providers.codex.notice}
                      </p>
                    )}
                  </section>
                )}
                {choice === "local" && !selectedModel.length && (
                  <p>
                    No installed model found.{" "}
                    <button
                      className="text-button"
                      onClick={() => {
                        close();
                        navigate("Settings");
                      }}
                    >
                      Open local model settings
                    </button>
                  </p>
                )}
                <label className="setup-field">
                  Model
                  <select
                    aria-label="Setup model"
                    value={model}
                    disabled={PREVIEW}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setConsent(false);
                      setTestId("");
                    }}
                  >
                    <option value="">Choose a model</option>
                    {selectedModel.map((m: Data) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.id}
                      </option>
                    ))}
                  </select>
                </label>
                <details className="setup-advanced">
                  <summary>Task model</summary>
                  <p>
                    For substantial delegated work, use another model on this
                    same connection. Its account limits and costs apply.
                  </p>
                  <label className="setup-field">
                    Background model
                    <select
                      aria-label="Background model"
                      disabled={PREVIEW || busy}
                      value={providers.worker_models?.[choice] || ""}
                      onChange={(e) =>
                        void run(async () => {
                          const result = await api("providers/worker", {
                            provider: choice,
                            model: e.target.value,
                          });
                          setProviders((p: Data) => ({ ...p, ...result }));
                        })
                      }
                    >
                      <option value="">Same as the conversation</option>
                      {selectedModel.map((m: Data) => (
                        <option key={m.id} value={m.id}>
                          {m.name || m.id}
                        </option>
                      ))}
                    </select>
                  </label>
                </details>
                {choice !== "local" && (
                  <label className="consent setup-consent">
                    <input
                      type="checkbox"
                      checked={consent}
                      disabled={PREVIEW}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      Send this test prompt and eligible earlier consented turns
                      to {providerName(choice)}.
                      <small>
                        No Library sources or local-only turns. Provider terms
                        and account limits apply.
                      </small>
                    </span>
                  </label>
                )}
                <button
                  className="secondary"
                  disabled={
                    busy ||
                    PREVIEW ||
                    !model ||
                    !connected ||
                    (choice !== "local" && !consent)
                  }
                  onClick={() =>
                    void run(async () => {
                      const result = await api("chat", {
                        text: "Setup connection test. Reply briefly with: Aksara connection ready.",
                        provider,
                        model,
                        cloud_consent: consent,
                        idempotency_key: key(),
                        source_ids: [],
                      });
                      setTestId(result.run.work_id);
                      setConsent(false);
                      setStatus("Test sent. Waiting for a reply…");
                    })
                  }
                >
                  Send a test message
                </button>
                {(test || status) && (
                  <p className="setup-status" role="status">
                    {test?.state === "COMPLETED"
                      ? "Reply received. Your connection works."
                      : test?.state === "FAILED"
                        ? test.display_safe_summary ||
                          testReply?.text ||
                          "No reply received. Retry when the host is available."
                        : status}
                  </p>
                )}
              </Onboarding.Step>
            </div>
            <footer className="setup-dialog-footer">
              <div>
                <Onboarding.StepIndicator variant="dots" />
                <small>{step === 1 ? "Connect" : "First reply"}</small>
              </div>
              <button className="text-button" onClick={close}>
                Explore first
              </button>
              <Onboarding.Navigation
                completeLabel="Open workspace"
                nextLabel="Continue"
              />
            </footer>
          </Onboarding>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
