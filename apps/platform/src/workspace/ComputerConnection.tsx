import { useEffect, useState } from "react";
import { Monitor, RefreshCw } from "lucide-react";
import { DuetCard } from "../components/duet/kit";
import { PREVIEW } from "../transport";
import { useWorkspace } from "./state";
import type { Data } from "./shared";
export function ComputerConnection() {
  const { api, run, privateLane, session } = useWorkspace();
  const [computer, setComputer] = useState<Data | null>(null);
  const [windowId, setWindowId] = useState("");
  const [actions, setActions] = useState(false);
  const [headed, setHeaded] = useState(false);
  const [consent, setConsent] = useState(false);
  const load = async () => {
    const value = await api("computer");
    setComputer(value);
    setWindowId("");
    setConsent(false);
  };
  useEffect(() => {
    if (!PREVIEW) void run(load);
  }, [session?.scope]);
  return (
    <DuetCard className="settings-card computer-connection">
      <h2>
        <Monitor size={19} /> Computer
      </h2>
      {PREVIEW ? (
        <p>Native computer connection is available on a local host.</p>
      ) : !privateLane ? (
        <p>
          Shared channels need their own isolated computer. Your personal
          desktop stays separate.
        </p>
      ) : (
        <>
          <p>
            Connect one window for ten minutes. Local models can observe it;
            optionally allow up to twenty clicks or field edits.
          </p>
          <button className="text-button" onClick={() => void run(load)}>
            <RefreshCw size={14} /> Refresh windows
          </button>
          {!computer ? (
            <p>Checking the local driver…</p>
          ) : !computer.configured ? (
            <p>
              Install Vercel agent-desktop 1.0.2 and set AKSARA_DESKTOP_BINARY
              to its absolute path before starting Aksara.
            </p>
          ) : (
            <>
              {computer.grant && (
                <div className="notice">
                  <strong>{computer.grant.window.app}</strong> ·{" "}
                  {computer.grant.window.allow_actions
                    ? "Observe and interact"
                    : "Observe only"}{" "}
                  ·{" "}
                  {Math.max(
                    0,
                    Math.ceil(
                      (computer.grant.expires_at * 1000 - Date.now()) / 60000,
                    ),
                  )}{" "}
                  min remaining
                  <button
                    className="text-button"
                    onClick={() =>
                      void run(async () => {
                        await api("computer/stop", { id: computer.grant.id });
                        await load();
                      })
                    }
                  >
                    Stop computer access
                  </button>
                </div>
              )}
              <label>
                Accessible window
                <select
                  aria-label="Computer window"
                  value={windowId}
                  onChange={(e) => {
                    setWindowId(e.target.value);
                    setConsent(false);
                  }}
                >
                  <option value="">Choose a window</option>
                  {(computer.windows || []).map((w: Data) => (
                    <option value={w.id} key={w.id}>
                      {w.app_name} · {w.title}
                    </option>
                  ))}
                </select>
              </label>
              {!computer.windows?.length && (
                <p>
                  No accessible windows found. Run Aksara in your signed-in
                  desktop session and check the driver's accessibility
                  permissions.
                </p>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={actions}
                  onChange={(e) => {
                    setActions(e.target.checked);
                    setConsent(false);
                  }}
                />{" "}
                Allow clicks and field edits
              </label>
              {actions && (
                <label>
                  <input
                    type="checkbox"
                    checked={headed}
                    onChange={(e) => {
                      setHeaded(e.target.checked);
                      setConsent(false);
                    }}
                  />{" "}
                  Allow keyboard focus and physical typing in this window
                </label>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                I permit Aksara to read this window and, if enabled, interact
                with it. This is my own desktop, not a sandbox; authenticated
                apps can affect external accounts.
              </label>
              <button
                className="secondary"
                disabled={!windowId || !consent}
                onClick={() =>
                  void run(async () => {
                    await api("computer/connect", {
                      window_id: windowId,
                      allow_actions: actions,
                      allow_headed: headed,
                      acknowledge: true,
                    });
                    await load();
                  })
                }
              >
                Connect selected window
              </button>
            </>
          )}
        </>
      )}
    </DuetCard>
  );
}
