import { memo } from "react";
import { parseSurfaceProgram } from "@aksara/contracts/surfaces";
import {
  createLibrary,
  defineComponent,
  Renderer,
} from "@openuidev/react-lang";
import { z } from "zod/v4";
import { DuetCard } from "./components/duet/kit";
import { ResourceSurface } from "./workspace/SurfacePort";
const EvidenceCard = defineComponent({
  name: "EvidenceCard",
  description: "A plain text finding, never executable content.",
  props: z.object({ title: z.string().max(160), body: z.string().max(4000) }),
  component: ({ props }) => (
    <DuetCard className="surface-card">
      <span className="eyebrow">Aksara · finding</span>
      <h3>{props.title}</h3>
      <p>{props.body}</p>
    </DuetCard>
  ),
});
const MetricCard = defineComponent({
  name: "MetricCard",
  description: "A labeled value and its qualification.",
  props: z.object({
    label: z.string().max(160),
    value: z.string().max(80),
    detail: z.string().max(1000),
  }),
  component: ({ props }) => (
    <DuetCard className="surface-card">
      <span className="eyebrow">{props.label}</span>
      <strong className="metric">{props.value}</strong>
      <p>{props.detail}</p>
    </DuetCard>
  ),
});
const resourceComponents = (
  ["WorkList", "SourceList", "DocumentPreview", "ProgressStatus"] as const
).map((name) =>
  defineComponent({
    name,
    description:
      "Read-only resources freshly resolved by the current Aksara host. IDs grant no authority.",
    props: z.object({
      title: z.string().max(160),
      ids: z.array(z.string().max(100)).min(1).max(12),
    }),
    component: ({ props }) => (
      <ResourceSurface component={name} title={props.title} ids={props.ids} />
    ),
  }),
);
const library = createLibrary({
  components: [EvidenceCard, MetricCard, ...resourceComponents],
  root: "EvidenceCard",
});
export function safeProgram(raw: string): string | null {
  return parseSurfaceProgram(raw)?.program ?? null;
}
export const MessageBody = memo(function MessageBody({
  text,
}: {
  text: string;
}) {
  return (
    <>
      {text.split(/(```openui\s[\s\S]*?```)/g).map((part, i) => {
        if (part.startsWith("```openui")) {
          const program = safeProgram(part.slice(9, -3).trim());
          return program ? (
            <Renderer key={i} response={program} library={library} />
          ) : (
            <pre key={i}>{part}</pre>
          );
        }
        return (
          <p className="message-text" key={i}>
            {part}
          </p>
        );
      })}
    </>
  );
});
