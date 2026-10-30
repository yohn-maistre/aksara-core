# Aksara gateway ports

These adapters use Mastra protocol/workspace packages. Rust still owns identity,
current audience, source eligibility, work, approval and receipts.

## Read-only MCP resources

`npm run gateway:mcp` serves local stdio using `@mastra/mcp` 2.6.0. Supply
`AKSARA_URL` (the Rust authority origin, such as `http://127.0.0.1:7351`),
`AKSARA_TOKEN` (the assigned individual subject token) and `AKSARA_LANE` explicitly
in the MCP client's protected host configuration. Credentials stay in the local
process environment, never a resource URI or model prompt. No token/identity
fallback is provided. No HTTP listener is exposed.

Resources include current eligible Library previews, the current work collection
and validated bundled Pack manifests. Source content is bounded to 50,000
characters with an explicit `truncated` flag; original bytes remain in Rust's
Library. Every read goes back to current Rust authorization. Prior listing,
subscription state and a remembered URI confer no rights. Errors do not return
hidden source titles, counts or authority diagnostics. No write/approval/tool
execution is exposed. One collection snapshot never combines asynchronous reads
from before and after a membership change.

**Compatibility:** this Mastra version's stdio server serves MCP 2026-07-28 and
rejects legacy openings. It is qualified with the matching native Mastra client;
older clients need a separately qualified transport. This is not a claim that
all MCP clients or remote OAuth enrollment already work. Client integrations
should use `resources.listWithErrors()` rather than treating discovery errors as
an empty Library.

This version only reads advertised resource URIs. Work is exposed through the
bounded `aksara://workspace/work` collection; individual work templates are not
advertised or supported. Both private collection visibility and denial of
unlisted item URIs are tested through the actual stdio transport.

Only connect a trusted local consumer with an intentionally assigned subject.
Hosted consumers, credential delegation, remote clients, generic external tool
servers and data egress need their own enrollment/consent/grant policy.

## Computer backend groundwork

`MastraComputerPort` wraps `@mastra/docker` 0.12.1. An explicit host authority
callback must assert the current principal, institution, lane, audience digest,
purpose, policy epoch and controller generation before each operation. The
callback is an interface requirement, not a substitute for a Rust grant.
Resource identity excludes the acting principal so eligible members of the same
shared lane can address one namespace; personal/private lanes and changed
purpose/audience/epoch/controller generation resolve separately.

The port requires an already installed immutable image, a non-root image user,
a local Docker socket, disabled network, read-only root, dropped capabilities,
no-new-privileges and enforced memory/CPU/PID limits. It inspects the actual
container before observing or stopping it. Bind mounts, inherited image volumes
and unexpected mounts are rejected. The native SDK object is private, not a
model tool. Observe runs only a fixed bounded directory-list operation.

The dedicated image deliberately contains no Aksara authority application,
source corpus or credential directory. It declares no volumes. A qualification
attempt using the existing authority-host image correctly failed because that
image declares a `/data` volume; the isolated computer image then passed.

```sh
docker build -f deploy/computer/Dockerfile -t aksara-computer:local deploy/computer
AKSARA_DOCKER_TEST_IMAGE=$(docker image inspect aksara-computer:local --format '{{.Id}}') \
  node --test packages/gateway/computer.test.mjs
```

The test creates a synthetic isolated computer and removes it. Without the image
environment variable, normal tests skip that one real-Docker qualification.
The x64 Docker operations CI runs it explicitly.

**Promotion gates:** this is an ephemeral observation/provisioning port, not the
platform's completed private/shared computer product. No browser/model command
endpoint is enabled. Rust durable remote-intent admission, uncertain-outcome
reconciliation, persistent workspace provenance/withdrawal, budget/lease cleanup,
human takeover and browser/artifact transfer must pass before interactive command
execution is wired. There is no host-shell fallback on platforms without Docker.

ACP and executable skills remain separate runtime ports. The Mastra Code ACP
implementation is a source reference; its session IDs do not create Aksara
rights. Bundled Pack manifests are descriptive, not executable skill installation
or permission grants.
