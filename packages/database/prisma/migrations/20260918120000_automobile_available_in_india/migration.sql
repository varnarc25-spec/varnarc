-- Existing DBs applied 00000000000000_init before this column existed in schema.
ALTER TABLE "automobile_vehicles"
  ADD COLUMN IF NOT EXISTS "available_in_india" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "automobile_vehicles_available_in_india_idx"
  ON "automobile_vehicles"("available_in_india");
