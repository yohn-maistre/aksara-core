// Launch the public registry MCP in the app workspace, independent of the host's
// working directory. The shadcn 4.23.0 MCP registry lookup used process cwd in
// our protocol test even when its --cwd CLI option was supplied.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const env = { ...process.env };
// Preserve the managed proxy path and CA trust. Node fetch needs environment
// proxy support; the project already requires Node 24.19+.
if (
  (env.HTTPS_PROXY || env.HTTP_PROXY) &&
  !env.NODE_OPTIONS?.includes("--use-env-proxy")
)
  env.NODE_OPTIONS = `${env.NODE_OPTIONS ?? ""} --use-env-proxy`.trim();

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["--yes", "shadcn@4.23.0", "mcp"],
  {
    cwd: fileURLToPath(new URL("../apps/platform", import.meta.url)),
    stdio: "inherit",
    env,
    // Windows invokes the fixed npx.cmd command through its command processor.
    // No user-provided command or argument is interpolated.
    shell: process.platform === "win32",
  },
);
child.on("error", (error) => {
  process.stderr.write(`Could not start shadcn MCP: ${error.message}\n`);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
