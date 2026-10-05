ALTER TABLE "laptop_rental_proposals"
  ADD COLUMN "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0;

ALTER TABLE "laptop_rental_proposal_laptops"
  ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "monthly_rate" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "commitment_rate" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "deposit_per_laptop" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "laptop_rental_proposal_laptops" AS link
SET
  "monthly_rate" = COALESCE(laptop."monthly_rate", 0),
  "commitment_rate" = laptop."commitment_rate",
  "deposit_per_laptop" = laptop."deposit_per_laptop"
FROM "crm_laptops" AS laptop
WHERE laptop."id" = link."laptop_id";
