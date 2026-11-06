# Aksara Memory

An agent-independent memory service boundary. Rust/SQLite owns durable originals,
reviewed excerpts, working wiki/people/procedure notes, permissions and lineage.
The default retrieval engine is the actual pinned LongMemory Hydrograph core,
embedded as a bounded, rebuildable graph over one currently authorized snapshot.
No Docker, model download, external inference or second database is required.

`createMemoryService({ load })` accepts an authority-owned loader for the
`aksara.memory/1` projection. `recall({query,mode,limit})` returns cited original
text with reviewed versus provisional status. It indexes only the current
partition and reloads eligibility before returning. It does not accept an
agent-provided corpus, tenant or principal. A cache is never an access grant.

The graph survives ordinary runtime eviction by rebuilding from the canonical
store. Original notes, corrections and memory review persist there across restart;
the graph itself is not an additional truth store. Recall is bounded by the
canonical projection (currently 20 reviewed and 10 working records), not a claim
of unlimited semantic indexing. Library FTS remains available for the broader
source corpus. Remote enrollment, provider consent, public release and any
write/review capability remain separate from this read service.

The npm `longmemory@1.3.3` package is a different older connector-heavy release.
This integration uses the inspected Hydrograph source at commit
`8badf44d48d0d72a07e1ea3daf1ecbd76ae1a357`, Apache-2.0. Reproduce with
`node scripts/vendor_longmemory.mjs /path/to/pinned/LongMemory`. Its SQLite
import resolves to an explicit unsupported-profile adapter; the in-memory
engine is otherwise unchanged. Vendor licenses and source provenance are in
`vendor/`. The embedded engine does heuristic extraction internally; those claims
are not approved facts and are not returned in place of cited originals.
