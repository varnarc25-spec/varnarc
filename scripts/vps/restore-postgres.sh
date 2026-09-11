#!/usr/bin/env bash
# Restore a gzip SQL dump into host Postgres (127.0.0.1).
# DESTRUCTIVE for objects in the target database.
# Usage: bash scripts/vps/restore-postgres.sh backups/varnarc-YYYYMMDD.sql.gz
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

FILE="${1:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: $0 path/to/backup.sql.gz" >&2
  exit 1
fi

if [[ ! -f .env.production ]]; then
  echo "Missing .env.production" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.production
set +a

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-varnarc_db}"

echo "Restoring $FILE into host Postgres $DB_NAME (existing objects may be overwritten)."
gunzip -c "$FILE" | PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME"
echo "Restore finished. Restart API if it was running during restore:"
echo "  docker compose -f docker/docker-compose.vps.yml --env-file .env.production restart api"
