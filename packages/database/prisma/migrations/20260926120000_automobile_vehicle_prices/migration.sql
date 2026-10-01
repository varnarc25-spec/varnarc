ALTER TABLE "automobile_vehicles"
  ADD COLUMN IF NOT EXISTS "india_availability" TEXT,
  ADD COLUMN IF NOT EXISTS "primary_market" VARCHAR(2) NOT NULL DEFAULT 'IN';

ALTER TABLE "automobile_vehicle_images"
  ADD COLUMN IF NOT EXISTS "image_type" TEXT,
  ADD COLUMN IF NOT EXISTS "source_url" TEXT,
  ADD COLUMN IF NOT EXISTS "source_name" TEXT,
  ADD COLUMN IF NOT EXISTS "market" VARCHAR(2),
  ADD COLUMN IF NOT EXISTS "official" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "automobile_vehicle_prices" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "country_code" VARCHAR(2) NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL,
    "market" TEXT,
    "price_type" TEXT NOT NULL,
    "amount" DECIMAL(14,2),
    "price_min" DECIMAL(14,2),
    "price_max" DECIMAL(14,2),
    "city" TEXT,
    "state" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "source_name" TEXT,
    "source_type" TEXT,
    "source_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_vehicle_prices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "automobile_vehicle_prices_vehicle_id_country_code_is_current_idx"
  ON "automobile_vehicle_prices"("vehicle_id", "country_code", "is_current");

CREATE INDEX IF NOT EXISTS "automobile_vehicle_prices_vehicle_id_is_current_idx"
  ON "automobile_vehicle_prices"("vehicle_id", "is_current");

DO $$ BEGIN
  ALTER TABLE "automobile_vehicle_prices"
    ADD CONSTRAINT "automobile_vehicle_prices_vehicle_id_fkey"
    FOREIGN KEY ("vehicle_id") REFERENCES "automobile_vehicles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
