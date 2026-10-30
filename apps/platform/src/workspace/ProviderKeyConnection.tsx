import { useEffect, useState } from "react";
import { PREVIEW } from "../transport";
import { useWorkspace } from "./state";
import { providerName } from "./provider-options";
export function ProviderKeyConnection({ id }: { id: string }) {
  const { api, providers, setProviders, run, busy, session } = useWorkspace();
  const [secret, setSecret] = useState(""),
    [acknowledged, setAcknowledged] = useState(false);
  useEffect(() => {
    setSecret("");
    setAcknowledged(false);
  }, [id, session?.scope]);
  const entry = providers.hosted?.[id];
  return (
    <section className="connection-controls">
      <h3>{providerName(id)}</h3>
      <p>
        {entry?.notice ||
          "Connect your own account. Free tiers have account-specific limits and data terms."}
      </p>
      {entry?.url && (
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="text-button"
        >
          Get a key from {providerName(id)} ↗
        </a>
      )}
      <p>
        {entry?.connected
          ? "Key saved for your identity in this space. Send a test message to verify access."
          : "No key saved for your identity in this space."}
      </p>
      <label className="field-label">
        API key
        <input
          aria-label={`${providerName(id)} API key`}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          maxLength={4096}
          disabled={PREVIEW || busy}
        />
      </label>
      <label className="consent">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          disabled={PREVIEW || busy}
        />
        I checked my account's free-tier or billing settings and the provider's
        data terms.
      </label>
      <div className="actions">
        <button
          className="secondary"
          disabled={PREVIEW || busy || !secret || !acknowledged}
          onClick={() =>
            void run(async () => {
              try {
                await api("providers/key", {
                  provider: id,
                  key: secret,
                  terms_acknowledged: true,
                });
                setProviders(await api("providers"));
              } finally {
                setSecret("");
                setAcknowledged(false);
              }
            })
          }
        >
          Save key on this host
        </button>
        {entry?.connected && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await api("providers/key", { provider: id, remove: true });
                setProviders(await api("providers"));
              })
            }
          >
            Disconnect {providerName(id)}
          </button>
        )}
      </div>
      <p className="composer-note">
        Keys stay host-side. The browser cannot read them back. Host files still
        require OS owner protection.
      </p>
    </section>
  );
}
