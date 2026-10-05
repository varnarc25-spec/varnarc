CREATE TYPE "laptop_rental_proposal_status" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED');

CREATE TABLE "laptop_rental_proposals" (
  "id" UUID NOT NULL,
  "proposal_number" TEXT NOT NULL,
  "status" "laptop_rental_proposal_status" NOT NULL DEFAULT 'DRAFT',
  "client_id" UUID NOT NULL,
  "customer_company_name" TEXT NOT NULL,
  "proposal_date" DATE NOT NULL,
  "title" TEXT NOT NULL,
  "proposal_summary" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "processor" TEXT NOT NULL,
  "ram" TEXT NOT NULL,
  "storage" TEXT NOT NULL,
  "display" TEXT NOT NULL,
  "operating_system" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "condition" TEXT NOT NULL,
  "accessories" TEXT NOT NULL,
  "monthly_rate" DECIMAL(12,2) NOT NULL,
  "commitment_months" INTEGER NOT NULL,
  "commitment_rate" DECIMAL(12,2) NOT NULL,
  "gst_percent" DECIMAL(5,2) NOT NULL,
  "deposit_per_laptop" DECIMAL(12,2) NOT NULL,
  "delivery_location" TEXT NOT NULL,
  "services" TEXT[] NOT NULL,
  "support_text" TEXT NOT NULL,
  "responsibilities" TEXT[] NOT NULL,
  "payment_due_text" TEXT NOT NULL,
  "deposit_note" TEXT NOT NULL,
  "return_intro" TEXT NOT NULL,
  "return_checks" TEXT[] NOT NULL,
  "wear_note" TEXT NOT NULL,
  "acceptance_text" TEXT NOT NULL,
  "gst_note" TEXT NOT NULL,
  "customer_signatory_name" TEXT,
  "customer_signatory_designation" TEXT,
  "issuer_signatory_name" TEXT,
  "issuer_signatory_designation" TEXT,
  "issuer_name" TEXT NOT NULL,
  "issuer_address" TEXT,
  "issuer_phone" TEXT,
  "issuer_email" TEXT,
  "issuer_gstin" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "laptop_rental_proposals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "laptop_rental_proposals_proposal_number_key" ON "laptop_rental_proposals"("proposal_number");
CREATE INDEX "laptop_rental_proposals_client_id_idx" ON "laptop_rental_proposals"("client_id");
CREATE INDEX "laptop_rental_proposals_status_idx" ON "laptop_rental_proposals"("status");
CREATE INDEX "laptop_rental_proposals_proposal_date_idx" ON "laptop_rental_proposals"("proposal_date");

ALTER TABLE "laptop_rental_proposals"
  ADD CONSTRAINT "laptop_rental_proposals_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "hr_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
