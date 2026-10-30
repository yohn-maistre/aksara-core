import { useEffect, useRef, useState } from "react";
import {
  createUniver,
  LocaleType,
  LifecycleStages,
  type ICellData,
} from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import sheetsEn from "@univerjs/preset-sheets-core/locales/en-US";
import "@univerjs/preset-sheets-core/lib/index.css";
import Papa from "papaparse";
import { useWorkspace } from "./state";

/** Lazy OSS Univer worktree. Only a CSV projection is promoted; original bytes
 * remain canonical. No exchange backend, collaboration, macros or donor daemon. */
export function SheetEditor({
  content,
  title,
  onPropose,
}: {
  content: string;
  title: string;
  onPropose: (text: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    serialize = useRef<(() => string) | null>(null);
  const { resolvedTheme } = useWorkspace();
  const [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [editingCell, setEditingCell] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    let dispose: (() => void) | undefined;
    setReady(false);
    try {
      if (content.length > 50000)
        throw new Error(
          "This first spreadsheet worktree supports CSV up to 50,000 characters.",
        );
      const parsed = Papa.parse<string[]>(content, {
        delimiter: ",",
        dynamicTyping: false,
        skipEmptyLines: false,
      });
      if (parsed.errors.some((e) => e.type === "Quotes"))
        throw new Error("The CSV has an unmatched quote.");
      const rows = parsed.data;
      if (
        rows.length > 1000 ||
        rows.some((r) => r.length > 100) ||
        rows.reduce((n, row) => n + row.length, 0) > 20000
      )
        throw new Error(
          "This worktree supports up to 1,000 rows, 100 columns and 20,000 imported cells.",
        );
      const cells: Record<number, Record<number, ICellData>> = {};
      rows.forEach((row, r) => {
        cells[r] = {};
        row.forEach((v, c) => {
          // Plain safe numeric values should participate in SUM. Preserve IDs
          // with leading zeroes, high-precision values and formula-like strings.
          const numeric =
            /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(v) &&
            v.replace(/[^0-9]/g, "").length <= 15 &&
            Number.isFinite(Number(v)) &&
            Math.abs(Number(v)) <= Number.MAX_SAFE_INTEGER;
          cells[r][c] = numeric ? { v: Number(v), t: 2 } : { v, t: 1 };
        });
      });
      const { univer, univerAPI } = createUniver({
        locale: LocaleType.EN_US,
        darkMode: resolvedTheme === "dark",
        locales: { [LocaleType.EN_US]: sheetsEn },
        presets: [
          UniverSheetsCorePreset({
            container: host.current,
            header: false,
            toolbar: false,
            footer: false,
            contextMenu: false,
            formulaBar: true,
            disableAutoFocus: true,
          }),
        ],
      });
      dispose = () => univer.dispose();
      const workbook = univerAPI.createWorkbook({
        id: "csv-worktree",
        name: title,
        sheetOrder: ["sheet"],
        sheets: {
          sheet: {
            id: "sheet",
            name: "Sheet",
            rowCount: Math.min(1000, Math.max(100, rows.length + 10)),
            columnCount: Math.min(
              100,
              Math.max(12, ...rows.map((r) => r.length)),
            ),
            cellData: cells,
          },
        },
      });
      serialize.current = () => {
        const data = (workbook.save().sheets.sheet.cellData || {}) as Record<
          number,
          Record<number, ICellData | null>
        >;
        let maxRow = 0,
          maxColumn = 0,
          count = 0;
        for (const [r, row] of Object.entries(data))
          for (const [c, cell] of Object.entries(row || {}))
            if (
              cell &&
              (cell.f ||
                (cell.v !== undefined && cell.v !== null && cell.v !== ""))
            ) {
              maxRow = Math.max(maxRow, Number(r));
              maxColumn = Math.max(maxColumn, Number(c));
              count++;
            }
        if (maxRow >= 1000 || maxColumn >= 100 || count > 20000)
          throw new Error("The draft exceeds this editor's cell budget.");
        const values = Array.from({ length: maxRow + 1 }, (_, r) =>
          Array.from({ length: maxColumn + 1 }, (_, c) =>
            String(data[r]?.[c]?.f || (data[r]?.[c]?.v ?? "")),
          ),
        );
        const csv = Papa.unparse(values, { delimiter: ",", newline: "\r\n" });
        if (csv.length > 50000)
          throw new Error(
            "The edited CSV exceeds the current document proposal limit.",
          );
        return csv;
      };
      const lifecycle = univerAPI.addEvent(
        univerAPI.Event.LifeCycleChanged,
        ({ stage }) => {
          if (stage >= LifecycleStages.Steady) setReady(true);
        },
      );
      const editStart = univerAPI.addEvent(
        univerAPI.Event.SheetEditStarted,
        () => setEditingCell(true),
      );
      const editEnd = univerAPI.addEvent(univerAPI.Event.SheetEditEnded, () =>
        setEditingCell(false),
      );
      if (univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady)
        setReady(true);
      dispose = () => {
        lifecycle.dispose();
        editStart.dispose();
        editEnd.dispose();
        univer.dispose();
      };
    } catch (e) {
      dispose?.();
      dispose = undefined;
      setError((e as Error).message);
    }
    return () => {
      serialize.current = null;
      dispose?.();
    };
  }, [content, title]);
  return (
    <div
      className="sheet-editor"
      data-ready={ready}
      data-cell-editing={editingCell}
      aria-busy={!ready}
    >
      <div
        className="univer-editor-host"
        ref={host}
        aria-label="CSV spreadsheet worktree"
        inert={!ready}
      />
      {error && <p role="alert">{error}</p>}
      <button
        className="secondary"
        disabled={!ready || editingCell}
        onClick={() => {
          try {
            const next = serialize.current?.();
            if (next) onPropose(next);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Review spreadsheet revision
      </button>
      {!ready && !error && <p role="status">Preparing spreadsheet controls…</p>}
      {editingCell && (
        <p className="composer-note">
          Press Enter or Tab to finish the cell before review.
        </p>
      )}
      <p className="composer-note">
        CSV draft · original preserved. Imported formula-like text stays text;
        formulas you enter are included in the reviewed CSV. Formatting is not
        retained by CSV.
      </p>
    </div>
  );
}
