import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createCodexBridge } from "./codex.mjs";
import { generateReply } from "./index.mjs";
const credentials = {
  access: "ACCESS_SECRET_SENTINEL",
  refresh: "REFRESH_SECRET_SENTINEL",
  accountId: "account-fixture",
  expires: Date.now() + 3600000,
};
const auth = {
  start: async () => ({
    url: "https://auth.openai.com/codex/device",
    userCode: "TEST-123",
    intervalMs: 0,
    deadlineAt: Date.now() + 60000,
  }),
  poll: async () => ({ status: "complete", credentials }),
  refresh: async () => credentials,
};
async function fixture(options = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "aksara-codex-test-"));
  const bridge = createCodexBridge({ root, auth, ...options });
  return {
    root,
    bridge,
    close: async () => {
      bridge.close();
      await rm(root, { recursive: true, force: true });
    },
  };
}
async function connect(bridge, profile = "personal") {
  const login = await bridge.login(profile);
  assert.equal(login.user_code, "TEST-123");
  await bridge.poll(profile, login.login_id);
  return login;
}
test("Mastra Codex device flow uses encrypted per-custody storage and no ambient credentials", async () => {
  const f = await fixture();
  try {
    assert.equal((await f.bridge.status("personal")).connected, false);
    const login = await connect(f.bridge);
    assert.equal((await f.bridge.status("personal")).connected, true);
    assert.equal((await f.bridge.status("community")).connected, false);
    assert.ok(!JSON.stringify(login).includes(credentials.access));
    const folders = await readdir(f.root);
    const encrypted = await readFile(
      path.join(f.root, folders[0], "credential.enc"),
      "utf8",
    );
    assert.ok(!encrypted.includes(credentials.access));
    assert.ok(!encrypted.includes(credentials.refresh));
    assert.equal(
      (await stat(path.join(f.root, folders[0], "credential.enc"))).mode &
        0o777,
      0o600,
    );
    await f.bridge.logout("personal");
    assert.equal((await f.bridge.status("personal")).connected, false);
  } finally {
    await f.close();
  }
});
test("Mastra Agent consumes the donor Codex Responses transport with no tools or paid fallback", async () => {
  const f = await fixture();
  try {
    await connect(f.bridge);
    let called = 0;
    const port = await f.bridge.model("personal", "gpt-5.4", {
      fetchImpl: async (request) => {
        called++;
        assert.equal(
          request.url,
          "https://chatgpt.com/backend-api/codex/responses",
        );
        assert.equal(request.redirect, "error");
        assert.equal(
          request.headers.get("authorization"),
          `Bearer ${credentials.access}`,
        );
        assert.equal(
          request.headers.get("chatgpt-account-id"),
          "account-fixture",
        );
        const body = await request.json();
        assert.equal(body.stream, true);
        assert.equal(body.store, false);
        assert.ok(!body.tools?.length);
        assert.ok(JSON.stringify(body).includes("Synthetic Codex turn"));
        const response = {
          id: "resp_fixture",
          object: "response",
          created_at: 1,
          status: "completed",
          model: "gpt-5.4",
          output: [
            {
              id: "msg_fixture",
              type: "message",
              role: "assistant",
              status: "completed",
              content: [
                {
                  type: "output_text",
                  text: "A Codex response through Mastra.",
                  annotations: [],
                },
              ],
            },
          ],
          usage: {
            input_tokens: 5,
            output_tokens: 8,
            total_tokens: 13,
            input_tokens_details: { cached_tokens: 0 },
            output_tokens_details: { reasoning_tokens: 0 },
          },
        };
        return new Response(
          `event: response.completed\ndata: ${JSON.stringify({ type: "response.completed", response })}\n\n`,
          { headers: { "content-type": "text/event-stream" } },
        );
      },
    });
    const text = await generateReply({
      provider: "codex-chatgpt",
      model: "gpt-5.4",
      modelPort: port.model,
      messages: [{ role: "user", content: "Synthetic Codex turn" }],
      signal: AbortSignal.timeout(10000),
    });
    port.assertCurrent();
    assert.equal(text, "A Codex response through Mastra.");
    assert.equal(called, 1);
    await f.bridge.logout("personal");
    assert.throws(port.assertCurrent, { status: 503 });
    await assert.rejects(f.bridge.model("community", "gpt-5.4"), {
      status: 503,
    });
  } finally {
    await f.close();
  }
});
test("stale and cancelled device authorization cannot save credentials", async () => {
  const f = await fixture();
  try {
    const login = await f.bridge.login("personal");
    await assert.rejects(
      f.bridge.poll("personal", login.login_id, {
        assertCurrent() {
          throw new Error("Scope changed");
        },
      }),
    );
    assert.equal((await f.bridge.status("personal")).connected, false);
    const next = await f.bridge.login("personal");
    await f.bridge.cancel("personal", next.login_id);
    await assert.rejects(f.bridge.poll("personal", next.login_id), {
      status: 503,
    });
    assert.equal((await f.bridge.status("personal")).connected, false);
  } finally {
    await f.close();
  }
});
test("unfinished SSE cannot be committed as a completed model reply", async () => {
  const f = await fixture();
  try {
    await connect(f.bridge);
    const port = await f.bridge.model("personal", "gpt-5.4", {
      fetchImpl: async () =>
        new Response(
          'event: response.created\ndata: {"type":"response.created","response":{"id":"unfinished","output":[]}}\n\n',
          { headers: { "content-type": "text/event-stream" } },
        ),
    });
    await assert.rejects(
      generateReply({
        provider: "codex-chatgpt",
        model: "gpt-5.4",
        modelPort: port.model,
        messages: [{ role: "user", content: "Synthetic fixture" }],
        signal: AbortSignal.timeout(5000),
      }),
    );
  } finally {
    await f.close();
  }
});

test("authorization lost while committing sign-in rolls back provisional credentials", async () => {
  const f = await fixture();
  try {
    const login = await f.bridge.login("personal");
    let checks = 0;
    await assert.rejects(
      f.bridge.poll("personal", login.login_id, {
        async assertCurrent() {
          if (++checks === 3)
            throw Error("Membership revoked during promotion");
        },
      }),
    );
    assert.equal((await f.bridge.status("personal")).connected, false);
  } finally {
    await f.close();
  }
});
