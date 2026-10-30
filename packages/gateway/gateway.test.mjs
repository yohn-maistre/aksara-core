import { test } from "node:test";
import assert from "node:assert/strict";
import { KernelReadPort } from "./read-port.mjs";
import { createResourceGateway } from "./mcp.mjs";
test("gateway read port has no write, arbitrary URL, inherited identity or diagnostic fallback", async () => {
  for (const invalid of [
    { url: "https://evil.test", token: "explicit", lane: "lane-1" },
    { url: "http://127.0.0.1:7000/private", token: "explicit", lane: "lane-1" },
    { url: "http://127.0.0.1:7000", lane: "lane-1" },
  ])
    assert.throws(() => new KernelReadPort(invalid));
  let calls = 0;
  const port = new KernelReadPort({
    url: "http://127.0.0.1:7000",
    token: "SUBJECT_SECRET",
    lane: "lane-1",
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(options.method, "GET");
      assert.equal(options.redirect, "error");
      assert.equal(options.headers["x-aksara-lane"], "lane-1");
      assert.ok(!url.includes("SUBJECT_SECRET"));
      return new Response(JSON.stringify({ error: "PRIVATE_DIAGNOSTIC" }), {
        status: 403,
      });
    },
  });
  await assert.rejects(port.read("execute"), /capability unavailable/);
  assert.equal(calls, 0);
  await assert.rejects(
    port.read("artifact", "source-1"),
    (e) =>
      e.message === "Resource unavailable" &&
      !e.message.includes("PRIVATE_DIAGNOSTIC"),
  );
});
test("MCP resource reads recheck source withdrawal, reject URI injection and expose no effect tools", async () => {
  let eligible = true,
    reads = 0;
  const port = {
    read: async (op, id) => {
      reads++;
      if (!eligible) throw new Error("private revoked metadata");
      if (op === "library")
        return [{ id: "source-1", title: "Eligible title" }];
      if (op === "threads") return [];
      assert.equal(op, "artifact");
      assert.equal(id, "source-1");
      return {
        artifact: { id: "source-1", title: "Eligible title" },
        content: "CURRENT_SOURCE",
      };
    },
  };
  const { server, resources } = createResourceGateway(port);
  try {
    assert.equal((await server.getToolListInfo()).tools.length, 0);
    const listed = await resources.listResources();
    assert.equal(listed[0].uri, "aksara://library/source-1");
    assert.equal(
      JSON.parse(
        (await resources.getResourceContent({ uri: listed[0].uri })).text,
      ).content,
      "CURRENT_SOURCE",
    );
    eligible = false;
    await assert.rejects(
      resources.getResourceContent({ uri: listed[0].uri }),
      /Resource unavailable in this context/,
    );
    await assert.rejects(resources.listResources(), /Resource unavailable/);
    const before = reads;
    for (const uri of [
      "file:///etc/passwd",
      "aksara://library/../secret",
      "aksara://work/id?token=x",
      "aksara://user:password@library/source-1",
    ])
      await assert.rejects(
        resources.getResourceContent({ uri }),
        /Resource unavailable/,
      );
    assert.equal(reads, before);
  } finally {
    await server.close();
  }
});
