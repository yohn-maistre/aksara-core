# Platform guide

Aksara connects conversations, background work, saved artifacts and source-linked knowledge in a local-first workspace. It is a development alpha, with explicit limits described below.

- [Windows setup](windows-local.md) and [desktop installation](desktop-installation.md)
- [Architecture and memory](architecture.md)
- [Current decisions](decisions.md) and [component coverage](component-coverage.csv)
- [Verification](verification.md)
- [Aksara's conversational prompt](aksara-voice.md)
- [ETNOS integration boundary](../integrations/etnos-handoff.md)
- [Donors and licenses](../donors.md)

Home shows recent accessible work and saved drafts. Channels offer Room and Workbench views. The private Aksara side pane remains available beside the current workspace and can expand. Documents, source tables, drawings and working knowledge use the same underlying source and authority rules.

For a first local session, open the setup dialog, choose a model connection, test it, and start a conversation. The static hosted preview uses disposable samples and never connects to a model, private host or live messaging account.

The default runtime is Mastra with local checkpoints; Rust remains authoritative. Embedded LongMemory is a rebuildable recall projection over currently eligible records. It does not grant access, approve facts or publish knowledge. See the architecture guide for its current indexing bounds and hosted-provider consent behavior.
