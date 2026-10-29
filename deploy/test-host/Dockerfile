# syntax=docker/dockerfile:1
FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS frontend
WORKDIR /app
# One context copy avoids expensive repeated full-layer copies on VFS builders.
# .dockerignore excludes credentials, runtime stores, dependencies and build trees.
COPY . .
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --strict-ssl=true
RUN npm run build && npm prune --omit=dev && \
    mkdir -p bin && cp dist/test-host/aksarad bin/aksarad && chmod 755 bin/aksarad

FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df
RUN --mount=type=secret,id=proxy_bundle \
    if [ -f /run/secrets/proxy_bundle ]; then \
      apt-get -o Acquire::https::CaInfo=/run/secrets/proxy_bundle update && apt-get -o Acquire::https::CaInfo=/run/secrets/proxy_bundle install -y --no-install-recommends python3; \
    else apt-get update && apt-get install -y --no-install-recommends python3; fi; \
    rm -rf /var/lib/apt/lists/* && mkdir /data && chown node:node /data
WORKDIR /app
COPY --chown=node:node --from=frontend /app /app
USER node
ENV PYTHONDONTWRITEBYTECODE=1
VOLUME /data
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","deploy/test-host/start.mjs"]
