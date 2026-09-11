#!/usr/bin/env bash
# Logical backup of host Postgres (127.0.0.1), not a Docker container.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.production ]]; then
  echo "Missing .env.production" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.production
set +a

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$OUT_DIR"
FILE="$OUT_DIR/varnarc-${STAMP}.sql.gz"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-varnarc_db}"

echo "Writing $FILE"
PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_dump -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$FILE"
echo "Done. Keep this file off the VPS as well (copy to object storage)."
