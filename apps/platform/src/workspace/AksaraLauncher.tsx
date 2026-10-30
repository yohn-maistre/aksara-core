import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Sprout } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useWorkspace } from "./state";
const Blob = lazy(() =>
  import("../components/ui/ai-blob-warp").then((m) => ({
    default: m.AiBlobWarpAvatar,
  })),
);
function StillBlob() {
  return (
    <span className="blob-still" aria-hidden>
      <Sprout size={25} />
    </span>
  );
}
class ShaderBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StillBlob /> : this.props.children;
  }
}
export function AksaraLauncher() {
  const {
    navigate,
    reducedEffects,
    ambientMotion,
    busy,
    palette,
    session,
    page,
  } = useWorkspace();
  const [visible, setVisible] = useState(!document.hidden);
  const [inView, setInView] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const [canShader, setCanShader] = useState(false);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
    });
    setCanShader(!!gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!anchor.current) return;
    const observer = new IntersectionObserver((entries) =>
      setInView(entries[0]?.isIntersecting ?? false),
    );
    observer.observe(anchor.current);
    return () => observer.disconnect();
  }, [page]);
  const reducedMotion = useReducedMotion();
  const live =
    visible &&
    inView &&
    !reducedEffects &&
    !reducedMotion &&
    ambientMotion &&
    canShader;
  const colors =
    palette === "clay"
      ? ["#bf765f", "#e7b08f", "#6c546c", "#cfb8e8"]
      : palette === "sage"
        ? ["#658a7b", "#b8d2bb", "#a78bc7", "#dbc7af"]
        : ["#9875c0", "#c4a4e8", "#c58d77", "#6a7baf"];
  if (page === "Ask") return null;
  return (
    <motion.button
      ref={anchor}
      layoutId={`aksara-personal:${session?.scope}`}
      className="aksara-launcher"
      aria-label="Ask PRIVATE"
      title="Open private conversation"
      disabled={busy}
      onClick={() => navigate("Ask")}
    >
      <ShaderBoundary>
        <Suspense fallback={<StillBlob />}>
          {live ? (
            <Blob
              className="aksara-blob"
              warpProps={{
                colors,
                speed: 0.22,
                swirlIterations: 3,
                width: 120,
                height: 120,
              }}
            />
          ) : (
            <StillBlob />
          )}
        </Suspense>
      </ShaderBoundary>
      <span className="sr-only">Aksara · private conversation</span>
    </motion.button>
  );
}
