# Experimental platform contracts

These draft v1 profiles are generated from `packages/contracts/index.mjs`. They describe message shapes, not stable network services, cryptographic grants or enabled execution.

- `pack.schema.json`: strict bundled first-party manifest; the Knowledge Pack is validated by the workbench. No scripts, wildcard capabilities or arbitrary components.
- `surface.schema.json`: scoped, source-linked, expiring OpenUI text-card envelope. The current conversational renderer implements only the bounded text-card program subset; generalized persisted surface admission is pending.
- `computer-intent.schema.json`: scope/controller/work fences for an observation/proposal adapter. No computer backend is provisioned.
- `publication-draft.schema.json`: reviewed public projection reference. A SharingGrant ID is mandatory in the shape; real SharingGrant evaluation and Ruara delivery are not implemented.

Regenerate with Zod 4's `toJSONSchema` from the exported schemas. Strict objects reject unknown fields. Tests cover attempted ambient-code/authority declarations.

The existing independent Device SDK uses **`aksara-device/0.1`** in `python/aksara_device_sdk.py`. It has not been frozen as an MCU wire ABI. Do not silently rename it to these platform profiles or assume Muse/Lapis transport compatibility. Physical privacy/stop, controller generation, pairing, capture and update behavior need their own firmware conformance path.
