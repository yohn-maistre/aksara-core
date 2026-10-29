/** Password-protected development gateway. Not production IAM.
 * Internal authorities and credentials stay on loopback. No arbitrary upstreams.
 */
import http from "node:http";
import { readFileSync } from "node:fs";
import { createHash, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
const origin = new URL(
  process.env.AKSARA_PUBLIC_ORIGIN || "http://127.0.0.1:8080",
);
if (
  origin.pathname !== "/" ||
  origin.search ||
  origin.hash ||
  origin.username ||
  origin.password ||
  !["http:", "https:"].includes(origin.protocol)
)
  throw new Error("Configure one exact public origin");
if (
  origin.protocol === "http:" &&
  !["127.0.0.1", "localhost"].includes(origin.hostname)
)
  throw new Error("Remote test hosts require HTTPS");
const password = readFileSync(
  process.env.AKSARA_TEST_PASSWORD_FILE || "/run/secrets/aksara-test-password",
  "utf8",
).trim();
if (password.length < 24)
  throw new Error("Use a test-host password of at least 24 characters");
const digest = (s) => createHash("sha256").update(s).digest();
const expected = digest("aksara:" + password);
const child = spawn(
  "python3",
  ["scripts/start_platform.py", "--state", "/data", "--binary", "bin/aksarad"],
  { stdio: "inherit", env: { ...process.env, AKSARA_TEST_HOST: "1" } },
);
function reject(res, status, error) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ error }));
}
const server = http.createServer(async (req, res) => {
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-content-type-options", "nosniff");
  if (req.url === "/healthz" && req.method === "GET") {
    try {
      const responses = await Promise.all(
        [
          "http://127.0.0.1:7341/api/profiles",
          ...[7351, 7353, 7355, 7357].map(
            (port) => `http://127.0.0.1:${port}/health`,
          ),
        ].map((url) => fetch(url, { signal: AbortSignal.timeout(1500) })),
      );
      const ready = responses.every((r) => r.ok);
      res.writeHead(ready ? 200 : 503, { "content-type": "application/json" });
      res.end(JSON.stringify({ ready, development_test_host: true }));
    } catch {
      res.writeHead(503);
      res.end('{"ready":false}');
    }
    return;
  }
  const encoded = req.headers.authorization?.startsWith("Basic ")
    ? req.headers.authorization.slice(6)
    : "";
  if (
    !timingSafeEqual(
      expected,
      digest(Buffer.from(encoded, "base64").toString("utf8")),
    )
  ) {
    res.writeHead(401, {
      "www-authenticate":
        'Basic realm="Aksara development test host", charset="UTF-8"',
    });
    res.end("Development test-host credentials required");
    return;
  }
  if (
    req.headers.host !== origin.host ||
    !req.url?.startsWith("/") ||
    req.url.startsWith("//")
  ) {
    reject(res, 403, "Origin mismatch");
    return;
  }
  if (
    !["GET", "HEAD"].includes(req.method) &&
    req.headers.origin !== origin.origin
  ) {
    reject(res, 403, "Origin mismatch");
    return;
  }
  const parsed = new URL(req.url, origin);
  if (parsed.origin !== origin.origin) {
    reject(res, 403, "Origin mismatch");
    return;
  }
  const headers = { ...req.headers, host: "127.0.0.1:7341" };
  delete headers.authorization;
  delete headers["x-forwarded-host"];
  delete headers["x-forwarded-proto"];
  if (req.headers.origin) {
    if (req.headers.origin !== origin.origin) {
      reject(res, 403, "Origin mismatch");
      return;
    }
    headers.origin = "http://127.0.0.1:7341";
  }
  const upstream = http.request(
    {
      host: "127.0.0.1",
      port: 7341,
      path: parsed.pathname + parsed.search,
      method: req.method,
      headers,
    },
    (r) => {
      const out = { ...r.headers };
      if (origin.protocol === "https:" && out["set-cookie"])
        out["set-cookie"] = out["set-cookie"].map((c) => c + "; Secure");
      res.writeHead(r.statusCode, out);
      r.pipe(res);
    },
  );
  upstream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(503, { "content-type": "application/json" });
      res.end('{"error":"Development host is starting or unavailable"}');
    } else res.end();
  });
  req.on("aborted", () => upstream.destroy());
  req.pipe(upstream);
});
server.listen(8080, "0.0.0.0", () =>
  console.log("Protected Aksara test gateway listening on port 8080"),
);
function stop() {
  server.close();
  if (child.exitCode === null) child.kill("SIGINT");
  setTimeout(() => process.exit(0), 5000).unref();
}
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, stop);
child.once("exit", (code) => {
  server.close();
  process.exitCode = code || 0;
});
