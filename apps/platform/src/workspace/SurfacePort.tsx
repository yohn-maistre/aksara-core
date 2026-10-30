import type {
  ResourceComponent,
  ResourcePlan,
} from "@aksara/contracts/surfaces";
import { ArrowUpRight, Circle, FileText } from "lucide-react";
import { DynamicIsland } from "../components/ui/dynamic-island";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type ResolvedSurface = {
  scope_ref: string;
  expires_at: number;
  resources: {
    id: string;
    title: string;
    state?: string;
    visibility?: string;
    content?: string;
    truncated?: boolean;
  }[];
};
/** Narrow, read-only host boundary for generated UI. No session mutation,
 * approval, arbitrary fetch, tool invocation or full workspace state. */
export type SurfacePort = {
  scope: string;
  resolve: (plan: ResourcePlan) => Promise<ResolvedSurface>;
  open: (component: ResourceComponent, id: string) => Promise<void>;
};
const Context = createContext<SurfacePort | null>(null);
export function SurfacePortProvider({
  port,
  children,
}: {
  port: SurfacePort;
  children: ReactNode;
}) {
  return <Context.Provider value={port}>{children}</Context.Provider>;
}
export function ResourceSurface({
  component,
  title,
  ids,
}: {
  component: ResourceComponent;
  title: string;
  ids: string[];
}) {
  const port = useContext(Context),
    [result, setResult] = useState<ResolvedSurface | null>(null),
    [error, setError] = useState("");
  const identity = JSON.stringify([port?.scope, component, title, ids]);
  const [binding, setBinding] = useState("");
  useEffect(() => {
    let active = true;
    setResult(null);
    setError("");
    setBinding(identity);
    if (!port) {
      setError("This surface needs a connected workspace.");
      return;
    }
    const refresh = async () => {
      try {
        const value = await port.resolve({
          protocol: "aksara.resource-surface/1",
          component,
          title,
          ids,
        });
        if (active) {
          if (value.scope_ref !== port.scope || value.expires_at <= Date.now())
            throw new Error("Expired surface");
          setResult(value);
          setError("");
        }
      } catch {
        if (active) {
          setResult(null);
          setError("Resources are unavailable in this context.");
        }
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [identity, port]);
  const current =
    binding === identity &&
    result &&
    result.scope_ref === port?.scope &&
    result.expires_at > Date.now()
      ? result
      : null;
  const body = (
    <section className="surface-card resource-surface">
      <h3>{title}</h3>
      {!current ? (
        <p role="status">{error || "Checking current access…"}</p>
      ) : component === "DocumentPreview" ? (
        <>
          <pre className="document-content">{current.resources[0].content}</pre>
          {current.resources[0].truncated && (
            <p>
              Preview shortened to 50,000 characters. Open the original in
              Library.
            </p>
          )}
        </>
      ) : (
        <ul>
          {current.resources.map((resource) => (
            <li key={resource.id}>
              <button
                className="resource-link"
                onClick={() =>
                  void port!.open(component, resource.id).catch(() => {
                    setResult(null);
                    setError("Resource unavailable. Refresh this context.");
                  })
                }
              >
                {component === "SourceList" ? (
                  <FileText size={16} />
                ) : (
                  <Circle size={14} />
                )}
                <span>
                  {resource.title}
                  <small>
                    {resource.state?.replaceAll("_", " ").toLowerCase() ||
                      resource.visibility}
                  </small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
  return component === "ProgressStatus" ? (
    <DynamicIsland expanded>{body}</DynamicIsland>
  ) : (
    body
  );
}
