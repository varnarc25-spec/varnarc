# PostgreSQL and Redis

## PostgreSQL (production database)

- Prefer VPS Postgres (`docker-compose.vps.yml` `postgres` service) for production
- `DATABASE_URL` / `DATABASE_DIRECT_URL` should point at that instance (Docker DNS `postgres:5432` on the VPS)
- Run migrations before deploy: `pnpm deploy:migrate` or CI migrate job

### CI migration

`.github/workflows/deploy.yml` runs `prisma migrate deploy` with `DATABASE_URL` from GitHub secrets (staging/production environments).

### Connection limits

Cloud Run (legacy) scales horizontally — set reasonable `max-instances` on the API service and do not expose Postgres publicly.

## Redis (cache + BullMQ)

Options:

| Provider              | Notes                                              |
| --------------------- | -------------------------------------------------- |
| Memorystore for Redis | VPC — needs Serverless VPC connector for Cloud Run |
| Upstash               | HTTPS/Redis URL friendly for Cloud Run             |
| Redis Cloud           | Managed, external URL                              |
| VPS Redis             | `docker-compose.vps.yml` Redis service             |

Set `REDIS_URL` in Secret Manager or `.env.production`. API uses Redis for cache and optional BullMQ analytics queue.

Without Redis, API uses in-memory cache (`/ready` reports `redis: memory`).

## Cloudinary

Media remains external — no GCS required unless using `GCS_*` for Media Library. Configure in admin / env as documented in Media module.

## Auth0

Separate applications:

- Web (Regular Web App)
