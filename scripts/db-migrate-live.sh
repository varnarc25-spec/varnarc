#!/usr/bin/env bash
# Apply Prisma migrations to live VPS Postgres (SSH tunnel or VPS itself).
# Does not use local 127.0.0.1:5432.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${DATABASE_DIRECT_URL:-}" ]]; then
  echo "DATABASE_DIRECT_URL is required (tunnel to VPS 127.0.0.1:5432)." >&2
  exit 1
fi

export DATABASE_URL="$DATABASE_DIRECT_URL"
cd packages/database
exec pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
