#!/usr/bin/env bash
# Apply Prisma migrations inside the API image (same DATABASE_URL as production).
# Run from the cloned monorepo on the VPS.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.production ]]; then
  echo "Missing .env.production" >&2
  exit 1
fi

COMPOSE_FILES=(-f docker/docker-compose.vps.yml)
if [[ -f docker/docker-compose.host-db.yml ]]; then
  COMPOSE_FILES+=(-f docker/docker-compose.host-db.yml)
fi

SCHEMA="${PRISMA_SCHEMA_PATH:-/app/packages/database/prisma/schema.prisma}"

echo "Applying prisma migrate deploy inside the api image (DATABASE_URL is not printed)."
docker compose "${COMPOSE_FILES[@]}" --env-file .env.production \
  run --rm --no-deps --entrypoint npx api prisma migrate deploy --schema="$SCHEMA"
echo "Migrations complete."
