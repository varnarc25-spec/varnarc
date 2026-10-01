CREATE TABLE IF NOT EXISTS "resale_valuation_configs" (
  "id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "manufacturer_id" UUID,
  "model_id" UUID,
  "variant_id" UUID,
  "segment" TEXT,
  "fuel_type" TEXT,
  "key" TEXT NOT NULL,
  "value" DECIMAL(14, 6) NOT NULL,
  "min_value" DECIMAL(14, 6),
  "max_value" DECIMAL(14, 6),
  "effective_from" TIMESTAMP(3),
  "effective_to" TIMESTAMP(3),
  "source_name" TEXT,
  "source_url" TEXT,
  "last_verified_at" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "resale_valuation_configs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "resale_valuation_configs_type_is_active_idx"
  ON "resale_valuation_configs"("type", "is_active");
CREATE INDEX IF NOT EXISTS "resale_valuation_configs_key_idx"
  ON "resale_valuation_configs"("key");
CREATE INDEX IF NOT EXISTS "resale_valuation_configs_manufacturer_id_idx"
  ON "resale_valuation_configs"("manufacturer_id");
CREATE INDEX IF NOT EXISTS "resale_valuation_configs_model_id_idx"
  ON "resale_valuation_configs"("model_id");
