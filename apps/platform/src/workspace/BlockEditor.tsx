import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useWorkspace } from "./state";
import type { Data } from "./shared";

/** Editor data only. No model keys, hosted file proxy or document authority. */
type EditorProps = {
  content: string;
  title?: string;
  blocks?: any[];
  readOnly?: boolean;
  onChange?: (body: any[], markdown: string) => void;
  onSelection?: (text: string) => void;
};
class EditorBoundary extends Component<
  { children: ReactNode; content: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert">
        <p>This block structure could not open. Your saved text is below.</p>
        <pre className="document-content">{this.props.content}</pre>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function BlockEditor(props: EditorProps) {
  return (
    <EditorBoundary content={props.content}>
      <EditorContent {...props} />
    </EditorBoundary>
  );
}
function EditorContent({
  content,
  title,
  blocks,
  readOnly = false,
  onChange,
  onSelection,
}: EditorProps) {
  const { resolvedTheme } = useWorkspace();
  const [ready, setReady] = useState(!!blocks?.length || !content);
  const [problem, setProblem] = useState("");
  const sequence = useRef(0);
  const heading = useRef(
    !!title &&
      content.match(/^#\s+([^\r\n]+)\r?\n/)?.[1].trim() === title.trim(),
  );
  const initialText = heading.current
    ? content.slice(content.indexOf("\n") + 1).replace(/^\r?\n/, "")
    : content;
  const editor = useCreateBlockNote({
    domAttributes: {
      editor: {
        "aria-label": readOnly
          ? "Document preview content"
          : "Document content",
      },
    },
    ...(blocks?.length ? { initialContent: blocks } : {}),
    // External images never cause document viewing to fetch a third-party URL.
    resolveFileUrl: async () => "data:,",
    links: { isValidLink: (href: string) => /^(https?:|mailto:)/i.test(href) },
    uploadFile: async () => {
      throw new Error(
        "Add files through Library so their source and access are preserved.",
      );
    },
  });
  useEffect(() => {
    let live = true;
    if (!blocks?.length && content)
      void Promise.resolve(editor.tryParseMarkdownToBlocks(initialText))
        .then((parsed) => {
          if (live) {
            editor.replaceBlocks(editor.document, parsed);
            setReady(true);
          }
        })
        .catch(() => {
          if (live)
            setProblem(
              "This document could not open. Download the original from Library.",
            );
        });
    return () => {
      live = false;
      sequence.current++;
    };
  }, [editor]);
  return (
    <div
      className="document-editor"
      data-readonly={readOnly}
      aria-label={readOnly ? "Document preview" : "Document editor"}
    >
      {problem ? (
        <p role="alert">{problem}</p>
      ) : !ready ? (
        <p role="status">Opening document…</p>
      ) : null}
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={!readOnly && ready}
        onSelectionChange={() =>
          onSelection?.(editor.getSelectedText().slice(0, 6000))
        }
        onChange={() => {
          if (!ready || readOnly) return;
          const current = ++sequence.current;
          const body = structuredClone(editor.document);
          void Promise.resolve(editor.blocksToMarkdownLossy(body))
            .then((markdown) => {
              if (sequence.current === current)
                onChange?.(
                  body,
                  heading.current ? `# ${title}\n\n${markdown}` : markdown,
                );
            })
            .catch(() =>
              setProblem(
                "This edit could not be converted for saving. Copy your text before closing.",
              ),
            );
        }}
      />
    </div>
  );
}
