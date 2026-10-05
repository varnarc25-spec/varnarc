CREATE TYPE "laptop_rental_agreement_status" AS ENUM ('PENDING_SIGNATURE', 'ACTIVE', 'CLOSED', 'CANCELLED');
CREATE TYPE "laptop_rental_unit_status" AS ENUM ('READY', 'DELIVERED', 'IN_REPAIR', 'REPLACED', 'PICKED_UP', 'LOST', 'STOLEN');
CREATE TYPE "laptop_rental_invoice_kind" AS ENUM ('RENTAL', 'CHARGE');
CREATE TYPE "laptop_rental_invoice_status" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'VOID');
CREATE TYPE "laptop_rental_case_kind" AS ENUM ('HARDWARE_FAULT', 'REPAIR', 'REPLACEMENT');
CREATE TYPE "laptop_rental_case_status" AS ENUM ('OPEN', 'RESOLVED');
CREATE TYPE "laptop_rental_charge_kind" AS ENUM ('PHYSICAL_DAMAGE', 'LIQUID_DAMAGE', 'THEFT', 'LOSS');
CREATE TYPE "laptop_rental_charge_settlement" AS ENUM ('INVOICE', 'DEPOSIT');
CREATE TYPE "laptop_rental_charge_status" AS ENUM ('OPEN', 'BILLED', 'PAID', 'WAIVED', 'DEDUCTED');

CREATE TABLE "laptop_rental_agreements" (
  "id" UUID NOT NULL,
  "proposal_id" UUID NOT NULL,
  "agreement_number" TEXT NOT NULL,
  "status" "laptop_rental_agreement_status" NOT NULL DEFAULT 'PENDING_SIGNATURE',
  "po_number" TEXT,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "sla_hours" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "commitment_months" INTEGER NOT NULL,
  "commitment_rate" DECIMAL(12,2) NOT NULL,
  "gst_percent" DECIMAL(5,2) NOT NULL,
  "deposit_per_laptop" DECIMAL(12,2) NOT NULL,
  "delivery_location" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "customer_signatory_name" TEXT,
  "customer_signatory_designation" TEXT,
  "customer_signed_on" DATE,
  "issuer_signatory_name" TEXT,
  "issuer_signatory_designation" TEXT,
  "issuer_signed_on" DATE,
  "deposit_received" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "deposit_received_on" DATE,
  "deposit_refunded" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "deposit_refunded_on" DATE,
  "deposit_notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "laptop_rental_agreements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "laptop_rental_agreements_proposal_id_key" ON "laptop_rental_agreements"("proposal_id");
CREATE UNIQUE INDEX "laptop_rental_agreements_agreement_number_key" ON "laptop_rental_agreements"("agreement_number");
CREATE INDEX "laptop_rental_agreements_status_idx" ON "laptop_rental_agreements"("status");

ALTER TABLE "laptop_rental_agreements"
  ADD CONSTRAINT "laptop_rental_agreements_proposal_id_fkey"
  FOREIGN KEY ("proposal_id") REFERENCES "laptop_rental_proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "laptop_rental_units" (
  "id" UUID NOT NULL,
  "agreement_id" UUID NOT NULL,
  "asset_tag" TEXT NOT NULL,
  "serial_number" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "status" "laptop_rental_unit_status" NOT NULL DEFAULT 'READY',
  "delivered_on" DATE,
  "picked_up_on" DATE,
  "replaces_unit_id" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "laptop_rental_units_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "laptop_rental_units_asset_tag_key" ON "laptop_rental_units"("asset_tag");
CREATE UNIQUE INDEX "laptop_rental_units_replaces_unit_id_key" ON "laptop_rental_units"("replaces_unit_id");
CREATE INDEX "laptop_rental_units_agreement_id_idx" ON "laptop_rental_units"("agreement_id");
CREATE INDEX "laptop_rental_units_status_idx" ON "laptop_rental_units"("status");

ALTER TABLE "laptop_rental_units"
  ADD CONSTRAINT "laptop_rental_units_agreement_id_fkey"
  FOREIGN KEY ("agreement_id") REFERENCES "laptop_rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "laptop_rental_units"
  ADD CONSTRAINT "laptop_rental_units_replaces_unit_id_fkey"
  FOREIGN KEY ("replaces_unit_id") REFERENCES "laptop_rental_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "laptop_rental_invoices" (
  "id" UUID NOT NULL,
  "agreement_id" UUID NOT NULL,
  "invoice_number" TEXT NOT NULL,
  "kind" "laptop_rental_invoice_kind" NOT NULL,
  "period" TEXT NOT NULL,
  "rental_amount" DECIMAL(12,2) NOT NULL,
  "gst_amount" DECIMAL(12,2) NOT NULL,
  "total_amount" DECIMAL(12,2) NOT NULL,
  "status" "laptop_rental_invoice_status" NOT NULL DEFAULT 'DRAFT',
  "issued_on" DATE,
  "paid_on" DATE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "laptop_rental_invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "laptop_rental_invoices_invoice_number_key" ON "laptop_rental_invoices"("invoice_number");
CREATE UNIQUE INDEX "laptop_rental_invoices_agreement_id_kind_period_key" ON "laptop_rental_invoices"("agreement_id", "kind", "period");
CREATE INDEX "laptop_rental_invoices_agreement_id_idx" ON "laptop_rental_invoices"("agreement_id");
CREATE INDEX "laptop_rental_invoices_status_idx" ON "laptop_rental_invoices"("status");

ALTER TABLE "laptop_rental_invoices"
  ADD CONSTRAINT "laptop_rental_invoices_agreement_id_fkey"
  FOREIGN KEY ("agreement_id") REFERENCES "laptop_rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "laptop_rental_cases" (
  "id" UUID NOT NULL,
  "agreement_id" UUID NOT NULL,
  "unit_id" UUID NOT NULL,
  "kind" "laptop_rental_case_kind" NOT NULL,
  "status" "laptop_rental_case_status" NOT NULL DEFAULT 'OPEN',
  "summary" TEXT NOT NULL,
  "resolution" TEXT,
  "reported_at" TIMESTAMP(3) NOT NULL,
  "due_at" TIMESTAMP(3) NOT NULL,
  "resolved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "laptop_rental_cases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "laptop_rental_cases_agreement_id_idx" ON "laptop_rental_cases"("agreement_id");
CREATE INDEX "laptop_rental_cases_unit_id_idx" ON "laptop_rental_cases"("unit_id");
CREATE INDEX "laptop_rental_cases_status_idx" ON "laptop_rental_cases"("status");

ALTER TABLE "laptop_rental_cases"
  ADD CONSTRAINT "laptop_rental_cases_agreement_id_fkey"
  FOREIGN KEY ("agreement_id") REFERENCES "laptop_rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "laptop_rental_cases"
  ADD CONSTRAINT "laptop_rental_cases_unit_id_fkey"
  FOREIGN KEY ("unit_id") REFERENCES "laptop_rental_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "laptop_rental_charges" (
  "id" UUID NOT NULL,
  "agreement_id" UUID NOT NULL,
  "unit_id" UUID,
  "invoice_id" UUID,
  "kind" "laptop_rental_charge_kind" NOT NULL,
  "settlement" "laptop_rental_charge_settlement" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "description" TEXT NOT NULL,
  "status" "laptop_rental_charge_status" NOT NULL DEFAULT 'OPEN',
  "reported_on" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "laptop_rental_charges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "laptop_rental_charges_agreement_id_idx" ON "laptop_rental_charges"("agreement_id");
CREATE INDEX "laptop_rental_charges_unit_id_idx" ON "laptop_rental_charges"("unit_id");
CREATE INDEX "laptop_rental_charges_status_idx" ON "laptop_rental_charges"("status");

ALTER TABLE "laptop_rental_charges"
  ADD CONSTRAINT "laptop_rental_charges_agreement_id_fkey"
  FOREIGN KEY ("agreement_id") REFERENCES "laptop_rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "laptop_rental_charges"
  ADD CONSTRAINT "laptop_rental_charges_unit_id_fkey"
  FOREIGN KEY ("unit_id") REFERENCES "laptop_rental_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "laptop_rental_charges"
  ADD CONSTRAINT "laptop_rental_charges_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "laptop_rental_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
