// Host-owned execution projection. Rust remains authoritative for every read,
// effect and result. No credentials or browser sessions are stored here.
import { DatabaseSync } from "node:sqlite";
import { mkdir, chmod } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { Mastra } from "@mastra/core/mastra";
import { noopLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";

export async function openResident(root) {
  await mkdir(root, { recursive: true, mode: 0o700 });
  const file = path.join(root, "resident.sqlite");
  const db = new DatabaseSync(file);
  await chmod(file, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
    CREATE TABLE IF NOT EXISTS choices(custody TEXT NOT NULL,provider TEXT NOT NULL,model TEXT NOT NULL,PRIMARY KEY(custody,provider));
    CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,binding TEXT NOT NULL,state TEXT NOT NULL,result TEXT);
    CREATE TABLE IF NOT EXISTS calls(run TEXT NOT NULL,id TEXT NOT NULL,hash TEXT NOT NULL,state TEXT NOT NULL,result TEXT,PRIMARY KEY(run,id));`);
  const storage = new LibSQLStore({
    id: "aksara-resident",
    url: pathToFileURL(path.join(root, "workflows.sqlite")).href,
    localPragmas: { cacheSize: -4096, mmapSize: 0 },
    maxRetries: 1,
  });
  await storage.init();
  await chmod(path.join(root, "workflows.sqlite"), 0o600);
  const mastra = new Mastra({ storage, logger: noopLogger });
  return {
    storage,
    mastra,
    workerModels(custody) {
      return Object.fromEntries(
        db
          .prepare("SELECT provider,model FROM choices WHERE custody=?")
          .all(custody)
          .map((r) => [r.provider, r.model]),
      );
    },
    setWorkerModel(custody, provider, model) {
      db.prepare(
        "INSERT INTO choices VALUES(?,?,?) ON CONFLICT(custody,provider) DO UPDATE SET model=excluded.model",
      ).run(custody, provider, model);
    },
    admit(binding) {
      // Explicit projection, never spread a profile containing its host token.
      const value = {
        id: binding.run.id,
        work_id: binding.run.work_id,
        profile: binding.profile,
        lane: binding.lane,
        epoch: binding.run.execution_epoch || (binding.run.execution_claimed ? 1 : 0),
        created: binding.run.created_ms,
        kind: binding.run.kind,
      };
      db.prepare(
        "INSERT INTO jobs VALUES(?,?,'running',NULL) ON CONFLICT(id) DO UPDATE SET binding=excluded.binding",
      ).run(value.id, JSON.stringify(value));
    },
    pending() {
      return db
        .prepare(
          "SELECT id,binding,state,result FROM jobs WHERE state IN ('running','ready') ORDER BY rowid LIMIT 100",
        )
        .all()
        .map((r) => ({ ...r, binding: JSON.parse(r.binding) }));
    },
    state(id, state, result = null) {
      db.prepare("UPDATE jobs SET state=?,result=? WHERE id=?").run(
        state,
        result,
        id,
      );
    },
    uncertain(id) {
      return !!db
        .prepare("SELECT 1 FROM calls WHERE run=? AND state='pending' LIMIT 1")
        .get(id);
    },
    journal(run) {
      return async (id, args, invoke) => {
        if (typeof id !== "string" || !id || id.length > 200)
          throw Error("Missing durable tool identity");
        const hash = createHash("sha256")
          .update(JSON.stringify(args))
          .digest("hex");
        const old = db
          .prepare("SELECT * FROM calls WHERE run=? AND id=?")
          .get(run, id);
        if (old) {
          if (old.hash !== hash || old.state !== "completed")
            throw Error("Tool outcome needs inspection; do not repeat");
          return JSON.parse(old.result);
        }
        const count = db
          .prepare("SELECT count(*) n FROM calls WHERE run=?")
          .get(run).n;
        if (count >= 12) throw Error("Task tool budget exhausted");
        db.prepare("INSERT INTO calls VALUES(?,?,?,'pending',NULL)").run(
          run,
          id,
          hash,
        );
        // An interrupted delivery remains pending. Recovery never guesses that
        // it did not happen; even a local committed artifact must not duplicate.
        const result = await invoke();
        const data = JSON.stringify(result ?? null);
        if (Buffer.byteLength(data) > 1048576)
          throw Error("Tool result exceeded budget");
        db.prepare(
          "UPDATE calls SET state='completed',result=? WHERE run=? AND id=?",
        ).run(data, run, id);
        return result;
      };
    },
    async close() {
      await mastra.shutdown({ drainTimeout: 1000 });
      await storage.close();
      db.close();
    },
  };
}
