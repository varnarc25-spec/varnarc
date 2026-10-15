-- Documents, forms, and templates catalog.

CREATE TYPE "document_template_status" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "document_template_kind" AS ENUM ('LETTER', 'CERTIFICATE', 'AGREEMENT', 'INVOICE', 'RECEIPT', 'CHECKLIST', 'GUIDANCE', 'APPLICATION');
CREATE TYPE "generated_document_status" AS ENUM ('DRAFT', 'COMPLETED', 'EXPIRED', 'DELETED');
CREATE TYPE "document_file_format" AS ENUM ('PDF', 'DOCX', 'HTML');

CREATE TABLE "document_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "icon" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seed_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_categories_slug_key" ON "document_categories"("slug");
CREATE UNIQUE INDEX "document_categories_seed_key_key" ON "document_categories"("seed_key");
CREATE INDEX "document_categories_parent_id_display_order_idx" ON "document_categories"("parent_id", "display_order");
CREATE INDEX "document_categories_is_active_idx" ON "document_categories"("is_active");

CREATE TABLE "document_templates" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "full_description" TEXT NOT NULL,
    "template_type" "document_template_kind" NOT NULL,
    "jurisdiction" TEXT NOT NULL DEFAULT 'IN',
    "state" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "form_schema" JSONB NOT NULL,
    "template_content" JSONB NOT NULL,
    "editorial" JSONB NOT NULL,
    "template_version" INTEGER NOT NULL DEFAULT 1,
    "status" "document_template_status" NOT NULL DEFAULT 'DRAFT',
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "legal_disclaimer" TEXT,
    "official_source_url" TEXT,
    "seo_title" TEXT NOT NULL,
    "seo_description" TEXT NOT NULL,
    "canonical_url" TEXT,
    "published_at" TIMESTAMP(3),
    "last_verified_at" TIMESTAMP(3),
    "next_review_at" TIMESTAMP(3),
    "reviewed_by_user_id" UUID,
    "generation_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "seed_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_templates_slug_key" ON "document_templates"("slug");
CREATE UNIQUE INDEX "document_templates_seed_key_key" ON "document_templates"("seed_key");
CREATE INDEX "document_templates_category_id_status_idx" ON "document_templates"("category_id", "status");
CREATE INDEX "document_templates_status_published_at_idx" ON "document_templates"("status", "published_at");
CREATE INDEX "document_templates_status_download_count_idx" ON "document_templates"("status", "download_count");
CREATE INDEX "document_templates_language_jurisdiction_idx" ON "document_templates"("language", "jurisdiction");

CREATE TABLE "document_seo" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "focus_keyword" TEXT NOT NULL,
    "secondary_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "faq_content" JSONB NOT NULL,
    "structured_data" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_seo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_seo_template_id_key" ON "document_seo"("template_id");

CREATE TABLE "document_related" (
    "template_id" UUID NOT NULL,
    "related_template_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "document_related_pkey" PRIMARY KEY ("template_id","related_template_id")
);

CREATE INDEX "document_related_related_template_id_idx" ON "document_related"("related_template_id");

CREATE TABLE "document_versions" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "schema_snapshot" JSONB NOT NULL,
    "content_snapshot" JSONB NOT NULL,
    "change_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_versions_template_id_version_key" ON "document_versions"("template_id", "version");
CREATE INDEX "document_versions_template_id_idx" ON "document_versions"("template_id");

CREATE TABLE "generated_documents" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "template_version" INTEGER NOT NULL,
    "user_id" UUID,
    "title" TEXT NOT NULL,
    "encrypted_input_data" TEXT NOT NULL,
    "encrypted_rendered_content" TEXT NOT NULL,
    "status" "generated_document_status" NOT NULL DEFAULT 'COMPLETED',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "generated_documents_user_id_created_at_idx" ON "generated_documents"("user_id", "created_at");
CREATE INDEX "generated_documents_template_id_idx" ON "generated_documents"("template_id");
CREATE INDEX "generated_documents_expires_at_idx" ON "generated_documents"("expires_at");

CREATE TABLE "document_downloads" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "generated_document_id" UUID,
    "user_id" UUID,
    "format" "document_file_format" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_downloads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "document_downloads_template_id_created_at_idx" ON "document_downloads"("template_id", "created_at");
CREATE INDEX "document_downloads_user_id_created_at_idx" ON "document_downloads"("user_id", "created_at");

CREATE TABLE "document_analytics_events" (
    "id" UUID NOT NULL,
    "template_id" UUID,
    "event_type" TEXT NOT NULL,
    "category_slug" TEXT,
    "query_text" TEXT,
    "format" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "document_analytics_events_event_type_created_at_idx" ON "document_analytics_events"("event_type", "created_at");
CREATE INDEX "document_analytics_events_template_id_event_type_idx" ON "document_analytics_events"("template_id", "event_type");

ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_seo" ADD CONSTRAINT "document_seo_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_related" ADD CONSTRAINT "document_related_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_related" ADD CONSTRAINT "document_related_related_template_id_fkey" FOREIGN KEY ("related_template_id") REFERENCES "document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_downloads" ADD CONSTRAINT "document_downloads_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_downloads" ADD CONSTRAINT "document_downloads_generated_document_id_fkey" FOREIGN KEY ("generated_document_id") REFERENCES "generated_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_downloads" ADD CONSTRAINT "document_downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_analytics_events" ADD CONSTRAINT "document_analytics_events_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
