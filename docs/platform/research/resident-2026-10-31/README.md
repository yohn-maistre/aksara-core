# Resident-runtime mechanical probes

These are research probes, not a production harness or an intelligence benchmark.
They use the repository's locked dependencies and entirely scripted responses.
They do not read Aksara stores, use account credentials or call hosted inference.

After the repository's normal `npm ci`, from its root:

```sh
node docs/platform/research/resident-2026-10-31/probe-pi.mjs
node docs/platform/research/resident-2026-10-31/probe-mastra.mjs
```

Pi uses its official faux provider and a temporary SQLite database, removed on
exit. Mastra uses a temporary loopback HTTP completion fixture. Both expose one
`add` tool, receive a scripted call with 17 and 25, and return a scripted answer.
The assertions prove the installed engines can perform model → actual tool →
model, rather than being limited to our current product adapter's one-step mode.
Pi additionally reopens SQLite and checks that the same request id returns the
same settled submission without another model/tool invocation.

The scripts do not evaluate learning, actual model decision-making, interrupted
external effects, institutional permissions or device performance. Results are
recorded in [probe-results.json](probe-results.json). GitHub source activity and
the limitations of its freshness signal are in
[source-activity.json](source-activity.json). No new runtime dependencies are
installed by these probes.
