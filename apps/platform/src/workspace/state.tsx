import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAppearance } from "./appearance";
import { apiFetch, PREVIEW } from "../transport";
import {
  key,
  type Artifact,
  type Data,
  type Profile,
  type Session,
  type Work,
} from "./shared";
function useWorkspaceState() {
  const composerInput = useRef<HTMLTextAreaElement>(null);
  const transferComposerFocus = useRef(false);
  const assistantOrigin = useRef<{
    page: string;
    profile: string;
    lane: string;
    scroll: number;
  } | null>(null);
  const restoreScroll = useRef<number | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]),
    [session, setSession] = useState<Session | null>(null),
    [page, setPage] = useState("Today"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [navExpanded, setNavExpanded] = useState(false);
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
    [timeline, setTimeline] = useState<Data[]>([]),
    [pinnedReplies, setPinnedReplies] = useState<number[]>([]),
    [homeReplyAfter, setHomeReplyAfter] = useState<number | null>(null),
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
    [background, setBackground] = useState(false),
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
      localStorage.getItem("aksara-theme") || "auto",
    ),
    [ambientMotion, setAmbientMotion] = useState(
      localStorage.getItem("aksara-ambient-motion") !== "off",
    ),
    [device, setDevice] = useState<Data | null>(null);
  const appearance = useAppearance(theme, session?.scope);
  useLayoutEffect(() => {
    const el = composerInput.current;
    if (!el) return;
    if (transferComposerFocus.current) {
      el.focus({ preventScroll: true });
      transferComposerFocus.current = false;
    }
    el.style.height = "auto";
    el.style.height = `${Math.max(24, Math.min(192, el.scrollHeight))}px`;
  }, [draft, page]);
  useLayoutEffect(() => {
    localStorage.setItem("aksara-theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("aksara-ambient-motion", ambientMotion ? "on" : "off");
  }, [ambientMotion]);
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
          setTimeline([]);
          setPinnedReplies([]);
          setHomeReplyAfter(null);
          setArtifacts([]);
          setMemories([]);
          setCandidates([]);
          setDetail(null);
          setSelected(null);
          setDraft("");
          setAttached([]);
          setUploadedText(null);
          setDocTitle("");
          setDocContent("");
          setDocSources([]);
          setShowDoc(false);
          setConsent(false);
          setDevice(null);
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
  function accept(s: Session, preserveAssistant = false) {
    if (!preserveAssistant) assistantOrigin.current = null;
    transferComposerFocus.current = false;
    stopAudio();
    scope.current = s.scope;
    setSession(s);
    setWorks([]);
    setMessages([]);
    setTimeline([]);
    setPinnedReplies([]);
    setHomeReplyAfter(null);
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
    setBackground(false);
    setDevice(null);
    setProviders({});
    setProvider(PREVIEW ? "preview" : "local");
    setModel("");
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
      const [w, m, a, mem, cand, identity, recorded] = await Promise.all(
        [
          "threads",
          "messages",
          "library",
          "memories",
          "memory-candidates",
          "me",
          "today",
        ].map((p) => api(`kernel/${p}`)),
      );
      if (current !== scope.current) return;
      setWorks(w);
      setMessages(m);
      setArtifacts(a);
      setMemories(mem);
      setCandidates(cand);
      setMe(identity);
      setTimeline(recorded.work || []);
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
  // Revalidate open resources on each fresh authorized collection snapshot.
  // Opening a resource itself already performs its own fresh host read.
  useEffect(() => {
    if (detail?.artifact && !artifacts.some((a) => a.id === detail.artifact.id))
      setDetail(null);
    const eligible = new Set(artifacts.map((a) => a.id));
    const lostSource = (ids: string[]) => ids.some((id) => !eligible.has(id));
    if (showDoc && lostSource(docSources)) {
      setShowDoc(false);
      setDocContent("");
      setDocTitle("");
      setDocSources([]);
    }
    if (
      selected &&
      (!works.some((w) => w.id === selected.id) ||
        effects.some((e) => lostSource(e.args?.source_ids || [])))
    ) {
      setSelected(null);
      setEffects([]);
      setApproved({});
    }
  }, [artifacts, works]);
  useEffect(() => {
    setPinnedReplies((ids) => {
      const kept = ids.filter((seq) =>
        messages.some((m) => m.seq === seq && m.role === "assistant"),
      );
      return kept.length === ids.length ? ids : kept;
    });
  }, [messages]);
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
    if (
      !draft.trim() ||
      busy ||
      !model ||
      (background
        ? working.some((w) => backgroundWorkIds.has(w.id))
        : foregroundWorking.length > 0) ||
      (provider !== "local" && !PREVIEW && !consent)
    )
      return;
    if (!["Today", "Ask", "Conversation"].includes(page)) {
      transferComposerFocus.current =
        document.activeElement === composerInput.current;
      setPage(privateLane ? "Ask" : "Conversation");
    }
    await run(async () => {
      const after = Math.max(0, ...messages.map((m) => Number(m.seq)));
      await api("chat", {
        kind: background ? "background" : "interactive",
        text: draft,
        provider,
        model,
        cloud_consent: consent,
        source_consent: consent && attached.length > 0,
        idempotency_key: key(),
        source_ids: attached,
      });
      if (page === "Today") setHomeReplyAfter(after);
      setDraft((current) => (current === draft ? "" : current));
      setAttached((current) => (current === attached ? [] : current));
      setConsent(false);
      setBackground(false);
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
  const backgroundWorkIds = new Set(
    messages
      .filter((m) => m.run.kind === "background")
      .map((m) => m.run.work_id),
  );
  const foregroundWorking = working.filter((w) => !backgroundWorkIds.has(w.id));
  const closeAssistant = () => {
    const origin = assistantOrigin.current;
    assistantOrigin.current = null;
    if (!origin || !session) {
      setPage("Today");
      return;
    }
    const finish = () => {
      restoreScroll.current = origin.scroll;
      transferComposerFocus.current = origin.page === "Today";
      setPage(origin.page);
    };
    if (origin.profile !== session.profile.id || origin.lane !== session.lane) {
      void run(async () => {
        try {
          const next = await api("scope", {
            profile: origin.profile,
            lane: origin.lane,
          });
          accept(next);
          finish();
        } catch (e) {
          setPage("Today");
          throw e;
        }
      });
    } else finish();
  };
  const navigate = (p: string) => {
    if (p === "Ask" && page === "Ask") {
      closeAssistant();
      return;
    }
    if (p !== "Ask") assistantOrigin.current = null;
    if (page === "Ask" && p === "Today") transferComposerFocus.current = true;
    if (p === "Ask" && session) {
      assistantOrigin.current = {
        page,
        profile: session.profile.id,
        lane: session.lane,
        scroll:
          document.querySelector(".work-surface .surface-body")?.scrollTop ||
          window.scrollY,
      };
      const own = session.lanes.find((l) => l.lane.audience.length === 1);
      if (!own) {
        setError("No private conversation is available in this space.");
        return;
      }
      if (own && own.lane.id !== session.lane) {
        // Do not expose/send a private-entry view until the host accepts its scope.
        void run(async () => {
          const next = await api("scope", {
            profile: session.profile.id,
            lane: own.lane.id,
          });
          accept(next, true);
          setPage("Ask");
        });
        return;
      }
    }
    setPage(p);
    setMobile(false);
  };

  return {
    ...appearance,
    composerInput,
    profiles,
    setProfiles,
    session,
    setSession,
    page,
    setPage,
    error,
    setError,
    busy,
    setBusy,
    mobile,
    setMobile,
    navExpanded,
    setNavExpanded,
    scope,
    audioRef,
    audioURL,
    audioSeq,
    setAudioSeq,
    stopAudio,
    works,
    setWorks,
    messages,
    setMessages,
    timeline,
    pinnedReplies,
    setPinnedReplies,
    homeReplyAfter,
    setHomeReplyAfter,
    artifacts,
    setArtifacts,
    memories,
    setMemories,
    candidates,
    setCandidates,
    packs,
    setPacks,
    providers,
    setProviders,
    me,
    setMe,
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
    background,
    setBackground,
    uploadedText,
    setUploadedText,
    query,
    setQuery,
    hits,
    setHits,
    at,
    setAt,
    history,
    setHistory,
    detail,
    setDetail,
    selected,
    setSelected,
    effects,
    setEffects,
    approved,
    setApproved,
    showDoc,
    setShowDoc,
    docTitle,
    setDocTitle,
    docContent,
    setDocContent,
    docSources,
    setDocSources,
    channelName,
    setChannelName,
    localModel,
    setLocalModel,
    theme,
    setTheme,
    ambientMotion,
    setAmbientMotion,
    device,
    setDevice,
    api,
    accept,
    refresh,
    speak,
    run,
    switchContext,
    openWork,
    send,
    proposeDoc,
    lane,
    privateLane,
    working,
    foregroundWorking,
    backgroundWorkIds,
    needs,
    visibleWorks,
    navigate,
    closeAssistant,
    restoreScroll,
  };
}

export type Workspace = ReturnType<typeof useWorkspaceState>;
const WorkspaceContext = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const state = useWorkspaceState();
  return (
    <WorkspaceContext.Provider value={state}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const state = useContext(WorkspaceContext);
  if (!state) throw new Error("Workspace provider required");
  return state;
}
