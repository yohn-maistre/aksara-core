import {
  createLibrary,
  defineComponent,
  Renderer,
} from "@openuidev/react-lang";
import { z } from "zod/v4";
import { DuetCard } from "./components/duet/kit";
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
const library = createLibrary({
  components: [EvidenceCard, MetricCard],
  root: "EvidenceCard",
});
// The initial Pack profile accepts a single text-only component. Query, Mutation,
// URLs, actions, HTML, imports, expressions and nested programs are not admitted.
export function safeProgram(raw: string): string | null {
  if (raw.length > 7000) return null;
  const m = raw
    .trim()
    .match(/^root\s*=\s*(EvidenceCard|MetricCard)\(([\s\S]*)\)\s*;?$/);
  if (!m) return null;
  try {
    const args = JSON.parse(`[${m[2]}]`);
    const max = m[1] === "EvidenceCard" ? [160, 4000] : [160, 80, 1000];
    if (
      !Array.isArray(args) ||
      args.length !== max.length ||
      args.some((v, i) => typeof v !== "string" || v.length > max[i])
    )
      return null;
    return `root = ${m[1]}(${args.map((v: string) => JSON.stringify(v)).join(", ")})`;
  } catch {
    return null;
  }
}
export function MessageBody({ text }: { text: string }) {
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
}
