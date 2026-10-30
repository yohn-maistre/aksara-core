import { useState } from "react";
import { PREVIEW } from "../transport";
import { useWorkspace } from "./state";
const types: Record<string, string> = {
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
};
export function LibraryUpload() {
  const { session, scope, api, refresh, run, busy } = useWorkspace();
  const [status, setStatus] = useState("");
  return (
    <label className="library-upload text-button">
      <span>Upload file</span>
      <input
        type="file"
        aria-label="Upload Library file"
        accept=".txt,.md,.csv,.json,.png,.jpg,.jpeg,.pdf"
        disabled={PREVIEW || busy}
        onChange={(e) => {
          const file = e.target.files?.[0],
            context = session?.scope;
          e.target.value = "";
          if (!file || !context) return;
          void run(async () => {
            setStatus("");
            if (!file.size || file.size > 1048576)
              throw new Error("Choose a non-empty file up to 1 MiB.");
            const media_type =
              types[file.name.split(".").pop()?.toLowerCase() || ""];
            if (!media_type)
              throw new Error("This file type is not supported yet.");
            const bytes = new Uint8Array(await file.arrayBuffer());
            if (scope.current !== context) return;
            let binary = "";
            for (let i = 0; i < bytes.length; i += 8192)
              binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
            await api("kernel/ingest-file", {
              title: file.name,
              content_base64: btoa(binary),
              media_type,
              visibility: "private",
              purpose: "knowledge",
              provenance: "user-file-upload",
            });
            if (scope.current !== context) return;
            setStatus("Original saved privately in Library.");
            await refresh();
          });
        }}
      />
      {status && (
        <span className="sr-only" role="status">
          {status}
        </span>
      )}
    </label>
  );
}
