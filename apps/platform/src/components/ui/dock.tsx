// Adapted from Cult UI dock (MIT), d71b142. Proximity/spring mechanism retained;
// image cards, ambient window listeners and indefinite demo bounce removed.
import {
  createContext,
  useContext,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
const DockContext = createContext<ReturnType<
  typeof useMotionValue<number>
> | null>(null);
export function Dock({
  children,
  className,
  vertical = false,
}: {
  children: ReactNode;
  className?: string;
  vertical?: boolean;
}) {
  const pointer = useMotionValue(Infinity);
  return (
    <DockContext.Provider value={pointer}>
      <div
        className={className}
        data-axis={vertical ? "vertical" : "horizontal"}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse")
            pointer.set(vertical ? e.clientY : e.clientX);
        }}
        onPointerLeave={() => pointer.set(Infinity)}
        onKeyDown={(e) => {
          const keys = vertical
            ? ["ArrowUp", "ArrowDown"]
            : ["ArrowLeft", "ArrowRight"];
          if (![...keys, "Home", "End"].includes(e.key)) return;
          const buttons = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          ).filter((b) => b.offsetParent !== null);
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          if (index < 0 || !buttons.length) return;
          e.preventDefault();
          buttons[
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? buttons.length - 1
                : (index + (e.key === keys[0] ? -1 : 1) + buttons.length) %
                  buttons.length
          ]?.focus();
        }}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}
export function DockItem({ children, ...props }: ComponentProps<"button">) {
  const ref = useRef<HTMLButtonElement>(null);
  const pointer = useContext(DockContext)!;
  const reduced = useReducedMotion();
  const proximity = useTransform(pointer, (value) => {
    if (reduced || !Number.isFinite(value) || !ref.current) return 1;
    const r = ref.current.getBoundingClientRect();
    const vertical = ref.current.closest('[data-axis="vertical"]');
    const center = vertical ? r.y + r.height / 2 : r.x + r.width / 2;
    return 1 + Math.max(0, 1 - Math.abs(value - center) / 100) * 0.14;
  });
  const scale = useSpring(proximity, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  return (
    <button {...props} ref={ref} type="button">
      <motion.span className="dock-item-content" style={{ scale }}>
        {children}
      </motion.span>
    </button>
  );
}
