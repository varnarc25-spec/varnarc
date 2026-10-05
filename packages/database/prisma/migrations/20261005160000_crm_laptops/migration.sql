CREATE TYPE "crm_laptop_status" AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'RETIRED');

CREATE TABLE "crm_laptops" (
  "id" UUID NOT NULL,
  "asset_tag" TEXT NOT NULL,
  "serial_number" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT,
  "processor" TEXT NOT NULL,
  "ram" TEXT NOT NULL,
  "storage" TEXT NOT NULL,
  "display" TEXT NOT NULL,
  "operating_system" TEXT NOT NULL,
  "condition" TEXT,
  "notes" TEXT,
  "status" "crm_laptop_status" NOT NULL DEFAULT 'AVAILABLE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "crm_laptops_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "crm_laptops_asset_tag_key" ON "crm_laptops"("asset_tag");
CREATE UNIQUE INDEX "crm_laptops_serial_number_key" ON "crm_laptops"("serial_number");
CREATE INDEX "crm_laptops_status_idx" ON "crm_laptops"("status");

CREATE TABLE "laptop_rental_proposal_laptops" (
  "proposal_id" UUID NOT NULL,
  "laptop_id" UUID NOT NULL,
  CONSTRAINT "laptop_rental_proposal_laptops_pkey" PRIMARY KEY ("proposal_id", "laptop_id")
);

CREATE INDEX "laptop_rental_proposal_laptops_laptop_id_idx" ON "laptop_rental_proposal_laptops"("laptop_id");

ALTER TABLE "laptop_rental_proposal_laptops"
  ADD CONSTRAINT "laptop_rental_proposal_laptops_proposal_id_fkey"
  FOREIGN KEY ("proposal_id") REFERENCES "laptop_rental_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "laptop_rental_proposal_laptops"
  ADD CONSTRAINT "laptop_rental_proposal_laptops_laptop_id_fkey"
  FOREIGN KEY ("laptop_id") REFERENCES "crm_laptops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
