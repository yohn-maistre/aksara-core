import { useState } from "react";
import { parseVisual, type Visual } from "@aksara/contracts/visuals";
import { useWorkspace } from "./state";
import { ActionButton } from "./controls";
import type { Data } from "./shared";
export function VisualArtifact({
  content,
  artifact,
}: {
  content: string;
  artifact: Data;
}) {
  const w = useWorkspace();
  const visual = parseVisual(content);
  const [problem, setProblem] = useState("");
  if (!visual) return null;
  const edit = async () => {
    try {
      if (visual.kind !== "diagram") return;
      (
        window as Window & { EXCALIDRAW_ASSET_PATH?: string }
      ).EXCALIDRAW_ASSET_PATH = "/excalidraw/";
      const { convertToExcalidrawElements } = await import(
        "@excalidraw/excalidraw"
      );
      const nodes = new Map(visual.nodes.map((n) => [n.id, n]));
      const raw: any[] = [
        ...visual.nodes.map((n) => ({
          id: n.id,
          type: n.shape,
          x: n.x,
          y: n.y,
          width: 180,
          height: 68,
          roughness: 0,
          strokeColor: "#6f635c",
          backgroundColor: "transparent",
          label: { text: n.label, fontSize: 16, fontFamily: 2 },
        })),
        ...visual.edges.map((e) => {
          const a = nodes.get(e.from)!,
            b = nodes.get(e.to)!;
          return {
            type: "arrow",
            x: a.x + 90,
            y: a.y + 68,
            points: [
              [0, 0],
              [b.x - a.x, b.y - a.y - 68],
            ],
            roughness: 0,
            strokeColor: "#6f635c",
            ...(e.label
              ? { label: { text: e.label, fontSize: 14, fontFamily: 2 } }
              : {}),
          };
        }),
      ];
      await w.beforeNavigate.current?.();
      w.setDetail(null);
      w.setActiveEntry({
        id: `drawing_${crypto.randomUUID()}`,
        revision: 0,
        kind: "drawing",
        title: artifact.title,
        content: visual.nodes.map((n) => n.label).join("\n"),
        body: { elements: convertToExcalidrawElements(raw), files: {} },
        source_ids: [artifact.id],
      });
      w.setPage("Drawing");
    } catch (e) {
      setProblem((e as Error).message);
    }
  };
  return (
    <section
      className="visual-artifact"
      aria-label={`${visual.kind === "diagram" ? "Diagram" : "Bar chart"}: ${artifact.title}`}
    >
      <div className="section-title">
        <span className="status-chip">Unreviewed visual draft</span>
        {visual.kind === "diagram" && (
          <ActionButton variant="outline" onClick={() => void edit()}>
            Edit drawing
          </ActionButton>
        )}
      </div>
      <VisualDrawing visual={visual} />
      {problem && <p role="alert">{problem}</p>}
      <details>
        <summary>Exact visual data</summary>
        <pre className="document-content">{content}</pre>
      </details>
    </section>
  );
}
function VisualDrawing({ visual }: { visual: Visual }) {
  if (visual.kind === "bar-chart") {
    const max = Math.max(1, ...visual.data.map((d) => d.value));
    return (
      <figure>
        <svg
          viewBox={`0 0 640 ${visual.data.length * 44 + 26}`}
          role="img"
          aria-label={`Bar chart in ${visual.unit || "units"}`}
        >
          {visual.data.map((d, i) => (
            <g key={i} transform={`translate(0,${i * 44 + 14})`}>
              <text x={0} y={17} fill="currentColor" fontSize={13}>
                {d.label.slice(0, 22)}
                <title>{d.label}</title>
              </text>
              <rect
                x={180}
                y={0}
                width={Math.max(0, (320 * d.value) / max)}
                height={26}
                rx={3}
                fill="var(--green)"
              />
              <text x={518} y={17} fill="currentColor" fontSize={12}>
                {d.value.toLocaleString()} {visual.unit}
              </text>
            </g>
          ))}
        </svg>
        <table className="sr-only">
          <caption>Chart data</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Value {visual.unit}</th>
            </tr>
          </thead>
          <tbody>
            {visual.data.map((d, i) => (
              <tr key={i}>
                <th>{d.label}</th>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    );
  }
  const nodes = new Map(visual.nodes.map((n) => [n.id, n]));
  const width = Math.max(...visual.nodes.map((n) => n.x + 200));
  const height = Math.max(...visual.nodes.map((n) => n.y + 100));
  return (
    <figure>
      <svg
        viewBox={`-12 -12 ${width + 24} ${height + 24}`}
        role="img"
        aria-label={visual.nodes.map((n) => n.label).join("; ")}
      >
        {visual.edges.map((e, i) => {
          const a = nodes.get(e.from)!,
            b = nodes.get(e.to)!;
          return (
            <g key={i}>
              <path
                d={`M${a.x + 90},${a.y + 68} L${b.x + 90},${b.y}`}
                stroke="currentColor"
                opacity=".45"
                fill="none"
              />
              <circle cx={b.x + 90} cy={b.y} r={3} fill="currentColor" />
              {e.label && (
                <text
                  x={(a.x + b.x) / 2 + 96}
                  y={(a.y + b.y + 68) / 2}
                  fontSize={12}
                  fill="currentColor"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {visual.nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            <title>{n.label}</title>
            {n.shape === "ellipse" ? (
              <ellipse
                cx={90}
                cy={34}
                rx={90}
                ry={34}
                fill="var(--panel)"
                stroke="var(--line)"
              />
            ) : n.shape === "diamond" ? (
              <polygon
                points="90,0 180,34 90,68 0,34"
                fill="var(--panel)"
                stroke="var(--line)"
              />
            ) : (
              <rect
                width={180}
                height={68}
                rx={6}
                fill="var(--panel)"
                stroke="var(--line)"
              />
            )}
            <text
              x={90}
              y={39}
              textAnchor="middle"
              fontSize={13}
              fill="currentColor"
            >
              {n.label.length > 23 ? n.label.slice(0, 22) + "…" : n.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
