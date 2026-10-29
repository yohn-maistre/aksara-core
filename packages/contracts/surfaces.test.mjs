import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSurfaceProgram } from "./surfaces.mjs";
test("OpenUI admits only bounded literal text and resource plans", () => {
  assert.ok(parseSurfaceProgram('root = WorkList("Active", ["work-1"])'));
  assert.ok(parseSurfaceProgram('root = EvidenceCard("A", "B")'));
  for (const code of [
    'root = WorkList("x", [secret])',
    'root = WorkList("x", ["https://evil.test"])',
    'root = Query("private")',
    'root = WorkList("x", ["id-1"]); root = Execute()',
    'root = DocumentPreview("x", ["a", "b"])',
    'root = WorkList("x", [])',
    'root = WorkList("x", ["id-1", "id-1"])',
  ])
    assert.equal(parseSurfaceProgram(code), null, code);
});
