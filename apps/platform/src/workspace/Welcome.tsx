import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { PREVIEW } from "../transport";

import { Mark, PreviewNotice } from "./shared";
import { useWorkspace } from "./state";
export function Welcome() {
  const { profiles, session, error, busy, api, accept, run } = useWorkspace();
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
}
