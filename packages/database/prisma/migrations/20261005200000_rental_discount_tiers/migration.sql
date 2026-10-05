CREATE TABLE "crm_rental_discounts" (
  "id" UUID NOT NULL,
  "months" INTEGER NOT NULL,
  "percent" DECIMAL(5,2) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_rental_discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "crm_rental_discounts_months_key" ON "crm_rental_discounts"("months");

INSERT INTO "crm_rental_discounts" ("id", "months", "percent", "sort_order", "updated_at") VALUES
  (gen_random_uuid(), 3, 5, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 6, 10, 1, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 9, 15, 2, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 12, 20, 3, CURRENT_TIMESTAMP);
