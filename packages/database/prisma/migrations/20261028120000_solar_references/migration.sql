CREATE TYPE "solar_reference_kind" AS ENUM ('LOCATION', 'TARIFF', 'INSTALLATION_PRICE', 'SUBSIDY', 'DEFAULTS');

CREATE TABLE "solar_references" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "kind" "solar_reference_kind" NOT NULL,
  "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "state" TEXT,
  "city" TEXT,
  "payload" JSONB NOT NULL,
  "source_url" TEXT,
  "source_label" TEXT,
  "last_verified_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "created_by" UUID,
  "updated_by" UUID,
  CONSTRAINT "solar_references_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "solar_references_kind_status_idx" ON "solar_references"("kind", "status");
CREATE INDEX "solar_references_state_city_idx" ON "solar_references"("state", "city");
