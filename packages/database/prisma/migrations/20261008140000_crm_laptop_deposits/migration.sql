-- Security deposit by processor. Macs are set first so an Intel Mac is not priced as a Windows i7.
UPDATE "crm_laptops"
SET "deposit_per_laptop" = 25000, "updated_at" = NOW()
WHERE "category" = 'APPLE_LAPTOP';

UPDATE "crm_laptops"
SET "deposit_per_laptop" = 25000, "updated_at" = NOW()
WHERE "category" <> 'APPLE_LAPTOP'
  AND ("processor" ILIKE '%i7%' OR "processor" ILIKE '%ultra 7%');

UPDATE "crm_laptops"
SET "deposit_per_laptop" = 20000, "updated_at" = NOW()
WHERE "category" <> 'APPLE_LAPTOP'
  AND "processor" ILIKE '%i5%';

UPDATE "crm_laptops"
SET "deposit_per_laptop" = 15000, "updated_at" = NOW()
WHERE "category" <> 'APPLE_LAPTOP'
  AND "processor" ILIKE '%i3%';

UPDATE "crm_laptops"
SET "deposit_per_laptop" = 10000, "updated_at" = NOW()
WHERE "category" <> 'APPLE_LAPTOP'
  AND "processor" NOT ILIKE '%i3%'
  AND "processor" NOT ILIKE '%i5%'
  AND "processor" NOT ILIKE '%i7%'
  AND "processor" NOT ILIKE '%ultra 7%';
