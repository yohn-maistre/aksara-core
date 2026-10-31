import { useEffect, useRef, useState } from "react";
/** Small, non-interactive depth cues. No retained screenshot of private content. */
export function ScrollEdges({ selector }: { selector: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [edge, setEdge] = useState({
    top: false,
    bottom: false,
    left: 0,
    width: 0,
    y: 0,
    height: 0,
  });
  useEffect(() => {
    const parent = anchor.current?.parentElement;
    const target = parent?.querySelector<HTMLElement>(selector);
    if (!target || !parent) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const p = parent.getBoundingClientRect(),
          r = target.getBoundingClientRect();
        const next = {
          top: target.scrollTop > 8,
          bottom:
            target.scrollHeight - target.clientHeight - target.scrollTop > 8,
          left: r.left - p.left,
          width: target.clientWidth,
          y: r.top - p.top,
          height: target.clientHeight,
        };
        setEdge((old) =>
          Object.keys(next).every(
            (k) => old[k as keyof typeof old] === next[k as keyof typeof next],
          )
            ? old
            : next,
        );
      });
    };
    const resize = new ResizeObserver(update);
    resize.observe(target);
    const mutation = new MutationObserver(update);
    mutation.observe(target, { childList: true, subtree: true });
    target.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      target.removeEventListener("scroll", update);
    };
  }, [selector]);
  return (
    <>
      <span
        ref={anchor}
        aria-hidden
        className="scroll-depth scroll-depth-top"
        data-visible={edge.top}
        style={{ left: edge.left, width: edge.width, top: edge.y }}
      />
      <span
        aria-hidden
        className="scroll-depth scroll-depth-bottom"
        data-visible={edge.bottom}
        style={{
          left: edge.left,
          width: edge.width,
          top: edge.y + Math.max(0, edge.height - 28),
        }}
      />
    </>
  );
}
