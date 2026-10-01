ALTER TABLE "automobile_manufacturers"
  ADD COLUMN IF NOT EXISTS "available_in_india" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "india_availability_status" TEXT,
  ADD COLUMN IF NOT EXISTS "india_website" TEXT,
  ADD COLUMN IF NOT EXISTS "india_verified_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "india_verification_note" TEXT;

CREATE INDEX IF NOT EXISTS "automobile_manufacturers_available_in_india_idx"
  ON "automobile_manufacturers"("available_in_india");
