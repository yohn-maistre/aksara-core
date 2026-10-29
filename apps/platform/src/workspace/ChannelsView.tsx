import { ArrowUpRight, Cpu, Hash } from "lucide-react";
import { DuetCard } from "../components/duet/kit";

import { useWorkspace } from "./state";

export function ChannelsView() {
  const {
    session,
    setSession,
    page,
    setPage,
    busy,
    scope,
    artifacts,
    channelName,
    setChannelName,
    api,
    accept,
    run,
    lane,
    privateLane,
  } = useWorkspace();
  if (!session) return null;
  return (
    <>
      <>
        <div className="page-heading">
          <div>
            <h1>Channels</h1>
            <p>
              Channels keep a conversation, its work, and its artifacts in the
              same context.
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
                <p>{l.lane.audience.length} members · shared conversation</p>
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
            The new conversation inherits the audience of your current context:{" "}
            {privateLane ? "only you" : `${lane?.lane.audience.length} members`}
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
          Channel computers have not been provisioned. Conversation access does
          not grant a shell.
        </div>
      </>
    </>
  );
}
