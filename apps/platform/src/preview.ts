/** Disposable presentation fixture, NOT an authority implementation.
 * No network, credentials, model inference, device IO or persistent user data.
 * This module is excluded from the normal host build.
 */
type Item = Record<string, any>;
const id = () => `preview_${crypto.randomUUID()}`;
const json = (data: unknown, status = 200) => Response.json(data, { status });
const copy = <T>(data: T): T => structuredClone(data);
async function sha(text: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
export function createPreview() {
  const people = ["Operator", "Maria", "Yohan"];
  const profiles = people.flatMap((name, i) =>
    ["community", "personal"].map((mode) => ({
      id: `${mode}-${i}`,
      name,
      actor: name,
      mode,
    })),
  );
  const stores = new Map<string, Item>();
  let session: Item | null = null;
  function domain(p: Item) {
    return p.mode === "community" ? "community" : `personal-${p.actor}`;
  }
  function lanes(p: Item) {
    return p.mode === "personal"
      ? [
          {
            name: "Private Ask",
            lane: { id: `personal-${p.actor}`, audience: [p.actor] },
          },
        ]
      : [
          { name: "Common room", lane: { id: "common", audience: people } },
          { name: "Field notes", lane: { id: "field", audience: people } },
          ...people.map((name) => ({
            name: "Private Ask",
            lane: { id: `private-${name}`, audience: [name] },
          })),
        ].filter((l) => l.lane.audience.includes(p.actor));
  }
  function view() {
    if (!session) return null;
    return copy({
      ...session,
      development: true,
      preview: true,
      lanes: [
        ...lanes(session.profile),
        ...(stores.get(domain(session.profile))?.lanes || []).filter(
          (l: Item) => l.lane.audience.includes(session!.profile.actor),
        ),
      ],
    });
  }
  function select(profile: Item, lane?: string) {
    const possible = [
      ...lanes(profile),
      ...(stores.get(domain(profile))?.lanes || []),
    ];
    const own = possible.find(
      (l) =>
        l.lane.audience.length === 1 && l.lane.audience[0] === profile.actor,
    );
    if (
      !possible.some(
        (l) =>
          l.lane.id === (lane || own!.lane.id) &&
          l.lane.audience.includes(profile.actor),
      )
    )
      throw new Error("Unknown sample conversation");
    session = { profile, lane: lane || own!.lane.id, scope: id() };
    return view();
  }
  const ready = (async () => {
    for (const p of profiles) {
      if (stores.has(domain(p))) continue;
      stores.set(domain(p), {
        artifacts: [],
        works: [],
        messages: [],
        effects: [],
        memories: [],
        lanes: [],
        seq: 0,
      });
    }
    const community = stores.get("community")!;
    const source: Item = {
      id: "preview-source-welcome",
      title: "A place for our first steps",
      content:
        "This is a fictional sample source. Aksara brings people, knowledge and work into one living workspace. The hosted preview runs in this browser tab. No private backend, model or device is connected.",
      owner: "Operator",
      visibility: "private",
      purpose: "knowledge",
      provenance: "Synthetic preview fixture",
      created_ms: Date.now(),
    };
    source.sha256 = await sha(source.content);
    community.artifacts.push({
      ...source,
      bytes: new TextEncoder().encode(source.content).length,
      active: true,
    });
    const guide =
      "A small beginning: bring in a source, discuss an idea, review a document, and keep the evidence close. This page is sample content for the UI preview.";
    const work = {
      id: "preview-work-welcome",
      owner: "Operator",
      lane_id: "private-Operator",
      audience: ["Operator"],
      request: "Review our first welcome note",
      state: "AWAITING_APPROVAL",
      revision: 1,
      generation: 1,
      display_safe_summary: "Sample document ready for review",
      created_ms: Date.now(),
    };
    community.works.push(work, {
      ...work,
      id: "preview-work-pilot",
      request: "Choose the first community pilot",
      state: "NEEDS_INPUT",
      display_safe_summary: "A conversation to have together",
    });
    community.effects.push({
      prepared: {
        id: "preview-effect-welcome",
        work_id: work.id,
        args_hash: await sha(guide),
        capability: "artifact.create",
        status: "PREPARED",
      },
      args: {
        title: "Our first welcome note",
        content: guide,
        visibility: "private",
        source_ids: [source.id],
      },
      receipt: null,
    });
    community.messages.push({
      seq: ++community.seq,
      role: "assistant",
      text: "Welcome to a sample shared conversation. A Channel keeps the discussion and its work together. Nothing you enter in this preview is sent to a model or shared with another visitor.",
      run: {
        owner: "Operator",
        lane_id: "common",
        audience: people,
        source_ids: [],
        provider: "preview",
      },
    });
    select(profiles[0]);
  })();
  function eligible(a: Item) {
    return (
      a.active &&
      (a.visibility === "institution" ||
        (a.owner === session!.profile.actor &&
          view()!.lanes.find((l: Item) => l.lane.id === session!.lane)?.lane
            .audience.length === 1))
    );
  }
  function dependencies(ids: string[]) {
    return ids.every((k) =>
      stores
        .get(domain(session!.profile))!
        .artifacts.some((a: Item) => a.id === k && eligible(a)),
    );
  }
  async function request(path: string, init: RequestInit = {}) {
    await ready;
    if (!path.startsWith("/api/"))
      return json(
        { error: "The preview does not make external requests." },
        400,
      );
    const u = new URL(path, "https://preview.invalid");
    const method = init.method || "GET";
    let input: Item = {};
    try {
      input = JSON.parse(String(init.body || "{}"));
    } catch {
      return json({ error: "Invalid sample input" }, 400);
    }
    if (method === "GET" && u.pathname === "/api/profiles")
      return json(profiles);
    if (method === "POST" && u.pathname === "/api/session") {
      const p = profiles.find((p) => p.id === input.profile);
      return p
        ? json(select(p))
        : json({ error: "Unknown preview persona" }, 400);
    }
    if (method === "GET" && u.pathname === "/api/session")
      return session
        ? json(view())
        : json({ error: "Choose a preview persona" }, 401);
    if (!session) return json({ error: "Choose a preview persona" }, 401);
    if (new Headers(init.headers).get("x-aksara-scope") !== session.scope)
      return json({ error: "Preview context changed; refresh this view" }, 409);
    if (method === "POST" && u.pathname === "/api/logout") {
      session = null;
      return json({ logged_out: true });
    }
    if (method === "POST" && u.pathname === "/api/scope") {
      const p = profiles.find(
        (p) => p.id === input.profile && p.actor === session!.profile.actor,
      );
      if (!p) return json({ error: "Unknown preview context" }, 403);
      try {
        return json(select(p, input.lane));
      } catch {
        return json({ error: "Unknown preview conversation" }, 403);
      }
    }
    const store = stores.get(domain(session.profile))!;
    const lane = view()!.lanes.find(
      (l: Item) => l.lane.id === session!.lane,
    ).lane;
    const visibleWork = (w: Item) =>
      w.lane_id === lane.id &&
      lane.audience.every((a: string) => w.audience.includes(a));
    if (method === "GET" && u.pathname === "/api/packs")
      return json([
        {
          id: "aksara.knowledge",
          title: "Knowledge & documents",
          version: "0.1.0",
          screens: [{ id: "knowledge.finding" }],
          capabilities: ["library.lookup", "artifact.create"],
        },
      ]);
    if (method === "GET" && u.pathname === "/api/providers")
      return json({
        local: { available: false, can_pull: false, models: [] },
        opencode: { models: [], experimental: true },
        voice: { configured: false },
        preview: true,
      });
    if (method === "POST" && u.pathname === "/api/chat") {
      if (input.provider !== "preview")
        return json(
          { error: "Models are disconnected in the hosted UI preview." },
          409,
        );
      if (
        typeof input.text !== "string" ||
        !input.text.trim() ||
        input.text.length > 8000 ||
        store.messages.length >= 100
      )
        return json(
          {
            error:
              "Use a shorter sample message; reset the tab for a fresh preview.",
          },
          400,
        );
      const sources = (input.source_ids || []).filter((k: string) =>
        store.artifacts.some((a: Item) => a.id === k && eligible(a)),
      );
      const run = {
        id: id(),
        owner: session.profile.actor,
        lane_id: lane.id,
        audience: lane.audience,
        source_ids: sources,
        provider: "preview",
      };
      store.messages.push({
        seq: ++store.seq,
        role: "user",
        text: input.text,
        run,
      });
      store.messages.push({
        seq: ++store.seq,
        role: "assistant",
        text: 'This is a guided UI response, not model inference. In the live platform I can help explore a question using eligible sources, or help prepare a document for review. Try turning this example into a document.\n\n```openui\nroot = EvidenceCard("A place for your next step", "This registered OpenUI card is rendered by the same frontend as the live app. No tool or backend was invoked.")\n```',
        run,
      });
      return json({ preview: true }, 202);
    }
    const op = u.pathname.replace("/api/kernel/", "");
    const getId = u.searchParams.get("id") || input.id;
    if (method === "GET")
      switch (op) {
        case "me":
          return json({
            id: session.profile.actor,
            name: session.profile.name,
            role: session.profile.actor === "Operator" ? "operator" : "member",
          });
        case "threads":
          return json(store.works.filter(visibleWork).slice().reverse());
        case "thread": {
          const w = store.works.find(
            (w: Item) => w.id === getId && visibleWork(w),
          );
          return w
            ? json(w)
            : json({ error: "Sample work is not in this context" }, 404);
        }
        case "library":
          return json(
            store.artifacts
              .filter(eligible)
              .map(({ content, ...a }: Item) => a),
          );
        case "messages":
          return json(
            store.messages.filter(
              (m: Item) =>
                m.run.lane_id === lane.id &&
                lane.audience.every((a: string) =>
                  m.run.audience.includes(a),
                ) &&
                dependencies(m.run.source_ids),
            ),
          );
        case "artifact": {
          const a = store.artifacts.find(
            (a: Item) => a.id === getId && eligible(a),
          );
          return a
            ? json({ artifact: a, content: a.content })
            : json({ error: "Sample source not in this context" }, 404);
        }
        case "search": {
          const q = (u.searchParams.get("query") || "").toLowerCase();
          return json(
            store.artifacts
              .filter(
                (a: Item) =>
                  eligible(a) &&
                  `${a.title} ${a.content}`.toLowerCase().includes(q),
              )
              .map((a: Item) => ({
                artifact_id: a.id,
                block_id: a.id,
                title: a.title,
                text: a.content,
                sha256: a.sha256,
              })),
          );
        }
        case "effects":
          return json(
            store.effects.filter(
              (e: Item) =>
                e.prepared.work_id === u.searchParams.get("work_id") &&
                store.works.some(
                  (w: Item) => w.id === e.prepared.work_id && visibleWork(w),
                ),
            ),
          );
        case "memories":
        case "memory-candidates":
          return json(
            store.memories.filter(
              (m: Item) =>
                m.state === (op === "memories" ? "APPROVED" : "CANDIDATE") &&
                dependencies([m.source_artifact_id]) &&
                (m.owner === session!.profile.actor ||
                  m.visibility === "institution"),
            ),
          );
        case "today": {
          const at = Number(u.searchParams.get("at") || Date.now());
          return json({
            at,
            history_kind: "sample-preview",
            work: store.works
              .filter((w: Item) => visibleWork(w) && w.created_ms <= at)
              .map((work: Item) => ({ work, recorded_ms: work.created_ms })),
          });
        }
        case "simulator-status":
          return json({
            preview: true,
            connected: false,
            generation: 1,
            description:
              "No device controller is connected. Live simulator available with the Rust host.",
          });
      }
    if (method === "POST")
      switch (op) {
        case "channel-create": {
          if (
            typeof input.name !== "string" ||
            !input.name.trim() ||
            input.name.length > 80 ||
            store.lanes.length >= 12
          )
            return json({ error: "Choose a shorter sample channel name" }, 400);
          const l = {
            name: input.name,
            lane: { id: id(), audience: lane.audience },
          };
          store.lanes.push(l);
          return json(l);
        }
        case "ingest": {
          if (
            typeof input.content !== "string" ||
            !input.content.trim() ||
            input.content.length > 65536 ||
            store.artifacts.length >= 30
          )
            return json(
              {
                error:
                  "Preview limit: 30 sources of up to 64 KiB. Reload to reset.",
              },
              400,
            );
          const a = {
            ...input,
            id: id(),
            owner: session.profile.actor,
            active: true,
            sha256: await sha(input.content),
            bytes: new TextEncoder().encode(input.content).length,
          };
          store.artifacts.push(a);
          return json(a);
        }
        case "delegate": {
          if (store.works.length >= 50 || typeof input.request !== "string")
            return json({ error: "Reload to reset the sample workspace" }, 400);
          const w = {
            id: id(),
            owner: session.profile.actor,
            lane_id: lane.id,
            audience: lane.audience,
            request: input.request,
            state: "HEARD",
            revision: 1,
            generation: 1,
            display_safe_summary: "Preview draft",
            created_ms: Date.now(),
          };
          store.works.push(w);
          return json(w);
        }
        case "prepare": {
          const w = store.works.find(
            (w: Item) => w.id === input.work_id && visibleWork(w),
          );
          if (!w) return json({ error: "Sample work not found" }, 404);
          if (input.capability !== "artifact.create")
            return json(
              {
                error:
                  "Devices and external tools are disconnected in this preview.",
              },
              409,
            );
          const e = {
            prepared: {
              id: id(),
              work_id: w.id,
              args_hash: await sha(JSON.stringify(input.args)),
              capability: input.capability,
              status: "PREPARED",
            },
            args: input.args,
            receipt: null,
          };
          store.effects.push(e);
          w.state = "AWAITING_APPROVAL";
          return json(e.prepared);
        }
        case "approve": {
          const e = store.effects.find(
            (e: Item) =>
              e.prepared.id === input.id &&
              store.works.some(
                (w: Item) => w.id === e.prepared.work_id && visibleWork(w),
              ),
          );
          if (!e || session.profile.actor !== "Operator")
            return json(
              { error: "Choose Operator to explore the sample review flow." },
              403,
            );
          e.prepared.status = "APPROVED";
          e.prepared.lease = "preview-only";
          return json(e.prepared);
        }
        case "execute": {
          const e = store.effects.find(
            (e: Item) =>
              e.prepared.id === input.id &&
              e.prepared.status === "APPROVED" &&
              store.works.some(
                (w: Item) => w.id === e.prepared.work_id && visibleWork(w),
              ),
          );
          if (!e)
            return json({ error: "Review the sample proposal first" }, 409);
          if (e.receipt) return json(e.receipt);
          const a = {
            ...e.args,
            id: id(),
            owner: session.profile.actor,
            active: true,
            sha256: await sha(e.args.content),
            bytes: new TextEncoder().encode(e.args.content).length,
          };
          store.artifacts.push(a);
          store.works.find((w: Item) => w.id === e.prepared.work_id).state =
            "COMPLETED";
          e.receipt = {
            outcome: "PREVIEW_ONLY",
            artifact_id: a.id,
            verified_sha256: null,
          };
          return json(e.receipt);
        }
        case "cancel": {
          const w = store.works.find(
            (w: Item) => w.id === input.id && visibleWork(w),
          );
          if (!w) return json({ error: "Sample work not found" }, 404);
          w.state = "CANCELLED";
          return json(w);
        }
        case "withdraw": {
          const a = store.artifacts.find(
            (a: Item) =>
              a.id === input.id &&
              eligible(a) &&
              a.owner === session!.profile.actor,
          );
          if (!a) return json({ error: "Sample source not found" }, 404);
          a.active = false;
          return json({ withdrawn: true, preview: true });
        }
        case "memory-candidate": {
          if (!dependencies([input.source_artifact_id]))
            return json({ error: "Sample evidence not found" }, 404);
          const m = {
            ...input,
            id: id(),
            owner: session.profile.actor,
            state: "CANDIDATE",
          };
          store.memories.push(m);
          return json(m);
        }
        case "memory-approve":
        case "memory-revoke": {
          const m = store.memories.find(
            (m: Item) =>
              m.id === input.id && dependencies([m.source_artifact_id]),
          );
          if (!m) return json({ error: "Sample memory not found" }, 404);
          m.state = op === "memory-approve" ? "APPROVED" : "REVOKED";
          return json(m);
        }
      }
    return json(
      {
        error:
          "This action needs the live Aksara host. The hosted link is a disposable UI preview.",
      },
      409,
    );
  }
  return { request };
}
const preview = createPreview();
export const previewRequest = preview.request;
