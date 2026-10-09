-- The Latitude 5450 launched in 2024. The stored name still said 2023.
UPDATE "crm_laptops"
SET "name" = 'Dell Latitude 5450 (2024) - Ultra i7', "updated_at" = NOW()
WHERE "slug" = 'dell-latitude-5450-2023-ultra-i7'
  AND "deleted_at" IS NULL;
