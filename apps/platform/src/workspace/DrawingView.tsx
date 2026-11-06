import { useRef, useState } from "react";
import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { ArrowLeft, Check, Download, Save, Sparkles } from "lucide-react";
import { useWorkspace } from "./state";
import { useWorkingSurface } from "./useWorkingSurface";
import { ActionButton, AppInput } from "./controls";
import type { Data } from "./shared";

// Excalidraw must never fetch its font assets from a third-party CDN.
(window as Window & { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH =
  "/excalidraw/";
const allowed = new Set([
  "rectangle",
  "ellipse",
  "diamond",
  "line",
  "arrow",
  "text",
  "freedraw",
  "frame",
]);
export function DrawingView() {
  const w = useWorkspace();
  const id = useRef(`drawing_${crypto.randomUUID()}`);
  const initial =
    w.activeEntry?.kind === "drawing"
      ? w.activeEntry
      : {
          id: id.current,
          revision: 0,
          kind: "drawing",
          title: "Untitled drawing",
          content: "",
          body: { elements: [], files: {} },
          source_ids: [],
        };
  return (
    <DrawingEditor
      key={`${w.session?.scope}:${initial.id}`}
      initial={initial}
    />
  );
}
function DrawingEditor({ initial }: { initial: Data }) {
  const w = useWorkspace();
  const api = useRef<ExcalidrawImperativeAPI | null>(null);
  const { value, change, flush, status, problem, revision } =
    useWorkingSurface(initial);
  const scene = useRef(initial.body.elements || []);
  const [notice, setNotice] = useState("");
  const download = async () => {
    if (!api.current) return;
    const svg = await exportToSvg({
      elements: api.current.getSceneElements(),
      appState: { ...api.current.getAppState(), exportWithDarkMode: false },
      files: {},
    });
    const url = URL.createObjectURL(
      new Blob([svg.outerHTML], { type: "image/svg+xml" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${value.title.replace(/[\\/:*?"<>|]/g, "_")}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="drawing-plane">
      <header className="document-topbar">
        <button className="text-button" onClick={() => w.navigate("Library")}>
          <ArrowLeft size={15} />
          Library
        </button>
        <span role="status" className="document-save">
          {status === "Saved" ? <Check size={14} /> : <Save size={14} />}{" "}
          {status}
        </span>
        <ActionButton
          variant="outline"
          onClick={() => void download()}
          startIcon={<Download size={15} />}
        >
          Export SVG
        </ActionButton>
        <ActionButton color="accent" onClick={() => void w.run(flush)}>
          Save drawing
        </ActionButton>
      </header>
      <div className="drawing-title">
        <AppInput
          aria-label="Drawing title"
          value={value.title}
          onChange={(e) => change({ title: e.target.value })}
        />
        <small>
          {w.privateLane ? "Only you" : `Shared draft · ${w.lane?.name}`} ·
          Editable vectors
        </small>
      </div>
      {(problem || notice) && (
        <p role="alert" className="error">
          {problem || notice}
        </p>
      )}
      <div className="drawing-editor">
        <Excalidraw
          excalidrawAPI={(v) => {
            api.current = v;
          }}
          initialData={{
            elements: scene.current,
            appState: {
              viewBackgroundColor: "transparent",
              currentItemFontFamily: 2,
              currentItemRoughness: 0,
              gridModeEnabled: false,
            },
            scrollToContent: true,
          }}
          theme={w.resolvedTheme === "dark" ? "dark" : "light"}
          name={value.title}
          UIOptions={{
            tools: { image: false },
            canvasActions: {
              loadScene: false,
              export: false,
              saveAsImage: false,
              toggleTheme: false,
            },
          }}
          onLinkOpen={(_e, event) => event.preventDefault()}
          onChange={(elements) => {
            const valid = elements.filter((e) => !e.isDeleted);
            if (
              valid.length > 300 ||
              valid.some((e) => !allowed.has(e.type) || e.link)
            ) {
              setNotice(
                "This drawing supports up to 300 vector shapes. Images, embeds and external links are not saved.",
              );
              return;
            }
            const body = { elements: valid, files: {} };
            if (JSON.stringify(body) === JSON.stringify(value.body)) return;
            setNotice("");
            change({
              body,
              content:
                valid
                  .map((e) => ("text" in e ? e.text : ""))
                  .filter(Boolean)
                  .join("\n") || value.title,
            });
          }}
        />
      </div>
      <footer className="document-ai-row">
        <button
          className="text-button"
          onClick={() =>
            void w.run(async () => {
              await flush();
              const source = await w.api("kernel/workspace-snapshot", {
                id: value.id,
                revision: revision.current,
              });
              await w.refresh();
              w.setAttached([source.id]);
              w.setDraft(
                `Help refine this drawing: ${value.title}. Read the attached exact scene snapshot.`,
              );
              w.navigate(w.privateLane ? "Ask" : "Conversation");
            })
          }
        >
          <Sparkles size={15} />
          Aksara, help with this drawing
        </button>
        <span>Revision {revision.current}</span>
      </footer>
    </div>
  );
}
