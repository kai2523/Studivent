FROM node:22-alpine AS builder

WORKDIR /app
COPY ./extensions ./extensions

RUN apk add --no-cache curl

# Loop through each extension and install + build
RUN for d in ./extensions/*; do \
  if [ -f "$d/package.json" ]; then \
    echo "Building $d"; \
    cd "$d" && npm install && npm run build && cd -; \
  fi; \
done

# Final image
FROM directus/directus:latest
WORKDIR /directus

# Only copy built output
COPY --from=builder /app/extensions /directus/extensions

HEALTHCHECK --interval=1m --timeout=10s --retries=3 \
  CMD curl -sf http://127.0.0.1:8055/server/ping || exit 1
