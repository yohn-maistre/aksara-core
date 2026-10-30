import { ArrowUpRight, Layers } from "lucide-react";
import { DuetCard, OutcomePill } from "../components/duet/kit";
import { PREVIEW } from "../transport";

import { key } from "./shared";
import { useWorkspace } from "./state";

export function ToolsView() {
  const {
    session,
    page,
    memories,
    candidates,
    packs,
    providers,
    me,
    approved,
    device,
    setDevice,
    api,
    refresh,
    run,
    openWork,
    working,
    navigate,
    privateLane,
  } = useWorkspace();
  if (!session) return null;
  return (
    <>
      <>
        <div className="page-heading">
          <div>
            <h1>Capabilities</h1>
            <p>Choose what Aksara can help you work with.</p>
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
              <div className="pack-screens">
                {p.screens.map((screen: Record<string, any>) => (
                  <button
                    key={screen.id}
                    onClick={() =>
                      navigate(
                        screen.slot === "library"
                          ? "Library"
                          : screen.slot === "today"
                            ? "Today"
                            : privateLane
                              ? "Ask"
                              : "Conversation",
                      )
                    }
                  >
                    <span>
                      {screen.slot === "library"
                        ? "Sources & documents"
                        : screen.slot === "today"
                          ? "Work on Home"
                          : "Conversation findings"}
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
              <details className="pack-details">
                <summary>Pack details</summary>
                <p>
                  {p.capabilities.join(", ")} · Declarations grant no execution
                  rights.
                </p>
              </details>
            </DuetCard>
          ))}
          {[
            ["Library lookup", "Working", "Search eligible original sources."],
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
                tone={!PREVIEW && status === "Working" ? "green" : "neutral"}
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
              Inspect the independent controller. Indications still need a
              scoped WorkObject, proposal and Operator approval.
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
            Only reviewed evidence excerpts enter governed memory. Withdrawal of
            the source blocks dependent reads.
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
    </>
  );
}
