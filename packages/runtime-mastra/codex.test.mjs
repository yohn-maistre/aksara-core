import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createCodexBridge } from "./codex.mjs";
import { generateReply } from "./index.mjs";
import { providerFailure } from "./hosted.mjs";
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
        // Subscription transport rejects a field accepted by the platform API.
        assert.equal(Object.hasOwn(body, "max_output_tokens"), false);
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

test("Codex auth rejection retains a safe failure category without provider echoes", async () => {
  const f = await fixture();
  try {
    await connect(f.bridge);
    const port = await f.bridge.model("personal", "gpt-5.4", {
      fetchImpl: async () =>
        new Response("PRIVATE_PROVIDER_ECHO", { status: 401 }),
    });
    await assert.rejects(
      generateReply({
        provider: "codex-chatgpt",
        model: "gpt-5.4",
        modelPort: port.model,
        messages: [{ role: "user", content: "Synthetic test" }],
        signal: AbortSignal.timeout(5000),
      }),
      (error) => {
        assert.match(providerFailure(error), /sign-in or access was rejected/);
        assert.ok(!providerFailure(error).includes("PRIVATE_PROVIDER_ECHO"));
        return true;
      },
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

test("Codex discovers current account models, keeps only display metadata, and invalidates the catalog on logout", async () => {
  const f = await fixture();
  let calls = 0;
  try {
    const fetchImpl = async (url, options) => {
      calls++;
      assert.equal(
        url,
        "https://chatgpt.com/backend-api/codex/models?client_version=0.162.1",
      );
      assert.equal(options.redirect, "error");
      assert.equal(
        options.headers.authorization,
        `Bearer ${credentials.access}`,
      );
      assert.equal(
        options.headers["ChatGPT-Account-ID"],
        credentials.accountId,
      );
      return Response.json({
        models: [
          {
            slug: "new-text-model",
            display_name: "New text model",
            visibility: "list",
            input_modalities: ["text", "image"],
            context_window: 128000,
            instructions: "REMOTE_AUTHORITY_SENTINEL",
            guardian: { anything: "allow" },
          },
          { slug: "hidden-model", display_name: "Hidden", visibility: "hide" },
          {
            slug: "image-only",
            visibility: "list",
            input_modalities: ["image"],
          },
          { visibility: "list" },
          { slug: "new-text-model", visibility: "list" },
        ],
      });
    };
    assert.equal(
      (await f.bridge.discover("personal", { fetchImpl })).connected,
      false,
    );
    assert.equal(calls, 0);
    await connect(f.bridge);
    const result = await f.bridge.discover("personal", { fetchImpl });
    assert.equal(result.model_catalog.source, "provider");
    assert.deepEqual(
      result.models.map((m) => m.id),
      ["new-text-model"],
    );
    assert.deepEqual(result.models[0].input_modalities, ["text", "image"]);
    assert.equal(result.models[0].verified_here, false);
    assert.ok(!JSON.stringify(result).includes("REMOTE_AUTHORITY_SENTINEL"));
    assert.ok(!JSON.stringify(result).includes(credentials.access));
    assert.equal((await f.bridge.status("community")).models.length, 0);
    await f.bridge.discover("personal", { fetchImpl });
    assert.equal(calls, 1);
    assert.ok((await f.bridge.model("personal", "new-text-model")).model);
    await f.bridge.logout("personal");
    await connect(f.bridge);
    assert.equal(
      (await f.bridge.status("personal")).model_catalog.source,
      "bundled_candidates",
    );
  } finally {
    await f.close();
  }
});

test("failed catalog lookup preserves sign-in and labels candidate fallback without provider bodies", async () => {
  const f = await fixture();
  try {
    await connect(f.bridge);
    const result = await f.bridge.discover("personal", {
      fetchImpl: async () =>
        new Response("PRIVATE_PROVIDER_ECHO", { status: 503 }),
    });
    assert.equal(result.connected, true);
    assert.equal(result.model_catalog.source, "bundled_candidates");
    assert.equal(result.verified_here, false);
    assert.ok(!JSON.stringify(result).includes("PRIVATE_PROVIDER_ECHO"));
    assert.match(result.catalog_notice, /not verified/);
  } finally {
    await f.close();
  }
});

test("an oversized account catalog cannot enter cached choices or discard sign-in", async () => {
  const f = await fixture();
  try {
    await connect(f.bridge);
    const result = await f.bridge.discover("personal", {
      fetchImpl: async () => new Response(" ".repeat(1048577)),
    });
    assert.equal(result.connected, true);
    assert.equal(result.model_catalog.source, "bundled_candidates");
    assert.match(result.catalog_notice, /not verified/);
  } finally {
    await f.close();
  }
});

test("logout during discovery fences the arriving account catalog", async () => {
  const f = await fixture();
  try {
    await connect(f.bridge);
    await assert.rejects(
      f.bridge.discover("personal", {
        fetchImpl: async () => {
          await f.bridge.logout("personal");
          return Response.json({
            models: [{ slug: "stale-account-model", visibility: "list" }],
          });
        },
      }),
      { status: 503 },
    );
    assert.equal((await f.bridge.status("personal")).connected, false);
  } finally {
    await f.close();
  }
});
