import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useWorkspace } from "./state";
import { useWorkingSurface } from "./useWorkingSurface";
import type { Data } from "./shared";
function ArtifactNode({ data }: NodeProps) {
  const w = useWorkspace();
  const artifact = w.artifacts.find((a) => a.id === data.artifactId);
  return (
    <div className="table-artifact">
      <FileText size={22} />
      <small>Source</small>
      <strong>{artifact?.title || "Source unavailable"}</strong>
      <button
        className="nodrag text-button"
        disabled={!artifact}
        onClick={() =>
          void w.run(async () => {
            await w.beforeNavigate.current?.();
            w.setDetail(
              await w.api(
                `kernel/artifact?id=${encodeURIComponent(artifact!.id)}`,
              ),
            );
          })
        }
      >
        Open document <ArrowUpRight size={14} />
      </button>
    </div>
  );
}
const nodeTypes = { artifact: ArtifactNode };
export function CanvasView() {
  const { activeEntry } = useWorkspace();
  const [id] = useState(() => `table_${crypto.randomUUID()}`);
  const initial =
    activeEntry?.kind === "canvas"
      ? activeEntry
      : {
          id,
          revision: 0,
          kind: "canvas",
          title: "Shared table",
          content: "",
          body: { nodes: [] },
          source_ids: [],
        };
  return <WorkingTable key={initial.id} initial={initial} />;
}
function WorkingTable({ initial }: { initial: Data }) {
  const w = useWorkspace();
  const { value, change, flush, status, problem } = useWorkingSurface(initial);
  const [pick, setPick] = useState("");
  const eligible = w.artifacts.filter(
    (a) => w.privateLane || a.visibility !== "private",
  );
  const ids = new Set(eligible.map((a) => a.id));
  const nodes: Node[] = (value.body.nodes || [])
    .filter((n: Node) => ids.has(String(n.data.artifactId)))
    .map((n: Node) => ({ ...n, type: "artifact" }));
  const update = (next: Node[]) => {
    const source_ids = Array.from(
      new Set([
        ...value.source_ids,
        ...next.map((n) => String(n.data.artifactId)),
      ]),
    );
    const content =
      `# ${value.title}\n\n` +
      next
        .map(
          (n) =>
            `- ${w.artifacts.find((a) => a.id === n.data.artifactId)?.title || "Source"}`,
        )
        .join("\n");
    change({ body: { nodes: next }, content, source_ids });
  };
  const help = () =>
    void w.run(async () => {
      await flush();
      w.setAttached(value.source_ids);
      w.setDraft(
        `Help us work through the material on “${value.title}”. Compare the attached sources, identify gaps, and prepare a useful brief.`,
      );
      w.navigate(w.privateLane ? "Ask" : "Conversation");
    });
  return (
    <div className="table-plane">
      <header className="document-topbar">
        <button className="text-button" onClick={() => w.navigate("Library")}>
          <ArrowLeft size={16} />
          Library
        </button>
        <input
          aria-label="Table title"
          value={value.title}
          maxLength={256}
          onChange={(e) => change({ title: e.target.value })}
        />
        <span role="status">{status}</span>
        <button className="secondary" onClick={() => void w.run(flush)}>
          Save table
        </button>
      </header>
      <div className="table-tools">
        <span>
          <Users size={15} />
          {w.privateLane ? "Private table" : w.lane?.name}
        </span>
        <select
          aria-label="Source to add to table"
          value={pick}
          onChange={(e) => setPick(e.target.value)}
        >
          <option value="">Choose a source…</option>
          {eligible.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
        <button
          className="secondary"
          disabled={!pick || nodes.length >= 8}
          onClick={() => {
            update([
              ...nodes,
              {
                id: crypto.randomUUID(),
                type: "artifact",
                position: {
                  x: 100 + (nodes.length % 3) * 300,
                  y: 100 + Math.floor(nodes.length / 3) * 210,
                },
                data: { artifactId: pick },
              },
            ]);
            setPick("");
          }}
        >
          <Plus size={16} />
          Add to table
        </button>
        <button
          className="text-button"
          disabled={!nodes.length || w.busy}
          onClick={help}
        >
          <Sparkles size={16} />
          Aksara, work with these
        </button>
      </div>
      {problem && (
        <p className="draft-problem" role="alert">
          {problem} Reopen this table to load the saved version. Unsaved changes
          have not overwritten it.
        </p>
      )}
      <div className="table-canvas">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={(changes: NodeChange[]) =>
            update(applyNodeChanges(changes, nodes))
          }
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          deleteKeyCode={null}
          colorMode={w.resolvedTheme === "dark" ? "dark" : "light"}
        >
          <Background gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
        {!nodes.length && (
          <div className="table-empty">
            <h2>Bring the work together.</h2>
            <p>
              Add a few sources, arrange them, then invite Aksara to work
              through them with you.
            </p>
            <button
              className="text-button"
              onClick={() => w.navigate("Library")}
            >
              Find something in Library <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
