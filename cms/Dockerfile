FROM node:22-alpine AS builder

WORKDIR /app
COPY ./extensions ./extensions

# Loop through each extension and install + build
RUN for d in ./extensions/*; do \
  if [ -f "$d/package.json" ]; then \
    echo "Building $d"; \
    cd "$d" && npm install && npm run build && cd -; \
  fi; \
done

FROM directus/directus:latest
WORKDIR /directus

USER root
RUN apk add --no-cache curl
USER node

EXPOSE 8055

# Only copy built output
COPY --from=builder /app/extensions /directus/extensions

HEALTHCHECK --interval=5m --timeout=10s --retries=3 \
  CMD curl -sf http://127.0.0.1:8055/server/health || exit 1