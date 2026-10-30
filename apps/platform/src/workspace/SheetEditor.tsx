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

function valueCell(value: string): ICellData {
  const numeric =
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value) &&
    value.replace(/[^0-9]/g, "").length <= 15 &&
    Number.isFinite(Number(value)) &&
    Math.abs(Number(value)) <= Number.MAX_SAFE_INTEGER;
  return {
    v: numeric ? Number(value) : value,
    t: numeric ? 2 : 1,
    f: null,
    p: null,
  };
}

function cellAddress(row: number, column: number): string {
  let letters = "";
  for (let c = column + 1; c > 0; c = Math.floor((c - 1) / 26))
    letters = String.fromCharCode(65 + ((c - 1) % 26)) + letters;
  return letters + (row + 1);
}

function checkedAddress(address: string): string {
  const normalized = address.trim().toUpperCase();
  const match = /^([A-Z]{1,2})([1-9]\d{0,3})$/.exec(normalized);
  const column = match?.[1]
    .split("")
    .reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  if (!match || !column || column > 100 || Number(match[2]) > 1000)
    throw new Error("Choose a cell between A1 and CV1000.");
  return normalized;
}

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
    serialize = useRef<(() => Promise<string>) | null>(null),
    cellInput = useRef<HTMLInputElement>(null),
    cellPort = useRef<{
      select: (address: string) => void;
      apply: (address: string, value: string) => void;
    } | null>(null);
  const { resolvedTheme } = useWorkspace();
  const [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [address, setAddress] = useState("A1"),
    [value, setValue] = useState(""),
    [result, setResult] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    let dispose: (() => void) | undefined;
    let alive = true;
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
          cells[r][c] = valueCell(v);
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
            formulaBar: false,
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
            rowCount: 1000,
            columnCount: 100,
            cellData: cells,
          },
        },
      });
      const sheet = workbook.getActiveSheet();
      let selected = "A1";
      const syncCell = (next: string) => {
        selected = checkedAddress(next);
        const range = sheet.getRange(selected);
        setAddress(selected);
        setValue(range.getFormula() || String(range.getValue() ?? ""));
        setResult(String(range.getValue() ?? ""));
      };
      cellPort.current = {
        select: (next) => {
          const checked = checkedAddress(next);
          sheet.getRange(checked).activate();
          syncCell(checked);
        },
        apply: (next, text) => {
          const checked = checkedAddress(next);
          if (text.length > 2000)
            throw new Error(
              "A cell can contain up to 2,000 characters in this editor.",
            );
          sheet
            .getRange(checked)
            .setValue(
              text.startsWith("=")
                ? { f: text, v: null, p: null }
                : valueCell(text),
            );
          syncCell(checked);
        },
      };
      syncCell("A1");
      serialize.current = async () => {
        // The edit-ended event hides the editor before its command writes the
        // cell. Use the donor's commit boundary before snapshotting the draft.
        await workbook.endEditingAsync(true);
        if (!alive) throw new Error("This source is no longer open.");
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
      const selection = univerAPI.addEvent(
        univerAPI.Event.SelectionChanged,
        ({ selections }) => {
          const first = selections[0];
          if (first) syncCell(cellAddress(first.startRow, first.startColumn));
        },
      );
      // A normal DOM input provides a dependable, accessible edit path inside
      // the modal. The canvas's hidden Docs input can lose its DOM selection.
      const editStart = univerAPI.addEvent(
        univerAPI.Event.BeforeSheetEditStart,
        (event) => {
          event.cancel = true;
          syncCell(cellAddress(event.row, event.column));
          requestAnimationFrame(() => {
            if (!alive) return;
            cellInput.current?.focus();
            cellInput.current?.select();
          });
        },
      );
      const commands = univerAPI.addEvent(
        univerAPI.Event.CommandExecuted,
        () => {
          if (alive)
            setResult(String(sheet.getRange(selected).getValue() ?? ""));
        },
      );
      if (univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady)
        setReady(true);
      dispose = () => {
        lifecycle.dispose();
        editStart.dispose();
        selection.dispose();
        commands.dispose();
        univer.dispose();
      };
    } catch (e) {
      dispose?.();
      dispose = undefined;
      setError((e as Error).message);
    }
    return () => {
      alive = false;
      serialize.current = null;
      cellPort.current = null;
      dispose?.();
    };
  }, [content, title]);
  return (
    <div className="sheet-editor" data-ready={ready} aria-busy={!ready}>
      <form
        className="sheet-cell-bar"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            cellPort.current?.apply(address, value);
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <input
          aria-label="Cell address"
          value={address}
          disabled={!ready}
          maxLength={6}
          onChange={(event) => setAddress(event.target.value)}
          onBlur={() => {
            try {
              cellPort.current?.select(address);
              setError("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
        <input
          ref={cellInput}
          aria-label="Cell value"
          value={value}
          disabled={!ready}
          maxLength={2000}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className="secondary" type="submit" disabled={!ready}>
          Apply cell
        </button>
        <output aria-label="Cell result">{result}</output>
      </form>
      <div
        className="univer-editor-host"
        ref={host}
        aria-label="CSV spreadsheet worktree"
        inert={!ready}
      />
      {error && <p role="alert">{error}</p>}
      <button
        className="secondary"
        disabled={!ready || saving}
        onClick={async () => {
          setSaving(true);
          try {
            const next = await serialize.current?.();
            if (next) onPropose(next);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setSaving(false);
          }
        }}
      >
        Review spreadsheet revision
      </button>
      {!ready && !error && <p role="status">Preparing spreadsheet controls…</p>}
      <p className="composer-note">
        CSV draft · original preserved. Imported formula-like text stays text;
        formulas you enter are included in the reviewed CSV. Formatting is not
        retained by CSV.
      </p>
    </div>
  );
}
