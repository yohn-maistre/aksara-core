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
import WizardExpandable from "../components/ui/wizard-expandable";
import { PREVIEW } from "../transport";
import { key, type Data } from "./shared";
import { useWorkspace } from "./state";
export function SetupView() {
  const {
    session,
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
  } = useWorkspace();
  const [step, setStep] = useState<string | null>("space"),
    [login, setLogin] = useState<Data | null>(null),
    [status, setStatus] = useState(""),
    [testId, setTestId] = useState("");
  const pending = useRef<Data | null>(null);
  pending.current = login;
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
  const selectedModel =
    provider === "local"
      ? providers.local?.models
      : provider === "codex-chatgpt"
        ? providers.codex?.models
        : (providers.opencode?.models || []).map((id: string) => ({ id }));
  const test = works.find((w) => w.id === testId);
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
    setProvider(value);
    setConsent(false);
    setStatus("");
    setModel(
      value === "local"
        ? providers.local?.models?.[0]?.id || ""
        : value === "codex-chatgpt"
          ? providers.codex?.models?.[0]?.id || ""
          : providers.opencode?.models?.[0] || "big-pickle",
    );
  };
  return (
    <div className="setup-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Make yourself at home</p>
          <h1>A place to think, together.</h1>
          <p>
            Choose your space and how Aksara answers. You can change these
            choices later.
          </p>
        </div>
        <button className="text-button" onClick={() => navigate("Today")}>
          Set up later <ArrowUpRight size={15} />
        </button>
      </div>
      {PREVIEW && (
        <p className="notice">
          This is a tour of setup. Sign-in, downloads and model calls are
          disconnected in the hosted preview.
        </p>
      )}
      <WizardExpandable
        expanded
        activeStep={step}
        onActiveStepChange={setStep}
        badgeText="Aksara setup"
        className="setup-wizard"
        canGoNext={step !== "model" || !!model}
        onComplete={() => {
          localStorage.setItem(
            `aksara-setup:${session.profile.id}`,
            "complete",
          );
          navigate("Today");
        }}
        completeLabel="Open my workspace"
        steps={[
          {
            id: "space",
            title: "Your space",
            description: "A clear place to begin",
            icon: Sprout,
            content: (
              <div className="setup-content">
                <h2>This space belongs to you.</h2>
                <p>
                  {session.profile.mode === "personal"
                    ? "Your personal database is separate from the community."
                    : "Your private thread lives inside the community workspace. Shared channels have their own audience."}
                </p>
                <div className="setup-facts">
                  <p>
                    <LockKeyhole size={18} />
                    Private means the current eligible audience, checked by the
                    host.
                  </p>
                  <p>
                    <Check size={18} />
                    Aksara proposes changes. You review exact effects before
                    execution.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate("Settings")}
                >
                  Change personal or community space <ArrowUpRight size={14} />
                </button>
              </div>
            ),
          },
          {
            id: "model",
            title: "How Aksara thinks",
            description: "Local, keyless, or your subscription",
            icon: Cpu,
            content: (
              <div className="setup-content">
                <h2>Choose a model connection.</h2>
                <div
                  className="provider-choices"
                  role="group"
                  aria-label="Model connection"
                >
                  {[
                    [
                      "local",
                      Cpu,
                      "On this computer",
                      "Offline after the model is installed.",
                    ],
                    [
                      "opencode-free",
                      Globe,
                      "OpenCode free",
                      "Keyless hosted models. Quotas and terms can change.",
                    ],
                    [
                      "codex-chatgpt",
                      KeyRound,
                      "ChatGPT subscription",
                      "Connect your subscription through Mastra.",
                    ],
                  ].map(([value, Icon, label, detail]) => {
                    const Glyph = Icon as typeof Cpu;
                    return (
                      <button
                        key={value as string}
                        disabled={PREVIEW}
                        aria-pressed={provider === value}
                        onClick={() => choose(value as string)}
                      >
                        <Glyph size={20} />
                        <span>
                          <strong>{label as string}</strong>
                          <small>{detail as string}</small>
                        </span>
                        {provider === value && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
                {provider === "codex-chatgpt" && (
                  <section className="connection-controls">
                    <h3>Connect this space to Codex via Mastra</h3>
                    <p>
                      OAuth and refresh tokens stay in this space’s encrypted
                      host-side credential store. Aksara never asks you to paste
                      a subscription token.
                    </p>
                    <div className="actions">
                      <button
                        className="secondary"
                        disabled={busy || PREVIEW}
                        onClick={() => void run(inspectCodex)}
                      >
                        Check Codex connection
                      </button>
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
                            setStatus(
                              "Finish sign-in on OpenAI’s page, then check the connection.",
                            );
                          })
                        }
                      >
                        Sign in with ChatGPT
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
                              setStatus("Disconnected this space.");
                            })
                          }
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                    {login && (
                      <div className="device-code">
                        <p>
                          Enter this one-time code on OpenAI’s sign-in page:
                        </p>
                        <strong>{login.user_code}</strong>
                        <a
                          className="text-button"
                          href={login.verification_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open OpenAI sign-in <ArrowUpRight size={15} />
                        </a>
                        <button
                          className="text-button"
                          onClick={() =>
                            void run(async () => {
                              await api("providers/codex/cancel", {
                                login_id: login.login_id,
                              });
                              setLogin(null);
                              setStatus("Sign-in cancelled.");
                            })
                          }
                        >
                          Cancel sign-in
                        </button>
                      </div>
                    )}
                  </section>
                )}
                {provider === "local" && !providers.local?.models?.length && (
                  <p className="notice">
                    No local model found.{" "}
                    <button onClick={() => navigate("Settings")}>
                      Download a model or connect your local server in Settings.
                    </button>
                  </p>
                )}
                <label className="field-label">
                  Model
                  <select
                    aria-label="Setup model"
                    value={model}
                    disabled={PREVIEW}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Choose a model</option>
                    {(selectedModel || []).map((m: Data) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.id}
                      </option>
                    ))}
                  </select>
                </label>
                {provider !== "local" && (
                  <label className="consent">
                    <input
                      type="checkbox"
                      disabled={PREVIEW}
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    Allow this setup test prompt to go to{" "}
                    {provider === "codex-chatgpt"
                      ? "Codex / ChatGPT"
                      : "OpenCode"}
                    . Subscription limits or hosted data terms apply. Library
                    and local-only turns are excluded.
                  </label>
                )}
                <button
                  className="secondary"
                  disabled={
                    busy ||
                    PREVIEW ||
                    !model ||
                    (provider !== "local" && !consent)
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
                      setStatus(
                        "Test turn admitted. Waiting for a canonical result…",
                      );
                    })
                  }
                >
                  Send a test message
                </button>
                {test && (
                  <p role="status">
                    {test.state === "COMPLETED"
                      ? "The host accepted a model response. Your connection works."
                      : test.state === "FAILED"
                        ? "The test did not complete. Check sign-in, provider quota, or the local server."
                        : `Test status: ${test.state.toLowerCase()}`}
                  </p>
                )}
                {status && (
                  <p className="connection-status" role="status">
                    {status}
                  </p>
                )}
              </div>
            ),
          },
          {
            id: "ready",
            title: "Ready when you are",
            description: "Start small; keep control",
            icon: Check,
            content: (
              <div className="setup-content">
                <h2>Your next thought can start on Today.</h2>
                <p>
                  Add a source, ask a question, or turn a reply into a document.
                  Models answer as drafts. Tools, computers and public sharing
                  each need their own authorized contracts.
                </p>
                <p>
                  You can explore without a model connection and return to this
                  setup any time.
                </p>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
