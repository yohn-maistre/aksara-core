# Qualification computer image

A minimal non-root Node 24.19.0 image for the Mastra computer backend port.
It contains no Aksara authority host, source tree or credentials and declares no
persistent volumes. The port supplies bounded tmpfs workspace storage and checks
actual isolation. See `packages/gateway/README.md` for the opt-in qualification.
Interactive commands and persistent private/shared workspaces are not enabled by
this image alone. A phone without Docker gets no host-shell fallback.
