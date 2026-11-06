import { readFile } from "node:fs/promises";
import { validatePack, MemoryRecallQuery } from "@aksara/contracts";
import {createMemoryService} from "@aksara/memory";
import {createTool} from "@mastra/core/tools";
import { MCPServer } from "@mastra/mcp";
import { noopLogger } from "@mastra/core/logger";
import { fileURLToPath } from "node:url";
import { KernelReadPort } from "./read-port.mjs";
const idPattern = /^[A-Za-z0-9._:-]{1,100}$/;
const unavailable = () => new Error("Resource unavailable in this context");
/** Stdio only: a local, explicitly configured principal. An MCP resource ID,
 * subscription, prior list response or consumer model is never an access grant. */
export function createResourceGateway(port, { packs = [] } = {}) {
  const manifests = packs.map(validatePack);
  const memory=createMemoryService({load:()=>port.read("knowledge")});
  const uri = (kind, id) => `aksara://${kind}/${encodeURIComponent(id)}`;
  const resources = {
    async listResources() {
      try {
        // One authoritative read per collection: never combine rows read before
        // and after a membership change into one metadata snapshot.
        const library = await port.read("library");
        return [
          ...library.slice(0, 100).map((a) => ({
            uri: uri("library", a.id),
            name: a.title,
            mimeType: "application/json",
            description:
              "Currently eligible Library source; access is checked again on read.",
          })),
          ...manifests.map((pack) => ({
            uri: uri("packs", pack.id),
            name: pack.title,
            mimeType: "application/json",
            description:
              "Bundled capability pack. Descriptive only; this grants no authority.",
          })),
          {
            uri: "aksara://workspace/knowledge",
            name: "Knowledge and procedural memory",
            mimeType: "application/json",
            description:
              "Current source-linked reviewed knowledge and provisional notes. Fresh scope and withdrawal checks on every read.",
          },
          {
            uri: "aksara://workspace/work",
            name: "Work in this context",
            mimeType: "application/json",
            description:
              "Read current eligible work. Counts and titles are resolved on read.",
          },
        ];
      } catch {
        throw unavailable();
      }
    },
    async getResourceContent({ uri: address }) {
      try {
        const parsed = new URL(address),
          kind = parsed.hostname,
          id = decodeURIComponent(parsed.pathname.slice(1));
        if (
          address !== uri(kind, id) ||
          parsed.protocol !== "aksara:" ||
          parsed.username ||
          parsed.password ||
          parsed.port ||
          parsed.search ||
          parsed.hash ||
          !idPattern.test(id) ||
          !["library", "workspace", "packs"].includes(kind) ||
          (kind === "workspace" && !["work", "knowledge"].includes(id))
        )
          throw unavailable();
        if (kind === "packs") {
          await port.read("me");
          const manifest = manifests.find((pack) => pack.id === id);
          if (!manifest) throw unavailable();
          return { text: JSON.stringify(manifest) };
        }
        if (kind === "workspace") {
          if (id === "knowledge")
            return { text: JSON.stringify(await port.read("knowledge")) };
          const work = await port.read("threads");
          return {
            text: JSON.stringify({
              protocol: "aksara.resource/1",
              kind: "work-list",
              work: work.slice(0, 100).map((w) => ({
                id: w.id,
                request: w.request,
                state: w.state,
                revision: w.revision,
                generation: w.generation,
              })),
            }),
          };
        }
        if (kind === "library") {
          const source = await port.read("artifact", id);
          const text = String(source.content ?? "");
          return {
            text: JSON.stringify({
              protocol: "aksara.resource/1",
              kind: "source-preview",
              id: source.artifact.id,
              title: source.artifact.title,
              content: text.slice(0, 50000),
              truncated: text.length > 50000,
            }),
          };
        }
        throw unavailable();
      } catch {
        throw unavailable();
      }
    },
  };
  const server = new MCPServer({
    id: "aksara-resources",
    name: "Aksara governed resources",
    version: "0.1.0",
    tools: {
      memory_search:createTool({
        id:"memory_search",
        description:"Read-only search of currently authorized communal memory using embedded LongMemory. Returns cited originals and reviewed/provisional status. Rechecks scope and withdrawal before returning. No write, approval, publication or tool execution.",
        inputSchema:MemoryRecallQuery,
        execute:input=>memory.recall(input),
      }),
    },
    resources,
  });
  server.__setLogger(noopLogger);
  const close=server.close.bind(server);
  server.close=async()=>{await memory.close();await close();};
  return { server, resources, memory };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.umask(0o077);
    const port = new KernelReadPort({
      url: process.env.AKSARA_URL,
      token: process.env.AKSARA_TOKEN,
      lane: process.env.AKSARA_LANE,
    });
    const pack = JSON.parse(
      await readFile(
        new URL("../../packs/knowledge/pack.json", import.meta.url),
        "utf8",
      ),
    );
    const { server } = createResourceGateway(port, { packs: [pack] });
    await server.startStdio();
    for (const signal of ["SIGINT", "SIGTERM"])
      process.once(
        signal,
        () => void server.close().finally(() => process.exit(0)),
      );
  } catch {
    console.error(
      "Aksara MCP requires explicit local authority credentials and a lane.",
    );
    process.exitCode = 1;
  }
}
