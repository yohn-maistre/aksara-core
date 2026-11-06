import {useState} from "react";
import {ActionButton} from "./controls";
import { AppearanceControls } from "./AppearanceControls";
import {
  ArrowUpRight,
  AudioLines,
  Check,
  Cpu,
  LockKeyhole,
  Moon,
  Sprout,
  Sun,
} from "lucide-react";
import { DuetCard } from "../components/duet/kit";
import { PREVIEW } from "../transport";

import { type Data } from "./shared";
import { useWorkspace } from "./state";

export function SettingsView() {
  const [section,setSection]=useState("connections");
  const {
    profiles,
    session,
    setSession,
    page,
    setPage,
    busy,
    scope,
    providers,
    setProviders,
    provider,
    model,
    consent,
    at,
    selected,
    localModel,
    setLocalModel,
    theme,
    setTheme,
    device,
    api,
    run,
    switchContext,
    lane,
    needs,
    navigate,
  } = useWorkspace();
  if (!session) return null;
  return (
    <>
      <>
        <div className="page-heading">
          <div>
            <h1>Settings</h1>
            <p>
              Choose where you work, where models run, and what leaves this
              host.
            </p>
          </div>
        </div>
        <button
          className="setup-entry pill-button"
          onClick={() => navigate("Setup")}
        >
          Set up Aksara · models & connections <ArrowUpRight size={15} />
        </button>
        <div className="settings-layout"><nav className="settings-navigation" aria-label="Settings sections">{[["connections","Models & connections"],["workspace","Workspace"],["appearance","Appearance"],["memory","Memory"],["voice","Voice"],["about","About"]].map(([id,label])=><ActionButton variant={section===id?"soft":"ghost"} aria-current={section===id?"page":undefined} key={id} onClick={()=>setSection(id)}>{label}</ActionButton>)}</nav><div className="settings-grid" data-section={section}>
          <DuetCard className="settings-card" data-settings-section="workspace">
            <h2>Personal & community</h2>
            <p>
              {PREVIEW
                ? "The sample personal context is kept separate inside this tab. The live platform uses a separate authority host and database."
                : "Personal mode has a separate authority host and database. Switching clears the current view and unsent drafts."}
            </p>
            <div className="context-options">
              {profiles
                .filter((p) => p.name === session.profile.name)
                .map((p) => (
                  <button
                    className={
                      p.id === session.profile.id ? "selected-context" : ""
                    }
                    key={p.id}
                    onClick={() => void switchContext(p.id)}
                  >
                    {p.mode === "personal" ? (
                      <LockKeyhole size={18} />
                    ) : (
                      <Sprout size={18} />
                    )}
                    <span>
                      {p.mode === "personal"
                        ? "My personal space"
                        : "Community workspace"}
                    </span>
                    {p.id === session.profile.id && <Check size={17} />}
                  </button>
                ))}
            </div>
            <label className="field-label">
              Current conversation
              <select
                aria-label="Current conversation"
                value={session.lane}
                onChange={(e) =>
                  void switchContext(session.profile.id, e.target.value)
                }
              >
                {session.lanes.map((l) => (
                  <option key={l.lane.id} value={l.lane.id}>
                    {l.name} ·{" "}
                    {l.lane.audience.length === 1
                      ? "private"
                      : `${l.lane.audience.length} members`}
                  </option>
                ))}
              </select>
            </label>
          </DuetCard>
          <DuetCard className="settings-card" data-settings-section="connections">
            <h2>Local models & offline use</h2>
            <p>
              Start Ollama or a llama.cpp OpenAI-compatible server on this host
              at 127.0.0.1:11434. Installed models can answer without WAN.
              Downloads require a connection and may be large.
            </p>
            <div className="model-list">
              {providers.local?.models?.map((m: Data) => (
                <div key={m.id}>
                  <Cpu size={16} />
                  {m.id}
                  <small>
                    {m.bytes
                      ? `${Math.round(m.bytes / 1048576)} MiB`
                      : "Local service"}
                  </small>
                </div>
              ))}
            </div>
            <form
              className="source-form"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await api("models/pull", {
                    model: localModel,
                    confirm_download: true,
                  });
                  setProviders(await api("providers"));
                });
              }}
            >
              <label className="field-label">
                Model to download
                <input
                  aria-label="Local model to download"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  required
                />
              </label>
              <button
                className="secondary"
                disabled={busy || !providers.local?.can_pull}
              >
                {busy ? "Working…" : "Download model to this host"}
              </button>
            </form>
            {!providers.local?.available && (
              <p className="muted">No local model server detected.</p>
            )}
          </DuetCard>
          <DuetCard className="settings-card" data-settings-section="appearance">
            <h2>Appearance</h2>
            <p>A quieter workspace, in the light that suits you.</p>
            <AppearanceControls />
            <div className="context-options">
              <button
                onClick={() => setTheme("auto")}
                className={theme === "auto" ? "selected-context" : ""}
              >
                Auto · local time
              </button>
              <button
                onClick={() => setTheme("light")}
                className={theme === "light" ? "selected-context" : ""}
              >
                <Sun size={18} />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={theme === "dark" ? "selected-context" : ""}
              >
                <Moon size={18} />
                Dark
              </button>
            </div>
          </DuetCard>
          <DuetCard className="settings-card" data-settings-section="connections">
            <h2>Model connections</h2>
            <p>
              Connect your ChatGPT subscription, Google AI Studio, Groq or
              OpenRouter in setup. OpenCode keyless access is experimental. Free
              tiers depend on account access and current limits.
            </p>
            <p>
              No paid provider fallback. Each hosted prompt requires explicit
              consent. Local-only conversation turns and the Library stay out of
              hosted context.
            </p>
            <a
              href="https://opencode.ai/docs/zen/"
              target="_blank"
              rel="noreferrer"
            >
              Read provider documentation <ArrowUpRight size={13} />
            </a>
          </DuetCard>
          <DuetCard className="settings-card" data-settings-section="voice">
            <h2>Voice & native surfaces</h2>
            <AudioLines size={23} />
            <p>
              Pocket TTS is the intended local voice worker. Its small English
              models are promising for phone-class hardware; Indonesian support
              is not listed upstream. Opt-in read-aloud uses a local worker;
              this build does not record microphone input.
            </p>
            <p>
              PWA comes first. Expo and desktop wrappers remain conditional on
              measured native needs.
            </p>
          </DuetCard>
          <DuetCard className="settings-card" data-settings-section="about">
            <h2>{PREVIEW ? "About this preview" : "Development setup"}</h2>
            <p>
              {PREVIEW
                ? "This hosted build runs a disposable sample workspace in your browser tab. It has no sign-in, private database, live model, voice worker or physical device. Do not use it to store important work."
                : "Individual tokens stay in the host. The browser uses an HttpOnly session cookie and a context fence. This is a loopback development setup, not an enrolled community deployment."}
            </p>
            <p>
              For a phone, run the host on that phone and open its loopback URL.
              LAN pairing, HTTPS installation, and Android background survival
              still need qualification.
            </p>
            <button
              className="secondary"
              onClick={() => {
                void run(async () => {
                  await api("logout", {});
                  scope.current = "";
                  setSession(null);
                  setPage("Today");
                });
              }}
            >
              {PREVIEW
                ? "Choose a sample persona"
                : "Choose a development identity"}
            </button>
          </DuetCard>
          <DuetCard className="settings-card" data-settings-section="memory"><h2>Memory</h2><p>Sources, working knowledge and useful procedures stay with this workspace. Recall checks current access and withdrawn sources before returning an answer.</p><div className="settings-memory-status"><Check size={16}/>{PREVIEW?"Disconnected sample":"LongMemory · local recall"}</div><p>Reviewed excerpts stay distinct from working notes. A correction can be saved without silently becoming institutional policy.</p><button className="secondary" onClick={()=>navigate("Library")}>Open workspace knowledge <ArrowUpRight size={14}/></button><details><summary>Storage and portability</summary><p>Originals and provenance persist in the local authority store. The recall graph is rebuildable and makes no external inference calls. Public release and remote agent enrollment are not enabled by this setting.</p></details></DuetCard>
        </div></div>
      </>
    </>
  );
}
