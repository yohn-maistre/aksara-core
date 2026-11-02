# Optional agentgateway transport

This profile runs **agentgateway 1.7.0** beside Aksara, without Docker or
Kubernetes. It is opt-in and is not started or bundled by the default launcher.
Source/release: `agentgateway/agentgateway`, Apache-2.0, tag `v1.7.0`, commit
`26f5aebe99a36a037fe54f8080a608aca5547e15`.

The qualified slice is deliberately small: a loopback-only local-model relay.
It forwards exactly model discovery and OpenAI-compatible chat to local Ollama.
Agentgateway adds a request-size limit, deadline and aggregate request rate limit.
The buffered request ceiling is 64 KiB; larger tool contexts can require an
operator-reviewed increase. Admin, stats and readiness listeners are disabled,
request access logging is disabled,
and no logging database, telemetry exporter, retries or provider fallback is
configured. It does not expose the Aksara web host, credentials or Rust API.

1. Install a verified agentgateway 1.7.0 binary for your OS from its release page.
   Validate its published checksum. No remote installer script is required.
2. Start your local model server on `127.0.0.1:11434`.
3. Run `agentgateway -f deploy/agentgateway/local.json` from this repository.
4. Start Aksara with `AKSARA_LOCAL_MODEL_PORT=11435`, then choose Local in setup.

PowerShell for step 4:

```powershell
$env:AKSARA_LOCAL_MODEL_PORT = '11435'
.\aksara.cmd start
```

Stop the gateway with Ctrl-C. Stop Aksara with its own `stop` command. Ports and
upstream are explicit in the configuration; keep them on loopback. The local
model class assumes a trusted local operator and local-only upstream. **Do not
change this profile to a cloud upstream**: that would violate the local provider's
egress contract. Hosted routes need explicit provider classification, consent,
credentials and current Aksara context. ChatGPT subscription OAuth retains its
special scoped transport and does not become an ordinary gateway API key.

This is not a production remote gateway, remote MCP enrollment, fleet manager or
sandbox. No anonymous HTTP bridge to the subject-bound stdio MCP server is
created. An authenticated gateway identity is not an Aksara membership or source
permission; fresh Rust authorization remains necessary on each resource/tool call.
Disable any future cross-user response cache, body capture, credential rotation
or retry until custody, consent and uncertain-effect behavior are qualified.

## Qualification

```sh
bash scripts/qualify_gateway.sh
```

The script downloads and verifies a pinned Linux x64 binary into a temporary
directory, validates this actual config, then runs the real proxy with a synthetic
local model. It checks model discovery, a durable Mastra SSE reply, unknown-route
and wrong-method denial, stripped private headers, oversized-body rejection, aggregate rate limiting,
no repeat on upstream 503 and
absence of the test prompt from logs. It cleans up both processes and temp data.
Windows/ARM gateway runtime and Surface resource use remain unmeasured.

The [integration assessment](../../docs/platform/gateway-and-shared-rooms-2026-11-03.md)
compares alternatives and records broader promotion gates. Keep this profile in
this repo while its interfaces change with the host. A separate gateway package
can follow a stable versioned integration; no upstream fork is needed now.
