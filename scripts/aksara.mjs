#!/usr/bin/env node
/** Small native-process development launcher. No Docker, WSL or Python baseline.
 * Production enrollment remains separate from the explicit development chooser. */
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import {
  mkdir,
  readFile,
  writeFile,
  unlink,
  access,
  open,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { randomBytes, timingSafeEqual } from "node:crypto";
import http from "node:http";
import { createWorkbench } from "../packages/workbench/server.mjs";
const exec = promisify(execFile);
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    state: { type: "string" },
    binary: { type: "string" },
    port: { type: "string", default: "7341" },
    "service-base": { type: "string", default: "7350" },
    simulator: { type: "boolean", default: false },
    background: { type: "boolean", default: false },
    open: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
    profile: { type: "string", default: "personal" },
    provider: { type: "string", default: "local" },
    model: { type: "string" },
    "cloud-consent": { type: "boolean", default: false },
    "expected-scope": { type: "string" },
  },
});
const command = positionals[0] || "help";
const state = path.resolve(
  values.state ||
    (process.platform === "win32"
      ? path.join(
          process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData/Local"),
          "Aksara",
        )
      : path.join(os.homedir(), ".local/share/aksara")),
);
const executable = process.platform === "win32" ? "aksarad.exe" : "aksarad";
const binary = path.resolve(
  values.binary ||
    path.join(
      root,
      existsSync(path.join(root, "bin", executable)) ? "bin" : "target/debug",
      executable,
    ),
);
const recordPath = path.join(state, "runtime.json"),
  lockPath = path.join(state, "instance.lock");
const port = Number(values.port),
  base = Number(values["service-base"]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const problem = (message) =>
  Object.assign(new Error(message), { publicMessage: message });
const childEnv = { ...process.env };
let startupStage = "command";
delete childEnv.AKSARA_FAULT;
delete childEnv.AKSARA_PI_FAULT;
async function secureDirectory() {
  startupStage = "state directory";
  await mkdir(state, { recursive: true, mode: 0o700 });
  if (process.platform === "win32") {
    startupStage = "Windows owner identity";
    const { stdout } = await exec(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value",
      ],
      { windowsHide: true },
    );
    const sid = stdout.trim();
    if (!/^S-1-\d+(?:-\d+)+$/.test(sid))
      throw new Error("Cannot establish Windows owner ACL");
    startupStage = "Windows owner ACL";
    await exec(
      "icacls.exe",
      [state, "/inheritance:r", "/grant:r", `*${sid}:(OI)(CI)F`],
      { windowsHide: true },
    );
  }
}
async function ownedFile(file, value) {
  await writeFile(file, JSON.stringify(value), { mode: 0o600, flag: "wx" });
}
async function record() {
  return JSON.parse(await readFile(recordPath, "utf8"));
}
async function control(action) {
  const current = await record();
  if (
    !Number.isInteger(current.control) ||
    current.control < 1024 ||
    current.control > 65535 ||
    !/^[a-f0-9]{64}$/.test(current.token)
  )
    throw new Error("Invalid local runtime record");
  const r = await fetch(`http://127.0.0.1:${current.control}/${action}`, {
    method: action === "stop" ? "POST" : "GET",
    headers: { authorization: `Bearer ${current.token}` },
    redirect: "error",
    signal: AbortSignal.timeout(6000),
  });
  if (!r.ok) throw new Error("Local runtime control rejected this request");
  return r.json();
}
async function init(folder, args) {
  startupStage = `initialize ${path.basename(folder)} custody`;
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const db = path.join(folder, "state.sqlite"),
    identity = path.join(folder, "identity.json");
  try {
    await access(db);
  } catch {
    const { stdout } = await exec(binary, ["--db", db, ...args], {
      env: childEnv,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    });
    await ownedFile(identity, JSON.parse(stdout));
  }
  // Missing credentials beside an existing DB fail closed: never create another identity.
  return { db, identity: JSON.parse(await readFile(identity, "utf8")) };
}
async function start() {
  if (
    !Number.isInteger(port) ||
    port < 1024 ||
    port > 65535 ||
    !Number.isInteger(base) ||
    base < 1024 ||
    base > 65530 ||
    [base, base + 1, base + 3].includes(port)
  )
    throw new Error("Choose non-overlapping valid loopback ports");
  await access(binary);
  startupStage = "PWA bundle";
  await access(path.join(root, "apps/platform/dist/index.html"));
  await secureDirectory();
  startupStage = "instance ownership";
  try {
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    try {
      process.kill(lock.pid, 0);
      throw new Error("An Aksara instance owns this state directory");
    } catch (e) {
      if (e.code !== "ESRCH") throw e;
    }
    await unlink(lockPath);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  await ownedFile(lockPath, { pid: process.pid });
  const children = [];
  let app,
    controller,
    stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    if (app) await app.close();
    for (const child of children) if (child.exitCode === null) child.kill();
    await Promise.all(
      children.map(async (child) => {
        if (child.exitCode !== null) return;
        await Promise.race([
          new Promise((r) => child.once("exit", r)),
          wait(2000),
        ]);
        if (child.exitCode === null) child.kill("SIGKILL");
      }),
    );
    if (controller) await new Promise((r) => controller.close(r));
    await unlink(recordPath).catch(() => {});
    await unlink(lockPath).catch(() => {});
  };
  for (const sig of ["SIGINT", "SIGTERM"]) process.once(sig, () => void stop());
  try {
    const community = await init(path.join(state, "community"), ["init-dev"]);
    const personal = await init(path.join(state, "personal"), [
      "init-personal",
      "--name",
      "Operator",
    ]);
    const profiles = [];
    const launch = (program, args, env = childEnv) => {
      const child = spawn(program, args, {
        cwd: root,
        env,
        stdio: ["ignore", "ignore", "ignore"],
        windowsHide: true,
      });
      child.once("error", () => {
        console.error("A required child process could not start");
        void stop();
        process.exitCode = 1;
      });
      child.once("exit", () => {
        if (!stopping) {
          console.error("A required child process stopped; stopping this host");
          void stop();
          process.exitCode = 1;
        }
      });
      children.push(child);
    };
    let simulatorToken;
    if (values.simulator) {
      const tokenFile = path.join(state, "simulator-token");
      try {
        simulatorToken = await readFile(tokenFile, "utf8");
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
        simulatorToken = randomBytes(32).toString("hex");
        await writeFile(tokenFile, simulatorToken, { flag: "wx", mode: 0o600 });
      }
      launch(
        process.platform === "win32" ? "python" : "python3",
        [
          path.join(root, "scripts/device_simulator.py"),
          "--db",
          path.join(state, "devices.sqlite"),
          "--port",
          String(base),
        ],
        { ...childEnv, AKSARA_SIM_TOKEN: simulatorToken },
      );
    }
    for (const [mode, data, servicePort] of [
      ["community", community, base + 1],
      ["personal", personal, base + 3],
    ]) {
      const person = data.identity.people[0],
        lane = data.identity.lanes.find(
          (l) =>
            l.lane.audience.length === 1 &&
            l.lane.audience[0] === person.principal.id,
        ).lane.id;
      const kernel = `http://127.0.0.1:${servicePort}`;
      startupStage = `start ${mode} authority`;
      launch(
        binary,
        [
          "--db",
          data.db,
          "serve",
          "--listen",
          `127.0.0.1:${servicePort}`,
          "--simulator",
          `127.0.0.1:${base}`,
        ],
        {
          ...childEnv,
          ...(simulatorToken ? { AKSARA_SIM_TOKEN: simulatorToken } : {}),
        },
      );
      let healthy = false;
      for (let i = 0; i < 100 && !stopping; i++) {
        try {
          if (
            (
              await fetch(kernel + "/health", {
                signal: AbortSignal.timeout(500),
              })
            ).ok
          ) {
            healthy = true;
            break;
          }
        } catch {}
        await wait(100);
      }
      if (!healthy) throw new Error("Authority did not become ready");
      profiles.push({
        id: mode,
        name: "Operator",
        actor: "Operator",
        mode,
        kernel,
        token: person.token,
        lane,
      });
    }
    if (stopping) throw new Error("Startup interrupted");
    startupStage = "workbench";
    app = await createWorkbench({
      profiles,
      port,
      providerStateDir: path.join(state, "providers"),
    });
    await new Promise((resolve, reject) => {
      app.server.once("error", reject);
      app.server.listen(port, "127.0.0.1", resolve);
    });
    const token = randomBytes(32).toString("hex"),
      started = new Date().toISOString();
    controller = http.createServer((req, res) => {
      const expected = `Bearer ${token}`,
        supplied = req.headers.authorization || "";
      if (
        supplied.length !== expected.length ||
        !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)) ||
        req.headers.origin
      ) {
        res.writeHead(403);
        res.end();
        return;
      }
      res.setHeader("cache-control", "no-store");
      res.setHeader("content-type", "application/json");
      if (req.method === "GET" && req.url === "/status")
        res.end(
          JSON.stringify({
            running: true,
            origin: `http://127.0.0.1:${port}`,
            started,
            simulator: values.simulator,
            development: true,
          }),
        );
      else if (req.method === "POST" && req.url === "/stop") {
        res.end(JSON.stringify({ stopping: true }));
        setImmediate(() => void stop());
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise((resolve, reject) => {
      controller.once("error", reject);
      controller.listen(0, "127.0.0.1", resolve);
    });
    await unlink(recordPath).catch((e) => {
      if (e.code !== "ENOENT") throw e;
    });
    await ownedFile(recordPath, {
      token,
      control: controller.address().port,
      port,
    });
    console.log(`Aksara development host: http://127.0.0.1:${port}`);
    console.log(
      "Personal and community databases are separate. Ctrl-C or aksara stop closes the host.",
    );
    if (values.open || command === "setup") {
      const url = `http://127.0.0.1:${port}`;
      const program =
        process.platform === "win32"
          ? "rundll32.exe"
          : process.platform === "darwin"
            ? "open"
            : "xdg-open";
      spawn(
        program,
        process.platform === "win32"
          ? ["url.dll,FileProtocolHandler", url]
          : [url],
        { stdio: "ignore", windowsHide: true },
      ).on("error", () =>
        console.log("Open the local address above in your browser."),
      );
    }
  } catch (e) {
    await stop();
    throw e;
  }
}
async function chat() {
  const status = await control("status"),
    origin = status.origin;
  if (!["personal", "community"].includes(values.profile))
    throw new Error("Choose personal or community explicitly");
  let cookie = "",
    scope = "";
  const api = async (route, input) => {
    const r = await fetch(origin + "/api/" + route, {
      method: input === undefined ? "GET" : "POST",
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(scope ? { "x-aksara-scope": scope } : {}),
        origin,
        "content-type": "application/json",
      },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }),
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (r.headers.has("set-cookie"))
      cookie = r.headers.get("set-cookie").split(";")[0];
    const value = await r.json();
    if (!r.ok) throw new Error(value.error || "Request failed");
    return value;
  };
  const session = await api("session", { profile: values.profile });
  scope = session.scope;
  const providers = await api("providers"),
    provider = values.provider;
  const model =
    values.model ||
    (provider === "local"
      ? providers.local.models[0]?.id
      : provider === "codex-chatgpt"
        ? providers.codex.models[0]?.id
        : provider === "opencode-free"
          ? providers.opencode.models[0]
          : providers.hosted?.[provider]?.models[0]?.id);
  const text = positionals.slice(1).join(" ");
  if (!text || !model)
    throw new Error("Provide a prompt and connect a model in the PWA first");
  if (provider !== "local" && !values["cloud-consent"])
    throw new Error("Hosted prompts require --cloud-consent for this turn");
  const run = await api("chat", {
    kind: values.background ? "background" : "interactive",
    text,
    provider,
    model,
    cloud_consent: values["cloud-consent"],
    source_ids: [],
    idempotency_key: randomBytes(24).toString("hex"),
  });
  let detachedWorker = values.background;
  try {
    if (values.background) {
      console.log(
        `Background task started: ${run.run.work_id}. Follow it in the web workspace.`,
      );
      return;
    }
    for (let i = 0; i < 190; i++) {
      const work = await api(
        `kernel/thread?id=${encodeURIComponent(run.run.work_id)}`,
      );
      if (work.state === "COMPLETED") {
        const messages = await api("kernel/messages");
        const message = messages.find(
          (m) => m.run.id === run.run.id && m.role === "assistant",
        );
        if (!message) throw new Error("No currently eligible reply");
        detachedWorker = messages.some(
          (m) =>
            m.run.parent_run_id === run.run.id &&
            !messages.some(
              (reply) =>
                reply.run.id === m.run.id && reply.role === "assistant",
            ),
        );
        console.log(message.text);
        if (detachedWorker)
          console.log("Background work continues in the web workspace.");
        return;
      }
      if (["FAILED", "CANCELLED"].includes(work.state))
        throw new Error("Model turn did not complete; inspect it in the PWA");
      await wait(1000);
    }
    throw new Error("Model turn did not finish within the CLI wait period");
  } finally {
    if (!detachedWorker) await api("logout", {}).catch(() => {});
  }
}
try {
  if (command === "start" || command === "setup") await start();
  else if (command === "stop")
    console.log(JSON.stringify(await control("stop")));
  else if (command === "doctor") {
    let runtime;
    try {
      runtime = await control("status");
    } catch {
      runtime = { running: false };
    }
    console.log(
      JSON.stringify(
        {
          platform: process.platform,
          architecture: process.arch,
          os_release: os.release(),
          memory_gib: Math.round(os.totalmem() / 1073741824),
          node: process.versions.node,
          state,
          binary,
          ...runtime,
        },
        null,
        2,
      ),
    );
  } else if (command === "chat") await chat();
  else if (command === "backup") {
    const destination = positionals[1];
    if (!destination || !["personal", "community"].includes(values.profile))
      throw new Error("Choose a destination and --profile personal|community");
    let running = false;
    try {
      running = (await control("status")).running;
    } catch {}
    if (running)
      throw problem(
        "Stop this host before taking an offline database backup: aksara stop",
      );
    const db = path.join(state, values.profile, "state.sqlite");
    await access(db);
    const { stdout } = await exec(
      binary,
      ["--db", db, "backup", path.resolve(destination)],
      { env: childEnv, windowsHide: true },
    );
    console.log(stdout.trim());
  } else
    console.log(
      "Aksara development CLI\n  setup | start [--open] [--simulator]\n  doctor [--json] | stop\n  chat [--background] [--profile personal|community] [--provider ID] [--model ID] [--cloud-consent] PROMPT\n  backup DESTINATION --profile personal|community\nGlobal: --state PATH --binary PATH --port 7341 --service-base 7350\nThe simulator alone needs Python. Hosted sign-in and keys are configured in the local PWA.",
    );
} catch (error) {
  console.error(
    error.publicMessage ||
      "Aksara could not complete this command. Check the host, selected model, state ownership and ports. Run doctor for local diagnostics.",
  );
  const code = String(error.code || "unknown");
  console.error(
    `Stage: ${startupStage}; error code: ${/^[A-Za-z0-9_]+$/.test(code) ? code : "unavailable"}`,
  );
  process.exitCode = 1;
}
