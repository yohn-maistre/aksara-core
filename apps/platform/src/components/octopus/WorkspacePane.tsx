// Aksara port of Octopus WorkspacePaneManager's measured split-pane limits.
// The native runtime and command/focus ownership stay outside this component.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PanelResizeHandle } from "./PanelResizeHandle";
export function WorkspacePane({
  primary,
  secondary,
  label = "Context",
}: {
  primary: ReactNode;
  secondary: ReactNode;
  label?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0),
    [aside, setAside] = useState(280);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const compact = width < 720,
    maximum = Math.max(220, width - 380),
    resolved = Math.max(220, Math.min(maximum, aside));
  return (
    <div
      className="workspace-pane-manager"
      data-compact={compact}
      ref={root}
      style={{ "--pane-aside": `${resolved}px` } as React.CSSProperties}
    >
      <section className="workspace-pane-primary">{primary}</section>
      <aside className="workspace-pane-secondary" aria-label={label}>
        {!compact && (
          <PanelResizeHandle
            ariaLabel="Resize context pane"
            className="workspace-pane-separator"
            defaultSize={280}
            edge="left"
            maximum={maximum}
            minimum={220}
            value={resolved}
            onChange={setAside}
            onCommit={setAside}
            onOpenChange={() => {}}
            onResizingChange={() => {}}
            title="Drag to resize · arrow keys to adjust · double-click to reset"
          />
        )}
        {secondary}
      </aside>
    </div>
  );
}
