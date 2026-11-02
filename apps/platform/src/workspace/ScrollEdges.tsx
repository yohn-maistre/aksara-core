import { useEffect, useRef } from "react";
/** Fade clipped content into the actual live canvas. Keep controls outside. */
export function ScrollEdges({ selector }: { selector: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const target =
      anchor.current?.parentElement?.querySelector<HTMLElement>(selector);
    if (!target) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const focused =
          target.contains(document.activeElement) &&
          document.activeElement?.matches(":focus-visible");
        const top = !focused && target.scrollTop > 8 ? 18 : 0;
        const bottom =
          !focused &&
          target.scrollHeight - target.clientHeight - target.scrollTop > 8
            ? 18
            : 0;
        target.style.maskImage =
          top || bottom
            ? `linear-gradient(to bottom, transparent 0, black ${top}px, black calc(100% - ${bottom}px), transparent 100%)`
            : "none";
        target.style.webkitMaskImage = target.style.maskImage;
      });
    };
    const resize = new ResizeObserver(update),
      mutation = new MutationObserver(update);
    resize.observe(target);
    mutation.observe(target, { childList: true, subtree: true });
    target.addEventListener("scroll", update, { passive: true });
    target.addEventListener("focusin", update);
    target.addEventListener("focusout", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      target.removeEventListener("scroll", update);
      target.removeEventListener("focusin", update);
      target.removeEventListener("focusout", update);
      target.style.maskImage = "none";
    };
  }, [selector]);
  return <span ref={anchor} aria-hidden hidden />;
}
