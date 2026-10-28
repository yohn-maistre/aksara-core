import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validatePack, ComputerIntent, PublicationDraft } from "./index.mjs";
const pack = JSON.parse(
  await readFile(new URL("../../packs/knowledge/pack.json", import.meta.url)),
);
test("bundled Pack validates and cannot declare ambient code, authority or network", () => {
  assert.equal(validatePack(pack).id, "aksara.knowledge");
  for (const extra of [
    { script: "evil.js" },
    { permissions: ["*"] },
    { backend: "https://evil.test" },
  ])
    assert.throws(() => validatePack({ ...pack, ...extra }));
  assert.throws(() => validatePack({ ...pack, capabilities: ["shell.run"] }));
  assert.throws(() =>
    validatePack({
      ...pack,
      screens: [
        { id: "unsafe.screen", slot: "today", components: ["RawHTML"] },
      ],
    }),
  );
});
test("computer and publication proposal contracts require fences and an explicit sharing grant", () => {
  assert.equal(
    ComputerIntent.safeParse({
      protocol: "aksara.computer-intent/1",
      session_id: "session_1",
      capability: "computer.propose",
    }).success,
    false,
  );
  assert.equal(
    PublicationDraft.safeParse({
      protocol: "aksara.publication-draft/1",
      artifact_id: "artifact_1",
      destination: "ruara",
      format: "public-text",
    }).success,
    false,
  );
});
