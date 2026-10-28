-- Files listed on each statistical report page, mapped to a state.

CREATE TABLE "election_states" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "election_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "election_states_name_key" ON "election_states"("name");
CREATE UNIQUE INDEX "election_states_slug_key" ON "election_states"("slug");

ALTER TABLE "election_statistical_reports" ADD COLUMN "state_id" UUID;
ALTER TABLE "election_statistical_reports" ADD COLUMN "page_heading" TEXT;
ALTER TABLE "election_statistical_reports" ADD COLUMN "files_fetched_at" TIMESTAMP(3);
ALTER TABLE "election_statistical_reports" ADD COLUMN "files_fetch_note" TEXT;

CREATE INDEX "election_statistical_reports_state_id_idx" ON "election_statistical_reports"("state_id");

CREATE TABLE "election_statistical_report_files" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "state_id" UUID,
    "seed_key" TEXT NOT NULL,
    "page_heading" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdf_url" TEXT,
    "pdf_size" TEXT,
    "xlsx_url" TEXT,
    "xlsx_size" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "election_statistical_report_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "election_statistical_report_files_seed_key_key" ON "election_statistical_report_files"("seed_key");
CREATE INDEX "election_statistical_report_files_report_id_sort_order_idx" ON "election_statistical_report_files"("report_id", "sort_order");
CREATE INDEX "election_statistical_report_files_state_id_idx" ON "election_statistical_report_files"("state_id");

ALTER TABLE "election_statistical_reports" ADD CONSTRAINT "election_statistical_reports_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "election_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "election_statistical_report_files" ADD CONSTRAINT "election_statistical_report_files_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "election_statistical_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "election_statistical_report_files" ADD CONSTRAINT "election_statistical_report_files_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "election_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
