-- Election Commission statistical report catalog.

CREATE TYPE "election_report_section" AS ENUM ('LOK_SABHA', 'STATE_ASSEMBLY', 'BYE_ELECTION', 'FORMER_STATE', 'REFERENCE');

CREATE TABLE "election_statistical_reports" (
    "id" UUID NOT NULL,
    "seed_key" TEXT NOT NULL,
    "section" "election_report_section" NOT NULL,
    "jurisdiction" TEXT,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "source_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "election_statistical_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "election_statistical_reports_seed_key_key" ON "election_statistical_reports"("seed_key");
CREATE INDEX "election_statistical_reports_section_sort_order_idx" ON "election_statistical_reports"("section", "sort_order");
CREATE INDEX "election_statistical_reports_jurisdiction_idx" ON "election_statistical_reports"("jurisdiction");
