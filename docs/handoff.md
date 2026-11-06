# Source handoff

Use the repository's [README](../README.md) for local setup and the [platform guide](platform/README.md) for architecture and limits. Production enrollment is not provided by the development identity chooser.

The optional `scripts/package_handoff.py` creates a source/bundle handoff with checksums. Source archives exclude credentials, runtime databases, dependency installations and build output. Original source bytes belong to their custody store; do not bundle live institutional data into source distributions.

Internal research, historical design studies and review screenshots are archived separately in the private Abstraksi repository. They are not part of the public source package. Moving files out of the current tree does not remove content already present in historical Git commits.
