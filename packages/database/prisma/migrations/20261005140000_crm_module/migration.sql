CREATE TYPE "crm_activity_kind" AS ENUM ('NOTE', 'CALL', 'MEETING', 'EMAIL');

CREATE TABLE "crm_companies" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "gstin" TEXT,
  "website" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "crm_companies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_companies_name_idx" ON "crm_companies"("name");

CREATE TABLE "crm_contacts" (
  "id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "designation" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_contacts_company_id_idx" ON "crm_contacts"("company_id");

CREATE TABLE "crm_activities" (
  "id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "proposal_id" UUID,
  "kind" "crm_activity_kind" NOT NULL DEFAULT 'NOTE',
  "body" TEXT NOT NULL,
  "occurred_on" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_activities_company_id_idx" ON "crm_activities"("company_id");
CREATE INDEX "crm_activities_proposal_id_idx" ON "crm_activities"("proposal_id");

INSERT INTO "crm_companies" ("id", "name", "created_at", "updated_at")
SELECT "id", "name", "created_at", CURRENT_TIMESTAMP
FROM "hr_clients"
WHERE "id" IN (SELECT "client_id" FROM "laptop_rental_proposals");

ALTER TABLE "laptop_rental_proposals" DROP CONSTRAINT "laptop_rental_proposals_client_id_fkey";
DROP INDEX "laptop_rental_proposals_client_id_idx";
ALTER TABLE "laptop_rental_proposals" RENAME COLUMN "client_id" TO "company_id";
CREATE INDEX "laptop_rental_proposals_company_id_idx" ON "laptop_rental_proposals"("company_id");

ALTER TABLE "laptop_rental_proposals"
  ADD CONSTRAINT "laptop_rental_proposals_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "crm_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm_contacts"
  ADD CONSTRAINT "crm_contacts_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "crm_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm_activities"
  ADD CONSTRAINT "crm_activities_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "crm_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm_activities"
  ADD CONSTRAINT "crm_activities_proposal_id_fkey"
  FOREIGN KEY ("proposal_id") REFERENCES "laptop_rental_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
