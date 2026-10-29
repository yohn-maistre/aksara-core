import {
  StrictMode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { apiFetch, PREVIEW } from "./transport";
import {
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Check,
  Circle,
  Cpu,
  FileText,
  Hash,
  Layers,
  LockKeyhole,
  MessageCircle,
  Moon,
  Sun,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Volume2,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { MorningBriefCard } from "./components/duet/morning-brief-card";
import { DuetCard, OutcomePill } from "./components/duet/kit";
const MessageBody = lazy(() =>
  import("./surfaces").then((m) => ({ default: m.MessageBody })),
);
import "./duet.css";
import "./style.css";
import { ShellHeader, TabBar, MenuSheet } from "./components/shell/chrome";
import "./shell.css";

type Data = Record<string, any>;
type Profile = {
  id: string;
  name: string;
  mode: "personal" | "community";
  actor?: string;
};
type Session = {
  profile: Profile;
  scope: string;
  lane: string;
  lanes: { name: string; lane: { id: string; audience: string[] } }[];
  development: boolean;
  test_host?: boolean;
};
type Work = {
  id: string;
  owner: string;
  request: string;
  state: string;
  display_safe_summary: string;
  revision: number;
  generation: number;
};
type Artifact = {
  id: string;
  title: string;
  bytes: number;
  visibility: string;
  sha256: string;
  owner: string;
};
const key = () => crypto.randomUUID();
const stateWord = (s: string) =>
  ({
    HEARD: "Received",
    WORKING: "Working",
    AWAITING_APPROVAL: "Needs your review",
    COMPLETED: "Ready",
    FAILED: "Interrupted",
    CANCELLED: "Cancelled",
    NEEDS_INPUT: "Needs input",
  })[s] || s;
const shortDate = (v: Date) =>
  v.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
function PreviewNotice() {
  return PREVIEW ? (
    <div className="preview-notice" role="status">
      <Sparkles size={16} />
      <span>
        <strong>Interactive UI preview</strong> · Sample workspace. Changes stay
        in this tab and reset on reload. Models, devices and the Rust backend
        are disconnected.
      </span>
    </div>
  ) : null;
}
function Mark() {
  return (
    <span className="mark" aria-hidden>
      <Sprout size={23} />
    </span>
  );
}
function Empty({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function App() {
  const composerInput = useRef<HTMLTextAreaElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]),
    [session, setSession] = useState<Session | null>(null),
    [page, setPage] = useState("Today"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false);
  const scope = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null),
    audioURL = useRef("");
  const [audioSeq, setAudioSeq] = useState<number | null>(null);
  function stopAudio() {
    audioRef.current?.pause();
    if (audioURL.current) URL.revokeObjectURL(audioURL.current);
    audioURL.current = "";
    setAudioSeq(null);
  }
  const [works, setWorks] = useState<Work[]>([]),
    [messages, setMessages] = useState<Data[]>([]),
    [artifacts, setArtifacts] = useState<Artifact[]>([]),
    [memories, setMemories] = useState<Data[]>([]),
    [candidates, setCandidates] = useState<Data[]>([]),
    [packs, setPacks] = useState<Data[]>([]),
    [providers, setProviders] = useState<Data>({}),
    [me, setMe] = useState<Data>({});
  const [attached, setAttached] = useState<string[]>([]),
    [draft, setDraft] = useState(""),
    [provider, setProvider] = useState(PREVIEW ? "preview" : "local"),
    [model, setModel] = useState(""),
    [consent, setConsent] = useState(false),
    [uploadedText, setUploadedText] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [hits, setHits] = useState<Data[]>([]),
    [at, setAt] = useState(""),
    [history, setHistory] = useState<Data | null>(null);
  const [detail, setDetail] = useState<Data | null>(null),
    [selected, setSelected] = useState<Work | null>(null),
    [effects, setEffects] = useState<Data[]>([]),
    [approved, setApproved] = useState<Data>({}),
    [showDoc, setShowDoc] = useState(false),
    [docTitle, setDocTitle] = useState(""),
    [docContent, setDocContent] = useState(""),
    [docSources, setDocSources] = useState<string[]>([]),
    [channelName, setChannelName] = useState(""),
    [localModel, setLocalModel] = useState("smollm2:135m"),
    [theme, setTheme] = useState(
      localStorage.getItem("aksara-theme") || "light",
    ),
    [device, setDevice] = useState<Data | null>(null);
  useLayoutEffect(() => {
    const el = composerInput.current;
    if (!el) return;
    el.style.height = "44px";
    el.style.height = `${Math.min(120, el.scrollHeight)}px`;
  }, [draft, page]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("aksara-theme", theme);
  }, [theme]);
  const api = useCallback(
    async (path: string, body?: unknown): Promise<any> => {
      const started = scope.current;
      const r = await apiFetch(`/api/${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          "content-type": "application/json",
          ...(started ? { "x-aksara-scope": started } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const data = await r.json();
      if (started !== scope.current)
        throw new Error("Context changed; old response discarded");
      if (!r.ok) {
        if (r.status === 403 || r.status === 401 || r.status === 409) {
          stopAudio();
          setWorks([]);
          setMessages([]);
          setArtifacts([]);
          setMemories([]);
          setCandidates([]);
          setDetail(null);
          setSelected(null);
          setEffects([]);
          setHistory(null);
          setHits([]);
          setApproved({});
          if (r.status === 401) {
            scope.current = "";
            setSession(null);
            setPage("Today");
          }
        }
        throw new Error(data.error || "Request failed");
      }
      return data;
    },
    [],
  );
  function accept(s: Session) {
    stopAudio();
    scope.current = s.scope;
    setSession(s);
    setWorks([]);
    setMessages([]);
    setArtifacts([]);
    setHits([]);
    setMemories([]);
    setCandidates([]);
    setSelected(null);
    setDetail(null);
    setEffects([]);
    setApproved({});
    setDraft("");
    setAttached([]);
    setUploadedText(null);
    setDocContent("");
    setDocTitle("");
    setDocSources([]);
    setHistory(null);
    setAt("");
    setShowDoc(false);
    setError("");
    setConsent(false);
    setDevice(null);
  }
  useEffect(() => {
    apiFetch("/api/profiles")
      .then((r) => r.json())
      .then(setProfiles)
      .catch(() => setError("Cannot reach Aksara"));
    apiFetch("/api/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s) accept(s);
      })
      .catch(() => {});
  }, []);
  const refresh = useCallback(async () => {
    if (!scope.current) return;
    const current = scope.current;
    try {
      const [w, m, a, mem, cand, identity] = await Promise.all(
        [
          "threads",
          "messages",
          "library",
          "memories",
          "memory-candidates",
          "me",
        ].map((p) => api(`kernel/${p}`)),
      );
      if (current !== scope.current) return;
      setWorks(w);
      setMessages(m);
      setArtifacts(a);
      setMemories(mem);
      setCandidates(cand);
      setMe(identity);
    } catch (e) {
      if (current === scope.current) setError((e as Error).message);
    }
  }, [api]);
  useEffect(() => {
    if (!session) return;
    void refresh();
    api("packs")
      .then(setPacks)
      .catch(() => {});
    api("providers")
      .then((p) => {
        setProviders(p);
        setModel(PREVIEW ? "guided-demo" : p.local.models[0]?.id || "");
      })
      .catch((e) => setError(e.message));
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 2500);
    return () => clearInterval(timer);
  }, [session?.scope, api, refresh]);
  useEffect(() => {
    if (!session) return;
    if (!at) {
      setHistory(null);
      return;
    }
    const current = scope.current;
    api(
      `kernel/today?at=${Math.min(Date.now(), new Date(at + "T23:59:59").getTime())}`,
    )
      .then((h) => {
        if (current === scope.current) setHistory(h);
      })
      .catch((e) => setError(e.message));
  }, [at, session?.scope, api]);
  useEffect(() => {
    if (audioSeq !== null && !messages.some((m) => m.seq === audioSeq))
      stopAudio();
  }, [messages, audioSeq]);
  async function speak(seq: number) {
    await run(async () => {
      stopAudio();
      const current = scope.current;
      const response = await apiFetch("/api/speech", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-aksara-scope": current,
        },
        body: JSON.stringify({ seq }),
      });
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.error || "Voice unavailable");
      }
      const blob = await response.blob();
      if (scope.current !== current) return;
      audioURL.current = URL.createObjectURL(blob);
      audioRef.current = new Audio(audioURL.current);
      setAudioSeq(seq);
      audioRef.current.onended = stopAudio;
      // Mobile browsers may require another explicit tap after async synthesis.
      await audioRef.current.play().catch(() => {});
    });
  }
  const run = async (fn: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  async function switchContext(profile: string, lane?: string) {
    await run(async () => {
      const s = await api("scope", { profile, lane });
      accept(s);
      setMobile(false);
    });
  }
  async function openWork(w: Work) {
    await run(async () => {
      const [e, current] = await Promise.all([
        api(`kernel/effects?work_id=${w.id}`),
        api(`kernel/thread?id=${w.id}`),
      ]);
      setEffects(e);
      setSelected(current);
      setApproved({});
    });
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await run(async () => {
      await api("chat", {
        text: draft,
        provider,
        model,
        cloud_consent: consent,
        idempotency_key: key(),
        source_ids: attached,
      });
      setDraft("");
      setAttached([]);
      await refresh();
    });
  }
  async function proposeDoc(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      const w = await api("kernel/delegate", {
        request: `Create document: ${docTitle}`,
        idempotency_key: key(),
      });
      await api("kernel/prepare", {
        work_id: w.id,
        revision: w.revision,
        generation: w.generation,
        idempotency_key: key(),
        capability: "artifact.create",
        args: {
          title: docTitle,
          content: docContent,
          visibility:
            session!.lanes.find((l) => l.lane.id === session!.lane)!.lane
              .audience.length === 1
              ? "private"
              : "institution",
          source_ids: docSources,
        },
      });
      setShowDoc(false);
      await refresh();
      await openWork(w);
    });
  }
  const lane = session?.lanes.find((l) => l.lane.id === session.lane),
    privateLane = (lane?.lane.audience.length || 0) === 1;
  const working = works.filter((w) => ["WORKING", "HEARD"].includes(w.state)),
    needs = works.filter((w) =>
      ["AWAITING_APPROVAL", "NEEDS_INPUT"].includes(w.state),
    ),
    visibleWorks = history ? history.work.map((h: Data) => h.work) : works;
  const navigate = (p: string) => {
    if (p === "Ask" && session) {
      const own = session.lanes.find((l) => l.lane.audience.length === 1);
      if (own && own.lane.id !== session.lane)
        void switchContext(session.profile.id, own.lane.id);
    }
    setPage(p);
    setMobile(false);
  };
  if (!session)
    return (
      <div className="welcome">
        <PreviewNotice />
        <main className="welcome-form">
          <Mark />
          <h1>Welcome to Aksara</h1>
          <p>
            {PREVIEW
              ? "Choose a sample persona to explore the interface. No account is created and no backend is connected."
              : "Choose a development identity to explore your workspace. Personal spaces have their own database."}
          </p>
          <div className="profile-list">
            {profiles
              .filter((p) => p.mode === "community")
              .map((p) => (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () =>
                      accept(await api("session", { profile: p.id })),
                    )
                  }
                  key={p.id}
                >
                  <span className="avatar">{p.name[0]}</span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>Community workspace</small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
          </div>
          <p className="dev-note">
            <ShieldCheck size={16} />{" "}
            {PREVIEW
              ? "Sample personas only. Nothing entered here is uploaded."
              : "Local development setup. This chooser is not production sign-in."}
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </main>
      </div>
    );
  return (
    <div className="app-shell">
      <MenuSheet
        open={mobile}
        onOpenChange={setMobile}
        page={page}
        profile={session.profile}
        lanes={session.lanes}
        currentLane={session.lane}
        navigate={navigate}
        onChannel={(id) => {
          void switchContext(session.profile.id, id);
          navigate("Conversation");
        }}
        theme={theme}
        onTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      />
      <div className="main-shell">
        <PreviewNotice />
        {!PREVIEW && session.test_host && (
          <div className="preview-notice" role="status">
            Protected development test host · Use synthetic data only. This is
            the real Rust backend, with development personas and a persistent
            volume; production enrollment is not enabled.
          </div>
        )}
        <div
          className={`duet-column ${["Today", "Ask", "Conversation"].includes(page) ? "phone-column" : "wide-column"}`}
        >
          <ShellHeader
            name={session.profile.name}
            page={page}
            menuOpen={mobile}
            onMenu={() => setMobile(true)}
            onHome={() => navigate("Today")}
            onSettings={() => navigate("Settings")}
            onBack={() => navigate("Today")}
            working={
              working.length > 0 && ["Ask", "Conversation"].includes(page)
            }
            drafting={
              draft.length > 0 && ["Ask", "Conversation"].includes(page)
            }
          />
          <main className={`content page-${page.toLowerCase()}`}>
            {error && (
              <div role="alert" className="error toast">
                {error}
                <button aria-label="Dismiss error" onClick={() => setError("")}>
                  <X size={16} />
                </button>
              </div>
            )}
            {page === "Today" && (
              <>
                <div className="scope-line">
                  {privateLane ? <LockKeyhole size={13} /> : <Hash size={13} />}
                  <span>
                    {session.profile.mode === "personal"
                      ? "Personal space"
                      : "Aksara Commons"}{" "}
                    · {privateLane ? "Private Ask" : lane?.name}
                  </span>
                </div>
                <MorningBriefCard
                  date={
                    at
                      ? shortDate(new Date(at + "T12:00:00"))
                      : shortDate(new Date())
                  }
                  greeting={
                    at ? "Recorded work" : `Hello, ${session.profile.name}.`
                  }
                  needsYou={visibleWorks
                    .filter((w: Work) => w.state === "AWAITING_APPROVAL")
                    .map((w: Work) => ({
                      id: w.id,
                      title: w.request,
                      why: "Your approval is needed before this happens.",
                      action: at
                        ? undefined
                        : {
                            label: "Review proposal",
                            name: `Review ${w.request}`,
                            onPress: () => void openWork(w),
                          },
                    }))}
                  canWait={visibleWorks
                    .filter((w: Work) =>
                      ["HEARD", "WORKING", "NEEDS_INPUT"].includes(w.state),
                    )
                    .map((w: Work) => ({
                      id: w.id,
                      title: w.request,
                      why: stateWord(w.state),
                      action: at
                        ? undefined
                        : {
                            label: "Open thread",
                            name: `Open ${w.request}`,
                            onPress: () => void openWork(w),
                          },
                    }))}
                  today={visibleWorks
                    .filter((w: Work) =>
                      ["COMPLETED", "FAILED", "CANCELLED"].includes(w.state),
                    )
                    .slice(0, 5)
                    .map((w: Work) => ({
                      id: w.id,
                      title: w.request,
                      why: stateWord(w.state),
                    }))}
                  notes={
                    at
                      ? [
                          {
                            id: "history-note",
                            title: "A recorded view of work",
                            why: "This view does not reconstruct past documents, messages, membership or unrecorded activity.",
                          },
                        ]
                      : [
                          {
                            id: "connections-note",
                            title: "External connections",
                            why: "Calendars and mail are not connected. This brief covers recorded work in this conversation.",
                          },
                        ]
                  }
                />
                {!visibleWorks.length && (
                  <DuetCard>
                    <Empty
                      icon={<Circle size={25} />}
                      title={
                        at
                          ? "No recorded work for this date"
                          : "A clear starting point"
                      }
                    >
                      {at
                        ? "History begins when real work is recorded."
                        : "Start a conversation, add a source, or draft your first document. Your activity will take shape here."}
                    </Empty>
                  </DuetCard>
                )}
                <div className="today-actions">
                  <button
                    className="text-button"
                    onClick={() => navigate("Ask")}
                  >
                    Message Aksara <ArrowUpRight size={16} />
                  </button>
                  <label className="date-picker">
                    <span>{at ? "Viewing history" : "History"}</span>
                    <input
                      aria-label="Historical date"
                      type="date"
                      max={new Date().toLocaleDateString("en-CA")}
                      value={at}
                      onChange={(e) => setAt(e.target.value)}
                    />
                    {at && (
                      <button
                        onClick={() => setAt("")}
                        aria-label="Return to now"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </label>
                </div>
              </>
            )}
            {(page === "Ask" || page === "Conversation") && (
              <>
                <div className="page-heading chat-heading">
                  <h1>{privateLane ? "Private Ask" : lane?.name}</h1>
                  <span className="privacy-chip">
                    <LockKeyhole size={14} />
                    {privateLane
                      ? "Only you"
                      : `${lane?.lane.audience.length} members`}
                  </span>
                </div>
                {!privateLane && (
                  <div className="notice">
                    You’re in a shared Channel.{" "}
                    <button
                      onClick={() => {
                        const l = session.lanes.find(
                          (l) => l.lane.audience.length === 1,
                        );
                        if (l)
                          void switchContext(session.profile.id, l.lane.id);
                      }}
                    >
                      Return to private Ask
                    </button>
                  </div>
                )}
                <div className="conversation">
                  <div className="conversation-scroll">
                    {messages.length >= 200 && (
                      <p className="composer-note">
                        Showing the latest 200 eligible messages. Earlier
                        messages remain in canonical storage.
                      </p>
                    )}
                    {!messages.length && (
                      <Empty icon={<Mark />} title="Where shall we begin?">
                        {PREVIEW
                          ? "Try a conversation with the guided UI demo."
                          : "Ask a question or work through an idea. Choose your model below."}
                      </Empty>
                    )}
                    {messages.map((m) => (
                      <article key={m.seq} className={`message ${m.role}`}>
                        <span className="avatar">
                          {m.role === "assistant" ? (
                            <Sprout size={18} />
                          ) : m.run.owner === me.id ? (
                            session.profile.name[0]
                          ) : (
                            "M"
                          )}
                        </span>
                        <div>
                          <span className="message-label">
                            {m.role === "assistant"
                              ? "Aksara · model draft"
                              : m.run.owner === me.id
                                ? "You"
                                : "Member"}
                            <small>
                              {m.run.provider === "preview"
                                ? "preview"
                                : m.run.provider === "local"
                                  ? "local"
                                  : "hosted"}
                            </small>
                          </span>
                          <Suspense
                            fallback={<p className="message-text">{m.text}</p>}
                          >
                            <MessageBody text={m.text} />
                          </Suspense>
                          {m.role === "assistant" &&
                            providers.voice?.configured && (
                              <button
                                className="text-button voice-button"
                                disabled={busy}
                                onClick={() => void speak(m.seq)}
                              >
                                <Volume2 size={14} />
                                Read aloud locally
                              </button>
                            )}
                          {m.role === "assistant" && (
                            <button
                              className="text-button"
                              onClick={() => {
                                setDocTitle("Conversation note");
                                setDocContent(m.text);
                                setDocSources(m.run.source_ids || []);
                                setShowDoc(true);
                              }}
                            >
                              Turn into a document <ArrowUpRight size={13} />
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                    {working.length > 0 && (
                      <div className="turn-status">
                        <span className="typing">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span>
                          A turn is in progress. Results appear after the host
                          accepts them.
                        </span>
                        <button
                          onClick={() =>
                            void run(async () => {
                              for (const w of working)
                                await api("kernel/model-interrupt", {
                                  work_id: w.id,
                                });
                              await refresh();
                            })
                          }
                        >
                          Interrupt / recover
                        </button>
                      </div>
                    )}
                    {works[0]?.state === "FAILED" && (
                      <div className="notice" role="status">
                        The latest model turn did not produce an accepted reply.
                        Check the local worker or hosted quota, then send a new
                        turn when ready. No effect was performed.
                      </div>
                    )}
                  </div>
                  <div className="composer-wrap">
                    <details className="composer-options">
                      <summary>
                        Model &amp; sources ·{" "}
                        {PREVIEW
                          ? "Guided demo"
                          : provider === "local"
                            ? "Local"
                            : "Hosted"}
                        {attached.length > 0
                          ? ` · ${attached.length} sources`
                          : ""}
                      </summary>
                      <div className="composer-options-body">
                        {(provider === "local" || provider === "preview") &&
                          artifacts.length > 0 && (
                            <details className="source-picker">
                              <summary>
                                Reference Library sources locally{" "}
                                {attached.length > 0 &&
                                  `· ${attached.length} selected`}
                              </summary>
                              {artifacts.map((a) => (
                                <label key={a.id}>
                                  <input
                                    type="checkbox"
                                    checked={attached.includes(a.id)}
                                    disabled={
                                      !attached.includes(a.id) &&
                                      attached.length >= 8
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
                              <option value="local">
                                Local · stays on this host
                              </option>
                            )}
                            {!PREVIEW && (
                              <option value="opencode-free">
                                OpenCode free · experimental
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
                                ? (providers.local?.models || []).map(
                                    (m: Data) => m.id,
                                  )
                                : providers.opencode?.models || []
                            ).map((id: string) => (
                              <option value={id} key={id}>
                                {id}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </details>
                    {provider !== "local" && !PREVIEW ? (
                      <label className="consent">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        Send this prompt and earlier consented hosted turns to
                        OpenCode. Experimental hosted data terms apply; Library
                        and local-only turns are excluded.
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
                    <form className="composer" onSubmit={send}>
                      <textarea
                        ref={composerInput}
                        aria-label="Message Aksara"
                        placeholder="What’s on your mind?"
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
                      <div className="composer-tools">
                        <span>
                          <Sparkles size={15} />
                          Aksara
                        </span>
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
                          <ArrowUp size={19} />
                        </button>
                      </div>
                    </form>
                    <p className="composer-note reply-disclosure">
                      {PREVIEW
                        ? "Guided demo · no model or backend connected"
                        : "Model replies are drafts. Review before acting."}
                    </p>
                  </div>
                </div>
              </>
            )}
            {page === "Channels" && (
              <>
                <div className="page-heading">
                  <div>
                    <h1>Channels</h1>
                    <p>
                      Channels keep a conversation, its work, and its artifacts
                      in the same context.
                    </p>
                  </div>
                </div>
                <div className="channel-grid">
                  {session.lanes
                    .filter((l) => l.lane.audience.length > 1)
                    .map((l) => (
                      <DuetCard className="channel-card" key={l.lane.id}>
                        <span className="channel-symbol">
                          <Hash size={24} />
                        </span>
                        <h2>{l.name}</h2>
                        <p>
                          {l.lane.audience.length} members · shared conversation
                        </p>
                        <button
                          className="secondary"
                          onClick={() => {
                            void run(async () => {
                              const s = await api("scope", {
                                profile: session.profile.id,
                                lane: l.lane.id,
                              });
                              accept(s);
                              setPage("Conversation");
                            });
                          }}
                        >
                          Open channel <ArrowUpRight size={15} />
                        </button>
                      </DuetCard>
                    ))}
                </div>
                <DuetCard className="settings-card">
                  <h2>Create a conversation</h2>
                  <p>
                    The new conversation inherits the audience of your current
                    context:{" "}
                    {privateLane
                      ? "only you"
                      : `${lane?.lane.audience.length} members`}
                    . It grants no new access.
                  </p>
                  <form
                    className="inline-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void run(async () => {
                        await api("kernel/channel-create", {
                          name: channelName,
                        });
                        const s = await api("session");
                        setSession(s);
                        setChannelName("");
                      });
                    }}
                  >
                    <input
                      aria-label="Channel name"
                      placeholder="A name for this effort"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      required
                      maxLength={80}
                    />
                    <button className="primary" disabled={busy}>
                      Create
                    </button>
                  </form>
                </DuetCard>
                <div className="notice">
                  <Cpu size={19} />
                  Channel computers have not been provisioned. Conversation
                  access does not grant a shell.
                </div>
              </>
            )}
            {page === "Library" && (
              <>
                <div className="page-heading">
                  <div>
                    <h1>Library</h1>
                    <p>
                      Original sources, useful documents, and the evidence
                      behind your work.
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
                        await api(
                          `kernel/search?query=${encodeURIComponent(query)}`,
                        ),
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
                  <button
                    className="secondary"
                    disabled={busy || !query.trim()}
                  >
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
                            setDetail(
                              await api(`kernel/artifact?id=${h.artifact_id}`),
                            ),
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
                            {a.visibility === "private"
                              ? "Private"
                              : "Community"}{" "}
                            · {a.bytes.toLocaleString()} bytes · Original
                            preserved
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
                    Add UTF-8 text or Markdown. Original bytes are kept locally,
                    with a SHA-256 fingerprint.
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
                                  form.elements.namedItem(
                                    "title",
                                  ) as HTMLInputElement
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
            )}
            {page === "Tools" && (
              <>
                <div className="page-heading">
                  <div>
                    <h1>Tools</h1>
                    <p>
                      Tools act through reviewed proposals. Adding a screen
                      never grants authority.
                    </p>
                  </div>
                </div>
                <div className="tool-grid">
                  {packs.map((p) => (
                    <DuetCard className="tool-card" key={p.id}>
                      <Layers size={21} />
                      <h3>{p.title}</h3>
                      <OutcomePill tone="green" icon={null}>
                        Bundled Pack · {p.version}
                      </OutcomePill>
                      <p>
                        {p.screens.length} registered screen profile ·{" "}
                        {p.capabilities.join(", ")}. Manifest declarations grant
                        no authority.
                      </p>
                    </DuetCard>
                  ))}
                  {[
                    [
                      "Library lookup",
                      "Working",
                      "Search eligible original sources.",
                    ],
                    [
                      "Document creation",
                      "Working",
                      "Review exact content before an atomic effect and receipt.",
                    ],
                    [
                      "Memory review",
                      "Working",
                      `${candidates.length} candidates · ${memories.length} approved records visible here.`,
                    ],
                    [
                      "Device SDK simulator",
                      "Working in community mode",
                      "Independent controller, typed indications, durable receipts.",
                    ],
                    [
                      "Local models",
                      "Optional",
                      "Discover and download through a local Ollama-compatible service.",
                    ],
                    [
                      "OpenUI screens",
                      "Experimental",
                      "Text-only registered cards; no ambient queries or mutations.",
                    ],
                    [
                      "Private / Channel computer",
                      "Not provisioned",
                      "Controller leases and isolated execution need qualification.",
                    ],
                    [
                      "Ruara / PyFedi",
                      "Contract stage",
                      "Reviewed publication boundary; no forum posts are sent.",
                    ],
                    [
                      "Pocket TTS voice",
                      providers.voice?.configured
                        ? "Opt-in local read-aloud"
                        : "Not configured",
                      "Read an eligible short reply through a local Pocket TTS worker. No microphone is active.",
                    ],
                  ].map(([name, status, desc]) => (
                    <DuetCard className="tool-card" key={name}>
                      <Layers size={21} />
                      <h3>{name}</h3>
                      <OutcomePill
                        tone={
                          !PREVIEW && status === "Working" ? "green" : "neutral"
                        }
                        icon={null}
                      >
                        {PREVIEW ? "Preview only" : status}
                      </OutcomePill>
                      <p>{desc}</p>
                    </DuetCard>
                  ))}
                </div>
                {!PREVIEW && session.profile.mode === "community" && (
                  <DuetCard className="settings-card">
                    <h2>Device simulator</h2>
                    <p>
                      Inspect the independent controller. Indications still need
                      a scoped WorkObject, proposal and Operator approval.
                    </p>
                    <button
                      className="secondary"
                      onClick={() =>
                        void run(async () =>
                          setDevice(await api("kernel/simulator-status")),
                        )
                      }
                    >
                      Read device state
                    </button>
                    {device && <pre>{JSON.stringify(device, null, 2)}</pre>}
                    <button
                      className="text-button"
                      disabled={PREVIEW}
                      onClick={() =>
                        void run(async () => {
                          const w = await api("kernel/delegate", {
                            request: "Show a safe device indication",
                            idempotency_key: key(),
                          });
                          await api("kernel/prepare", {
                            work_id: w.id,
                            revision: w.revision,
                            generation: w.generation,
                            idempotency_key: key(),
                            capability: "device.indicate",
                            args: {
                              device: "presence",
                              state: "working",
                              controller_generation: (
                                await api("kernel/simulator-status")
                              ).generation,
                            },
                          });
                          await openWork(w);
                          await refresh();
                        })
                      }
                    >
                      Prepare a test indication
                    </button>
                  </DuetCard>
                )}
                <DuetCard className="settings-card">
                  <h2>Memory review</h2>
                  <p>
                    Only reviewed evidence excerpts enter governed memory.
                    Withdrawal of the source blocks dependent reads.
                  </p>
                  {candidates.map((c) => (
                    <div className="memory-row" key={c.id}>
                      <p>{c.text}</p>
                      <button
                        className="secondary"
                        disabled={me.role !== "operator"}
                        onClick={() =>
                          void run(async () => {
                            await api("kernel/memory-approve", { id: c.id });
                            await refresh();
                          })
                        }
                      >
                        Approve candidate
                      </button>
                    </div>
                  ))}
                  {memories.map((m) => (
                    <div className="memory-row" key={m.id}>
                      <p>{m.text}</p>
                      <button
                        className="text-button"
                        onClick={() =>
                          void run(async () => {
                            await api("kernel/memory-revoke", { id: m.id });
                            await refresh();
                          })
                        }
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                  {!memories.length && !candidates.length && (
                    <p>No eligible memory records in this context.</p>
                  )}
                </DuetCard>
              </>
            )}
            {page === "Settings" && (
              <>
                <div className="page-heading">
                  <div>
                    <h1>Settings</h1>
                    <p>
                      Choose where you work, where models run, and what leaves
                      this host.
                    </p>
                  </div>
                </div>
                <div className="settings-grid">
                  <DuetCard className="settings-card">
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
                              p.id === session.profile.id
                                ? "selected-context"
                                : ""
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
                  <DuetCard className="settings-card">
                    <h2>Local models & offline use</h2>
                    <p>
                      Start Ollama or a llama.cpp OpenAI-compatible server on
                      this host at 127.0.0.1:11434. Installed models can answer
                      without WAN. Downloads require a connection and may be
                      large.
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
                  <DuetCard className="settings-card">
                    <h2>Appearance</h2>
                    <p>A quieter workspace, in the light that suits you.</p>
                    <div className="context-options">
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
                  <DuetCard className="settings-card">
                    <h2>Hosted free models</h2>
                    <p>
                      OpenCode supports public keyless access to free models.
                      The live completion probe returned HTTP 429 (free usage
                      limit reached) during qualification here. Availability and
                      data-use terms may change.
                    </p>
                    <p>
                      No paid provider fallback. Each hosted prompt requires
                      explicit consent. Local-only conversation turns and the
                      Library stay out of hosted context.
                    </p>
                    <a
                      href="https://opencode.ai/docs/zen/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read provider documentation <ArrowUpRight size={13} />
                    </a>
                  </DuetCard>
                  <DuetCard className="settings-card">
                    <h2>Voice & native surfaces</h2>
                    <AudioLines size={23} />
                    <p>
                      Pocket TTS is the intended local voice worker. Its small
                      English models are promising for phone-class hardware;
                      Indonesian support is not listed upstream. Opt-in
                      read-aloud uses a local worker; this build does not record
                      microphone input.
                    </p>
                    <p>
                      PWA comes first. Expo and desktop wrappers remain
                      conditional on measured native needs.
                    </p>
                  </DuetCard>
                  <DuetCard className="settings-card">
                    <h2>
                      {PREVIEW ? "About this preview" : "Development setup"}
                    </h2>
                    <p>
                      {PREVIEW
                        ? "This hosted build runs a disposable sample workspace in your browser tab. It has no sign-in, private database, live model, voice worker or physical device. Do not use it to store important work."
                        : "Individual tokens stay in the host. The browser uses an HttpOnly session cookie and a context fence. This is a loopback development setup, not an enrolled community deployment."}
                    </p>
                    <p>
                      For a phone, run the host on that phone and open its
                      loopback URL. LAN pairing, HTTPS installation, and Android
                      background survival still need qualification.
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
                </div>
              </>
            )}
          </main>
          <TabBar current={page} waiting={needs.length} navigate={navigate} />
        </div>
      </div>
      {audioSeq !== null && (
        <aside className="voice-player" aria-label="Local read-aloud controls">
          <Volume2 size={17} />
          <span>Local read-aloud</span>
          <button
            onClick={() =>
              void audioRef.current
                ?.play()
                .catch(() => setError("Tap Play again to start audio."))
            }
          >
            Play
          </button>
          <button onClick={stopAudio}>Stop</button>
        </aside>
      )}
      <Dialog.Root
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Popup className="dialog">
            <Dialog.Title>Work & review</Dialog.Title>
            <Dialog.Close className="dialog-close" aria-label="Close work">
              <X size={20} />
            </Dialog.Close>
            {selected && (
              <>
                <p>{selected.request}</p>
                <OutcomePill
                  tone={selected.state === "COMPLETED" ? "green" : "neutral"}
                  icon={null}
                >
                  {stateWord(selected.state)}
                </OutcomePill>
                {effects.map((e) => (
                  <section className="effect-review" key={e.prepared.id}>
                    <h3>{e.prepared.capability}</h3>
                    <p>Exact proposed arguments · {e.prepared.status}</p>
                    <pre>{JSON.stringify(e.args, null, 2)}</pre>
                    {e.receipt ? (
                      <div className="notice">
                        <ShieldCheck size={18} />
                        {PREVIEW ? "Preview result:" : "Receipt:"}{" "}
                        {e.receipt.outcome} ·{" "}
                        {e.receipt.verified_sha256?.slice(0, 16)}
                      </div>
                    ) : (
                      <div className="review-actions">
                        <button
                          className="secondary"
                          disabled={
                            busy ||
                            me.role !== "operator" ||
                            e.args.redacted ||
                            !["PREPARED", "APPROVED"].includes(
                              e.prepared.status,
                            )
                          }
                          onClick={() =>
                            void run(async () => {
                              const a = await api("kernel/approve", {
                                id: e.prepared.id,
                                args_hash: e.prepared.args_hash,
                              });
                              setApproved((v) => ({
                                ...v,
                                [e.prepared.id]: a,
                              }));
                            })
                          }
                        >
                          {approved[e.prepared.id]
                            ? "Approved for exact arguments"
                            : PREVIEW
                              ? "Try sample approval"
                              : "Approve exact proposal"}
                        </button>
                        <button
                          className="primary"
                          disabled={busy || !approved[e.prepared.id]}
                          onClick={() =>
                            void run(async () => {
                              const a = approved[e.prepared.id];
                              await api(
                                `kernel/${e.prepared.capability === "device.indicate" ? "device-execute" : "execute"}`,
                                { id: a.id, lease: a.lease },
                              );
                              await refresh();
                              await openWork(selected);
                            })
                          }
                        >
                          {PREVIEW
                            ? "Create sample document"
                            : "Execute approved effect"}
                        </button>
                      </div>
                    )}
                    {me.role !== "operator" && !e.receipt && (
                      <p className="muted">
                        An Operator must review this proposal in the same
                        eligible context.
                      </p>
                    )}
                  </section>
                ))}
                {!effects.length && (
                  <p className="muted">
                    No effect has been proposed for this thread.
                  </p>
                )}
                <button
                  className="text-button"
                  onClick={() =>
                    void run(async () => {
                      try {
                        await api("kernel/model-interrupt", {
                          work_id: selected.id,
                        });
                      } catch {
                        await api("kernel/cancel", { id: selected.id });
                      }
                      setSelected(null);
                      await refresh();
                    })
                  }
                >
                  Cancel / interrupt this work
                </button>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!detail}
        onOpenChange={(v) => {
          if (!v) setDetail(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Popup className="dialog">
            <Dialog.Title>{detail?.artifact.title}</Dialog.Title>
            <Dialog.Close className="dialog-close" aria-label="Close document">
              <X size={20} />
            </Dialog.Close>
            {detail && (
              <>
                <p className="fingerprint">SHA-256 {detail.artifact.sha256}</p>
                <pre className="document-content">{detail.content}</pre>
                <div className="review-actions">
                  <button
                    className="secondary"
                    onClick={() => {
                      setDocSources([detail.artifact.id]);
                      setDocTitle(`Notes on ${detail.artifact.title}`);
                      setDocContent(detail.content);
                      setDetail(null);
                      setShowDoc(true);
                    }}
                  >
                    Draft from this source
                  </button>
                  <button
                    className="secondary"
                    onClick={() =>
                      void run(async () => {
                        await api("kernel/memory-candidate", {
                          text: Array.from(detail.content as string)
                            .slice(0, 300)
                            .join(""),
                          source_artifact_id: detail.artifact.id,
                          visibility: detail.artifact.visibility,
                          purpose: "knowledge",
                          kind: "semantic",
                          evidence_kind: "source_fact",
                          retention_seconds: 604800,
                        });
                        setDetail(null);
                        await refresh();
                      })
                    }
                  >
                    Propose evidence for memory
                  </button>
                  <button
                    className="text-button danger"
                    disabled={me.id !== detail.artifact.owner}
                    onClick={() =>
                      void run(async () => {
                        await api("kernel/withdraw", {
                          id: detail.artifact.id,
                        });
                        setDetail(null);
                        await refresh();
                      })
                    }
                  >
                    Withdraw source
                  </button>
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={showDoc} onOpenChange={setShowDoc}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Popup className="dialog">
            <Dialog.Title>Give an idea a page</Dialog.Title>
            <Dialog.Description>
              Draft locally, review the exact content, then approve its creation
              in this context.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Close editor">
              <X size={20} />
            </Dialog.Close>
            <form className="source-form" onSubmit={proposeDoc}>
              <input
                aria-label="Document title"
                placeholder="Untitled document"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
                maxLength={256}
              />
              <textarea
                className="editor"
                aria-label="Document content"
                placeholder="A beginning, in your own words…"
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                required
                maxLength={500000}
              />
              {docSources.length > 0 && (
                <p>
                  Linked to {docSources.length} eligible source. Its
                  restrictions follow this document.
                </p>
              )}
              <button className="primary" disabled={busy}>
                Prepare for review <ArrowUpRight size={15} />
              </button>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  navigator.serviceWorker.register("/sw.js").catch(() => {});
