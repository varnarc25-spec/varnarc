ALTER TABLE "laptop_rental_units"
  ADD COLUMN "model" TEXT,
  ADD COLUMN "processor" TEXT,
  ADD COLUMN "ram" TEXT,
  ADD COLUMN "storage" TEXT,
  ADD COLUMN "display" TEXT,
  ADD COLUMN "operating_system" TEXT;

UPDATE "laptop_rental_units" AS unit
SET
  "processor" = proposal."processor",
  "ram" = proposal."ram",
  "storage" = proposal."storage",
  "display" = proposal."display",
  "operating_system" = proposal."operating_system"
FROM "laptop_rental_agreements" AS agreement
JOIN "laptop_rental_proposals" AS proposal ON proposal."id" = agreement."proposal_id"
WHERE unit."agreement_id" = agreement."id";
