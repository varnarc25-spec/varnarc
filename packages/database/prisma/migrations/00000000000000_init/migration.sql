-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'DISABLED', 'PENDING', 'DELETED');

-- CreateEnum
CREATE TYPE "publish_status" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "article_type" AS ENUM ('GENERAL', 'GUIDE', 'CALCULATOR_GUIDE', 'COMPARISON', 'HOW_TO', 'RATES', 'ELIGIBILITY', 'NEWS');

-- CreateEnum
CREATE TYPE "media_resource_type" AS ENUM ('IMAGE', 'VIDEO', 'RAW', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ad_status" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ad_type" AS ENUM ('ADSENSE', 'BANNER', 'HTML', 'JAVASCRIPT', 'AFFILIATE', 'SPONSORED', 'NATIVE', 'CTA', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ad_provider" AS ENUM ('GOOGLE_ADSENSE', 'DIRECT', 'AFFILIATE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ad_content_type" AS ENUM ('IMAGE', 'HTML', 'JAVASCRIPT', 'TEXT', 'SCRIPT_SLOT');

-- CreateEnum
CREATE TYPE "ad_rotation_mode" AS ENUM ('SEQUENTIAL', 'RANDOM', 'WEIGHTED', 'PRIORITY');

-- CreateEnum
CREATE TYPE "calculation_status" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "construction_project_status" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "construction_location_type" AS ENUM ('COUNTRY', 'STATE', 'DISTRICT', 'CITY', 'LOCALITY');

-- CreateEnum
CREATE TYPE "construction_rate_source_type" AS ENUM ('OFFICIAL_SOR', 'OFFICIAL_MARKET_SURVEY', 'OFFICIAL_STATISTICS', 'MANUFACTURER', 'AUTHORIZED_DEALER', 'MARKET_SURVEY', 'VARNARC_VERIFIED', 'DERIVED', 'ESTIMATED_FALLBACK', 'USER_OVERRIDE');

-- CreateEnum
CREATE TYPE "construction_rate_confidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "construction_rate_record_status" AS ENUM ('DRAFT', 'ACTIVE', 'AGING', 'STALE', 'REVIEW_REQUIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "construction_resource_type" AS ENUM ('MATERIAL', 'LABOUR', 'EQUIPMENT', 'SUBCONTRACT', 'PROFESSIONAL', 'INTERIOR');

-- CreateEnum
CREATE TYPE "construction_commercial_rule_kind" AS ENUM ('TAX', 'OVERHEAD', 'PROFIT', 'CONTINGENCY', 'ESCALATION');

-- CreateEnum
CREATE TYPE "construction_rate_review_status" AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "construction_quotation_status" AS ENUM ('DRAFT', 'RECEIVED', 'COMPARED', 'SELECTED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "construction_price_freshness" AS ENUM ('LIVE', 'VERIFIED', 'ESTIMATED', 'STALE');

-- CreateEnum
CREATE TYPE "construction_vcci_publication_status" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "construction_boq_status" AS ENUM ('DRAFT', 'ACTIVE', 'FINALIZED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "construction_seo_audit_run_status" AS ENUM ('QUEUED', 'RUNNING_FAST', 'RUNNING_DEFERRED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "construction_seo_audit_severity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "construction_seo_audit_issue_status" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "construction_phase_status" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "construction_document_kind" AS ENUM ('DRAWING', 'PERMIT', 'QUOTE', 'INVOICE', 'PHOTO', 'CONTRACT', 'OTHER', 'FLOOR_PLAN', 'STRUCTURAL', 'BOQ', 'RECEIPT', 'APPROVAL', 'WARRANTY', 'MATERIAL_BILL');

-- CreateEnum
CREATE TYPE "construction_alert_status" AS ENUM ('ACTIVE', 'TRIGGERED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "construction_alert_direction" AS ENUM ('BELOW', 'ABOVE', 'DROP_PCT', 'RISE_PCT');

-- CreateEnum
CREATE TYPE "construction_community_price_status" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "ai_job_status" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "business_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "listing_type" AS ENUM ('FREE', 'VERIFIED', 'FEATURED', 'SPONSORED', 'PREMIUM');

-- CreateEnum
CREATE TYPE "verification_status" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "contact_message_status" AS ENUM ('NEW', 'SENT', 'FAILED', 'SPAM', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "directory_event_type" AS ENUM ('VIEW', 'PROFILE_CLICK', 'WEBSITE_CLICK', 'PHONE_CLICK', 'WHATSAPP_CLICK', 'EMAIL_CLICK', 'LEAD_REQUEST', 'SEARCH');

-- CreateEnum
CREATE TYPE "ai_pricing_model" AS ENUM ('FREE', 'FREEMIUM', 'SUBSCRIPTION', 'PAY_AS_YOU_GO', 'ENTERPRISE', 'LIFETIME');

-- CreateEnum
CREATE TYPE "ai_tool_event_type" AS ENUM ('VIEW', 'OUTBOUND_CLICK', 'AFFILIATE_CLICK', 'BOOKMARK', 'SEARCH', 'COMPARE');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "construction_search_opportunity_status" AS ENUM ('OPEN', 'PLANNED', 'IMPLEMENTED', 'IGNORED');

-- CreateEnum
CREATE TYPE "search_entity_type" AS ENUM ('ARTICLE', 'PAGE', 'CMS_CATEGORY', 'TAG', 'GUIDE', 'LOAN', 'BANK', 'CREDIT_CARD', 'INSURANCE', 'MATERIAL', 'BRAND', 'VEHICLE', 'MANUFACTURER', 'DEALER', 'BUSINESS', 'BUSINESS_SERVICE', 'VENDOR', 'AI_TOOL', 'AI_CATEGORY', 'CALCULATOR', 'FORMULA_PAGE', 'REVIEW', 'COMPARISON', 'MEDIA');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth0_user_id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "avatar_media_id" UUID,
    "bio" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "website" TEXT,
    "social_links" JSONB,
    "profile_visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ip_address" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "operating_system" TEXT,
    "country" TEXT,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "user_id" UUID,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "collection_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "theme" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "notification_settings" JSONB,
    "privacy_settings" JSONB,
    "newsletter_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "activity_type" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_content_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subscription_type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_content_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "destination" TEXT NOT NULL DEFAULT 'general',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "company" TEXT,
    "org_website" TEXT,
    "page_url" TEXT,
    "metadata" JSONB,
    "status" "contact_message_status" NOT NULL DEFAULT 'NEW',
    "email_error" TEXT,
    "sent_at" TIMESTAMP(3),
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tokens" JSONB NOT NULL,
    "fonts" JSONB,
    "colors" JSONB,
    "branding" JSONB,
    "css_vars" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "tenant_key" TEXT,
    "season" TEXT,
    "scheduled_from" TIMESTAMP(3),
    "scheduled_until" TIMESTAMP(3),
    "marketplace_listed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_assets" (
    "id" UUID NOT NULL,
    "theme_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "media_id" UUID,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theme_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "parent_id" UUID,
    "label" TEXT NOT NULL,
    "href" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_albums" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "media_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "folder_id" UUID,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "resource_type" "media_resource_type" NOT NULL DEFAULT 'IMAGE',
    "original_name" TEXT,
    "file_name" TEXT,
    "mime_type" TEXT,
    "format" TEXT,
    "bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "thumbnail_url" TEXT,
    "title" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_asset_blobs" (
    "asset_id" UUID NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "media_asset_blobs_pkey" PRIMARY KEY ("asset_id")
);

-- CreateTable
CREATE TABLE "media_usage" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "field_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_asset_versions" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_asset_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_album_assets" (
    "album_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "media_album_assets_pkey" PRIMARY KEY ("album_id","asset_id")
);

-- CreateTable
CREATE TABLE "media_asset_tags" (
    "asset_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "media_asset_tags_pkey" PRIMARY KEY ("asset_id","tag_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "category_id" UUID,
    "featured_image_id" UUID,
    "hero_image_id" UUID,
    "og_image_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "reading_time_minutes" INTEGER,
    "article_type" "article_type" NOT NULL DEFAULT 'GENERAL',
    "article_style" VARCHAR(80) NOT NULL DEFAULT 'default',
    "custom_css_class" VARCHAR(80),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_related" (
    "article_id" UUID NOT NULL,
    "related_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_related_pkey" PRIMARY KEY ("article_id","related_id")
);

-- CreateTable
CREATE TABLE "page_versions" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_versions" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "article_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "article_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "user_id" UUID,
    "parent_id" UUID,
    "body" TEXT NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "meta_keywords" TEXT,
    "canonical_url" TEXT,
    "og_image" TEXT,
    "robots" TEXT,
    "twitter_card" TEXT,
    "schema_type" TEXT,
    "language" TEXT,
    "structured_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_redirects" (
    "id" UUID NOT NULL,
    "source_path" VARCHAR(500) NOT NULL,
    "target_path" VARCHAR(1000) NOT NULL,
    "redirect_type" INTEGER NOT NULL DEFAULT 301,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_audits" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(80),
    "entity_id" UUID,
    "issue_type" VARCHAR(80) NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'warning',
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_layouts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "homepage_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" UUID NOT NULL,
    "layout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_instances" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "widget_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "widget_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_placements" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "rotation_mode" "ad_rotation_mode" NOT NULL DEFAULT 'PRIORITY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ad_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "id" UUID NOT NULL,
    "sponsor_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ad_status" NOT NULL DEFAULT 'DRAFT',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "budget" DECIMAL(12,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "max_impressions" INTEGER,
    "max_clicks" INTEGER,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "placement_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ad_type" NOT NULL DEFAULT 'BANNER',
    "provider" "ad_provider" NOT NULL DEFAULT 'DIRECT',
    "content_type" "ad_content_type" NOT NULL DEFAULT 'IMAGE',
    "status" "ad_status" NOT NULL DEFAULT 'DRAFT',
    "creative_url" TEXT,
    "html_content" TEXT,
    "javascript_code" TEXT,
    "target_url" TEXT,
    "adsense_slot" TEXT,
    "adsense_client" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "max_impressions" INTEGER,
    "max_clicks" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "targeting" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_impressions" (
    "id" UUID NOT NULL,
    "ad_id" UUID NOT NULL,
    "session_id" TEXT,
    "page_path" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "device" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_impressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_clicks" (
    "id" UUID NOT NULL,
    "ad_id" UUID NOT NULL,
    "session_id" TEXT,
    "page_path" TEXT,
    "destination_url" TEXT,
    "referrer" TEXT,
    "user_agent" TEXT,
    "device" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculator_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "calculator_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculators" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "illustration_url" TEXT,
    "illustration_media_id" UUID,
    "illustration_alt" TEXT,
    "category_id" UUID,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "formula" TEXT,
    "result_template" JSONB,
    "settings" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "calculators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculator_fields" (
    "id" UUID NOT NULL,
    "calculator_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "default_value" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "validation" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "calculator_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculator_versions" (
    "id" UUID NOT NULL,
    "calculator_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "formula" TEXT,
    "settings" JSONB,
    "snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "calculator_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_history" (
    "id" UUID NOT NULL,
    "calculator_id" UUID NOT NULL,
    "user_id" UUID,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB,
    "status" "calculation_status" NOT NULL DEFAULT 'PENDING',
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculator_analytics_events" (
    "id" UUID NOT NULL,
    "calculator_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "session_id" TEXT,
    "user_id" UUID,
    "device" TEXT,
    "referrer" TEXT,
    "duration_ms" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculator_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_calculations" (
    "id" UUID NOT NULL,
    "calculator_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "saved_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "introduction" TEXT,
    "icon" TEXT,
    "icon_media_id" UUID,
    "icon_alt" TEXT,
    "featured_image" TEXT,
    "featured_image_media_id" UUID,
    "featured_image_alt" TEXT,
    "hero_image" TEXT,
    "hero_image_media_id" UUID,
    "hero_image_alt" TEXT,
    "min_interest_rate" DECIMAL(8,4),
    "max_interest_rate" DECIMAL(8,4),
    "typical_min_amount" DECIMAL(14,2),
    "typical_max_amount" DECIMAL(14,2),
    "typical_min_tenure" INTEGER,
    "typical_max_tenure" INTEGER,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "seo_content" TEXT,
    "content_sections" JSONB,
    "loan_hub_enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "finance_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legal_name" TEXT,
    "lender_type" TEXT,
    "logo_url" TEXT,
    "logo_media_id" UUID,
    "logo_alt" TEXT,
    "website" TEXT,
    "description" TEXT,
    "headquarters" TEXT,
    "support_url" TEXT,
    "source_url" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "category_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "loan_type" TEXT NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "interest_rate" DECIMAL(8,4),
    "interest_rate_min" DECIMAL(8,4),
    "interest_rate_max" DECIMAL(8,4),
    "rate_type" TEXT,
    "benchmark_type" TEXT,
    "processing_fee" DECIMAL(8,4),
    "processing_fee_min" DECIMAL(8,4),
    "processing_fee_max" DECIMAL(8,4),
    "processing_fee_text" TEXT,
    "foreclosure_charge_text" TEXT,
    "prepayment_charge_text" TEXT,
    "late_payment_charge_text" TEXT,
    "tenure_min" INTEGER,
    "tenure_max" INTEGER,
    "loan_amount_min" DECIMAL(14,2),
    "loan_amount_max" DECIMAL(14,2),
    "max_amount" DECIMAL(14,2),
    "minimum_age" INTEGER,
    "maximum_age" INTEGER,
    "minimum_income" DECIMAL(14,2),
    "minimum_credit_score" INTEGER,
    "employment_types" JSONB,
    "eligibility" TEXT,
    "eligibility_summary" TEXT,
    "documents_required" JSONB,
    "features" JSONB,
    "benefits" TEXT,
    "disadvantages" TEXT,
    "application_process" TEXT,
    "approval_time" TEXT,
    "disbursement_time" TEXT,
    "official_application_url" TEXT,
    "source_url" TEXT,
    "rate_last_verified_at" TIMESTAMP(3),
    "affiliate_url" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsored_disclosure" TEXT,
    "needs_rate_review" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "review_product_id" UUID,
    "metadata" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "category_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "annual_fee" DECIMAL(12,2),
    "joining_fee" DECIMAL(12,2),
    "rewards" TEXT,
    "cashback" TEXT,
    "lounge_access" BOOLEAN NOT NULL DEFAULT false,
    "affiliate_url" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "review_product_id" UUID,
    "metadata" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_products" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "provider_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverage" TEXT,
    "premium" DECIMAL(12,2),
    "benefits" TEXT,
    "affiliate_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "review_product_id" UUID,
    "metadata" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_products" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "provider_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "risk_level" TEXT,
    "expected_return" DECIMAL(8,4),
    "lock_in_period" TEXT,
    "affiliate_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "review_product_id" UUID,
    "metadata" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "investment_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_rates" (
    "id" UUID NOT NULL,
    "loan_id" UUID,
    "bank_id" UUID,
    "product_type" TEXT,
    "provider_id" UUID,
    "rate" DECIMAL(8,4) NOT NULL,
    "min_tenure" INTEGER,
    "max_tenure" INTEGER,
    "source" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "interest_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_faqs" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "entity_type" TEXT,
    "entity_id" UUID,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "finance_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_glossary_terms" (
    "id" UUID NOT NULL,
    "term" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "finance_glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_guides" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "finance_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_clicks" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "affiliate_url" TEXT NOT NULL,
    "user_id" UUID,
    "session_id" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_leads" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "affiliate_url" TEXT,
    "lead_type" TEXT NOT NULL DEFAULT 'interest',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "session_id" TEXT,
    "referrer" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_comparisons" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_ids" JSONB NOT NULL,
    "intro" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "methodology_note" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "finance_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_rate_histories" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "interest_rate_min" DECIMAL(8,4),
    "interest_rate_max" DECIMAL(8,4),
    "source_url" TEXT,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "loan_rate_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_sources" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "retrieved_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "content_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_rate_feeds" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint_url" TEXT,
    "product_type" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_at" TIMESTAMP(3),
    "last_status" TEXT,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "finance_rate_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_eligibility_checks" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "loan_type" TEXT NOT NULL,
    "income" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "tenure_months" INTEGER,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_eligibility_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_score_checks" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "pan_masked" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "score" INTEGER,
    "band" TEXT,
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_score_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_portfolios" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My portfolio',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "finance_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_portfolio_holdings" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "symbol" TEXT,
    "name" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "avg_cost" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_portfolio_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "target_amount" DECIMAL(14,2) NOT NULL,
    "current_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "target_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "finance_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_brands" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "logo_media_id" UUID,
    "website" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_materials" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "brand_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "specifications" JSONB,
    "unit" TEXT NOT NULL,
    "unit_cost" DECIMAL(14,2),
    "approximate_price" DECIMAL(14,2),
    "availability_region" TEXT,
    "affiliate_url" TEXT,
    "media_id" UUID,
    "image_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "rating" DECIMAL(3,2),
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_templates" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "formula_reference" TEXT,
    "items" JSONB,
    "labor_percent" DECIMAL(5,2),
    "contingency_percent" DECIMAL(5,2),
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "cost_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_estimators" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "template_id" UUID,
    "settings" JSONB,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_estimators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "project_type" TEXT NOT NULL,
    "status" "construction_project_status" NOT NULL DEFAULT 'DRAFT',
    "area_sqft" DECIMAL(12,2),
    "region" TEXT,
    "location_id" UUID,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "quality" TEXT,
    "estimated_cost" DECIMAL(14,2),
    "breakdown" JSONB,
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "target_end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_project_items" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "material_id" UUID,
    "name" TEXT,
    "unit" TEXT,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit_cost" DECIMAL(14,2),
    "estimated_cost" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_project_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_faqs" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_guides" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_checklists" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL,
    "project_type" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_project_checklist_progress" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "checklist_id" UUID,
    "checklist_slug" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_project_checklist_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_comparisons" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL DEFAULT 'materials',
    "entity_ids" JSONB NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_locations" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "type" "construction_location_type" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "timezone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_material_prices" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "location_id" UUID,
    "brand_id" UUID,
    "unit" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "price" DECIMAL(14,2) NOT NULL,
    "min_price" DECIMAL(14,2),
    "max_price" DECIMAL(14,2),
    "source" TEXT,
    "source_url" TEXT,
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "is_derived" BOOLEAN NOT NULL DEFAULT true,
    "derivation_method" TEXT,
    "location_factor" DECIMAL(8,4),
    "rate_status" "construction_rate_record_status" NOT NULL DEFAULT 'ACTIVE',
    "source_record_id" UUID,
    "specification_id" UUID,
    "retrieved_at" TIMESTAMP(3),
    "tax_included" BOOLEAN NOT NULL DEFAULT false,
    "transport_included" BOOLEAN NOT NULL DEFAULT false,
    "freshness" "construction_price_freshness" NOT NULL DEFAULT 'ESTIMATED',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_material_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_seo_audit_runs" (
    "id" UUID NOT NULL,
    "status" "construction_seo_audit_run_status" NOT NULL DEFAULT 'QUEUED',
    "mode" VARCHAR(20) NOT NULL DEFAULT 'FULL',
    "site_url" VARCHAR(255) NOT NULL,
    "triggered_by" UUID,
    "summary" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_seo_audit_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_seo_audit_issues" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "page_type" VARCHAR(40) NOT NULL,
    "issue_type" VARCHAR(80) NOT NULL,
    "severity" "construction_seo_audit_severity" NOT NULL DEFAULT 'WARNING',
    "status" "construction_seo_audit_issue_status" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "recommended_action" TEXT NOT NULL,
    "evidence" JSONB,
    "http_status" INTEGER,
    "lcp" DOUBLE PRECISION,
    "cls" DOUBLE PRECISION,
    "inp" DOUBLE PRECISION,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_seo_audit_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_search_events" (
    "id" UUID NOT NULL,
    "query_hash" VARCHAR(64) NOT NULL,
    "display_query" VARCHAR(160) NOT NULL,
    "surface" VARCHAR(40) NOT NULL,
    "intent" VARCHAR(40) NOT NULL,
    "result_count" INTEGER NOT NULL,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "path_prefix" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_search_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_search_opportunities" (
    "id" UUID NOT NULL,
    "query_hash" VARCHAR(64) NOT NULL,
    "display_query" VARCHAR(160) NOT NULL,
    "intent" VARCHAR(40) NOT NULL,
    "opportunity_type" VARCHAR(60) NOT NULL,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "zero_result_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "avg_result_count" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zero_result_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "window_days" INTEGER NOT NULL DEFAULT 30,
    "status" "construction_search_opportunity_status" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "evidence" JSONB,
    "first_seen_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL,
    "status_updated_at" TIMESTAMP(3),
    "status_updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_search_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_vcci_methodologies" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "baseline_label" TEXT NOT NULL,
    "baseline_start" DATE NOT NULL,
    "baseline_end" DATE NOT NULL,
    "baseline_index" DECIMAL(10,2) NOT NULL DEFAULT 100,
    "weights" JSONB NOT NULL,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_vcci_methodologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_vcci_snapshots" (
    "id" UUID NOT NULL,
    "methodology_id" UUID NOT NULL,
    "methodology_version" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "location_id" UUID,
    "component_key" TEXT,
    "index_value" DECIMAL(12,2) NOT NULL,
    "calculation_date" DATE NOT NULL,
    "component_indexes" JSONB,
    "component_weights" JSONB,
    "source_datasets" JSONB,
    "coverage_ratio" DECIMAL(6,4),
    "quality_passed" BOOLEAN NOT NULL DEFAULT false,
    "quality_blockers" JSONB,
    "status" "construction_vcci_publication_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_vcci_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_cost_rates" (
    "id" UUID NOT NULL,
    "location_id" UUID,
    "work_type" TEXT NOT NULL,
    "name" TEXT,
    "unit" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "rate" DECIMAL(14,2) NOT NULL,
    "quality" TEXT,
    "methodology_key" TEXT,
    "methodology_version" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "source_url" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_cost_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_calculations" (
    "id" UUID NOT NULL,
    "project_id" UUID,
    "user_id" UUID NOT NULL,
    "calculator_slug" TEXT NOT NULL,
    "calculator_id" UUID,
    "name" TEXT,
    "methodology_key" TEXT NOT NULL,
    "methodology_version" INTEGER NOT NULL DEFAULT 1,
    "inputs" JSONB NOT NULL,
    "assumptions" JSONB,
    "outputs" JSONB,
    "unit_summary" JSONB,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "status" "calculation_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_boqs" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "construction_boq_status" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_boqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_boq_items" (
    "id" UUID NOT NULL,
    "boq_id" UUID NOT NULL,
    "material_id" UUID,
    "phase_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit_rate" DECIMAL(14,2) NOT NULL,
    "wastage_percent" DECIMAL(5,2),
    "amount" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_boq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_project_phases" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "construction_phase_status" NOT NULL DEFAULT 'PLANNED',
    "planned_start" TIMESTAMP(3),
    "planned_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_project_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_budget_items" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "phase_id" UUID,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planned_amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_expenses" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "budget_item_id" UUID,
    "phase_id" UUID,
    "vendor_business_id" UUID,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "spent_on" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "receipt_media_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_price_alerts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "location_id" UUID,
    "name" TEXT,
    "target_price" DECIMAL(14,2),
    "threshold_percent" DECIMAL(8,4),
    "baseline_price" DECIMAL(14,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "direction" "construction_alert_direction" NOT NULL DEFAULT 'BELOW',
    "status" "construction_alert_status" NOT NULL DEFAULT 'ACTIVE',
    "cooldown_hours" INTEGER NOT NULL DEFAULT 24,
    "last_triggered_at" TIMESTAMP(3),
    "last_notified_price" DECIMAL(14,2),
    "last_notification_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_price_alert_triggers" (
    "id" UUID NOT NULL,
    "alert_id" UUID NOT NULL,
    "observed_price" DECIMAL(14,2) NOT NULL,
    "baseline_price" DECIMAL(14,2),
    "target_price" DECIMAL(14,2),
    "threshold_percent" DECIMAL(8,4),
    "change_percent" DECIMAL(10,4),
    "direction" "construction_alert_direction" NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "price_observation_id" UUID,
    "notification_id" UUID,
    "suppressed" BOOLEAN NOT NULL DEFAULT false,
    "suppress_reason" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_price_alert_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_community_price_reports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "brand_id" UUID,
    "brand_name" TEXT,
    "unit" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "price" DECIMAL(14,2) NOT NULL,
    "purchase_date" DATE NOT NULL,
    "supplier_name" TEXT,
    "notes" TEXT,
    "source_label" TEXT NOT NULL DEFAULT 'community_report',
    "status" "construction_community_price_status" NOT NULL DEFAULT 'PENDING',
    "trust_score" INTEGER NOT NULL DEFAULT 40,
    "is_outlier" BOOLEAN NOT NULL DEFAULT false,
    "outlier_ratio" DECIMAL(8,4),
    "reference_mid_price" DECIMAL(14,2),
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_of_id" UUID,
    "invoice_storage_key" TEXT,
    "invoice_mime_type" TEXT,
    "invoice_original_name" TEXT,
    "invoice_byte_size" INTEGER,
    "moderation_notes" TEXT,
    "moderated_by" UUID,
    "moderated_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_community_price_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_saved_comparisons" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL DEFAULT 'materials',
    "entity_ids" JSONB NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_saved_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_documents" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "kind" "construction_document_kind" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "media_id" UUID,
    "storage_key" TEXT,
    "original_filename" TEXT,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "url" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "boq_id" UUID,
    "expense_id" UUID,
    "phase_id" UUID,
    "quote_document_id" UUID,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_rate_sources" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "source_type" "construction_rate_source_type" NOT NULL,
    "document_name" TEXT,
    "reference" TEXT,
    "source_url" TEXT,
    "publication_date" DATE,
    "effective_from" DATE,
    "effective_to" DATE,
    "geographical_coverage" TEXT,
    "location_id" UUID,
    "reliability" "construction_rate_confidence" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "media_id" UUID,
    "last_checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "construction_rate_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_material_specifications" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "grade" TEXT,
    "size" TEXT,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_material_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_labour_trades" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "default_unit" TEXT NOT NULL DEFAULT 'perDay',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_labour_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_labour_rates" (
    "id" UUID NOT NULL,
    "trade_id" UUID NOT NULL,
    "location_id" UUID,
    "unit" TEXT NOT NULL,
    "min_rate" DECIMAL(14,2) NOT NULL,
    "average_rate" DECIMAL(14,2) NOT NULL,
    "max_rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "is_derived" BOOLEAN NOT NULL DEFAULT true,
    "derivation_method" TEXT,
    "rate_status" "construction_rate_record_status" NOT NULL DEFAULT 'ACTIVE',
    "source_record_id" UUID,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "last_verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_labour_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_equipment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "default_unit" TEXT NOT NULL DEFAULT 'day',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_equipment_rates" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "location_id" UUID,
    "unit" TEXT NOT NULL,
    "min_rate" DECIMAL(14,2) NOT NULL,
    "average_rate" DECIMAL(14,2) NOT NULL,
    "max_rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "is_derived" BOOLEAN NOT NULL DEFAULT true,
    "rate_status" "construction_rate_record_status" NOT NULL DEFAULT 'ACTIVE',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "last_verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_equipment_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_professional_services" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "billing_unit" TEXT NOT NULL DEFAULT 'percentageOfProject',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_professional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_professional_rates" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "location_id" UUID,
    "unit" TEXT NOT NULL,
    "min_rate" DECIMAL(14,2) NOT NULL,
    "average_rate" DECIMAL(14,2) NOT NULL,
    "max_rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "is_derived" BOOLEAN NOT NULL DEFAULT true,
    "rate_status" "construction_rate_record_status" NOT NULL DEFAULT 'ACTIVE',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_professional_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_phase_templates" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_phase_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_work_items" (
    "id" UUID NOT NULL,
    "phase_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_work_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_work_item_resources" (
    "id" UUID NOT NULL,
    "work_item_id" UUID NOT NULL,
    "resource_type" "construction_resource_type" NOT NULL,
    "resource_key" TEXT NOT NULL,
    "quantity_coefficient" DECIMAL(16,6) NOT NULL,
    "unit" TEXT NOT NULL,
    "wastage_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_work_item_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_productivity_norms" (
    "id" UUID NOT NULL,
    "trade_id" UUID NOT NULL,
    "work_item_id" UUID,
    "output_per_day" DECIMAL(14,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "crew_composition" TEXT,
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_productivity_norms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_wastage_rules" (
    "id" UUID NOT NULL,
    "category_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "wastage_percent" DECIMAL(6,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_wastage_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_quality_tiers" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_quality_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_quality_specifications" (
    "id" UUID NOT NULL,
    "tier_id" UUID NOT NULL,
    "category_key" TEXT NOT NULL,
    "spec_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_quality_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_interior_components" (
    "id" UUID NOT NULL,
    "room_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_interior_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_interior_rates" (
    "id" UUID NOT NULL,
    "component_id" UUID NOT NULL,
    "location_id" UUID,
    "quality_code" TEXT,
    "unit" TEXT NOT NULL,
    "min_rate" DECIMAL(14,2) NOT NULL,
    "average_rate" DECIMAL(14,2) NOT NULL,
    "max_rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "is_derived" BOOLEAN NOT NULL DEFAULT true,
    "rate_status" "construction_rate_record_status" NOT NULL DEFAULT 'ACTIVE',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_interior_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_location_cost_factors" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "material_transport_factor" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "labour_factor" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "equipment_factor" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "interior_factor" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "logistics_factor" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_location_cost_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_benchmark_rates" (
    "id" UUID NOT NULL,
    "location_id" UUID,
    "building_type" TEXT NOT NULL,
    "quality_tier_id" UUID,
    "min_rate_per_sq_ft" DECIMAL(14,2) NOT NULL,
    "average_rate_per_sq_ft" DECIMAL(14,2) NOT NULL,
    "max_rate_per_sq_ft" DECIMAL(14,2) NOT NULL,
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "is_derived" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "last_verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_benchmark_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_commercial_rules" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "kind" "construction_commercial_rule_kind" NOT NULL,
    "percent" DECIMAL(8,4),
    "index_factor" DECIMAL(10,6),
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'ESTIMATED_FALLBACK',
    "confidence" "construction_rate_confidence" NOT NULL DEFAULT 'LOW',
    "notes" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_commercial_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_rate_reviews" (
    "id" UUID NOT NULL,
    "resource_type" "construction_resource_type" NOT NULL,
    "resource_key" TEXT NOT NULL,
    "location_id" UUID,
    "status" "construction_rate_review_status" NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "construction_rate_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_supplier_quotations" (
    "id" UUID NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "location_id" UUID,
    "resource_type" "construction_resource_type" NOT NULL,
    "resource_key" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quoted_rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "quoted_at" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "status" "construction_quotation_status" NOT NULL DEFAULT 'RECEIVED',
    "source_type" "construction_rate_source_type" NOT NULL DEFAULT 'MARKET_SURVEY',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "construction_supplier_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_user_rate_overrides" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "resource_type" "construction_resource_type" NOT NULL,
    "resource_key" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "rate" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_user_rate_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_rate_import_batches" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "construction_rate_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_rate_audit_logs" (
    "id" UUID NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "reason" TEXT,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_rate_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_manufacturers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "logo_media_id" UUID,
    "country" TEXT,
    "founded_year" INTEGER,
    "website" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_vehicles" (
    "id" UUID NOT NULL,
    "manufacturer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT '',
    "model_year" INTEGER,
    "category" TEXT,
    "body_type" TEXT,
    "fuel_type" TEXT,
    "transmission" TEXT,
    "engine_capacity" TEXT,
    "horsepower" DECIMAL(8,2),
    "torque" DECIMAL(8,2),
    "mileage" DECIMAL(8,2),
    "seating_capacity" INTEGER,
    "ground_clearance" DECIMAL(8,2),
    "boot_space" DECIMAL(8,2),
    "safety_rating" DECIMAL(3,1),
    "ex_showroom_price" DECIMAL(14,2),
    "estimated_on_road_price" DECIMAL(14,2),
    "warranty" TEXT,
    "description" TEXT,
    "specifications" JSONB,
    "pros" JSONB,
    "cons" JSONB,
    "image_url" TEXT,
    "image_source" TEXT,
    "image_source_page" TEXT,
    "image_author" TEXT,
    "image_license" TEXT,
    "image_attribution" TEXT,
    "image_last_verified_at" TIMESTAMP(3),
    "image_confidence" DECIMAL(4,2),
    "source_url" TEXT,
    "source_name" TEXT,
    "last_verified_at" TIMESTAMP(3),
    "safety_agency" TEXT,
    "safety_source_url" TEXT,
    "launch_status" TEXT,
    "brochure_url" TEXT,
    "brochure_media_id" UUID,
    "video_url" TEXT,
    "affiliate_url" TEXT,
    "expert_rating" DECIMAL(3,2),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "available_in_india" BOOLEAN NOT NULL DEFAULT false,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_image_cache" (
    "id" UUID NOT NULL,
    "cache_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "image_url" TEXT,
    "source_page" TEXT,
    "author" TEXT,
    "license" TEXT,
    "attribution" TEXT,
    "photo_id" TEXT,
    "query_used" TEXT,
    "confidence" DECIMAL(4,2),
    "last_verified_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_image_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_vehicle_images" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "media_id" UUID,
    "image_url" TEXT,
    "alt_text" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "automobile_vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_vehicle_reviews" (
    "vehicle_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,

    CONSTRAINT "automobile_vehicle_reviews_pkey" PRIMARY KEY ("vehicle_id","review_id")
);

-- CreateTable
CREATE TABLE "automobile_maintenance_schedules" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "service_interval" TEXT NOT NULL,
    "estimated_cost" DECIMAL(12,2),
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_faqs" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_guides" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_comparisons" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL DEFAULT 'vehicles',
    "entity_ids" JSONB NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cars" (
    "id" UUID NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT '',
    "year_from" INTEGER,
    "year_to" INTEGER,
    "body_type" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "engine_code" TEXT,
    "engine_displacement" DECIMAL(14,4),
    "engine_cylinders" INTEGER,
    "engine_valves" INTEGER,
    "engine_fuel_type" TEXT,
    "engine_power_bhp" DECIMAL(14,4),
    "engine_power_kw" DECIMAL(14,4),
    "engine_torque_nm" DECIMAL(14,4),
    "engine_aspiration" TEXT,
    "engine_position" TEXT,
    "gearbox_type" TEXT,
    "gears" INTEGER,
    "drivetrain" TEXT,
    "acceleration_0_100" DECIMAL(14,4),
    "top_speed_kph" DECIMAL(14,4),
    "top_speed_mph" DECIMAL(14,4),
    "fuel_economy_combined_mpg" DECIMAL(14,4),
    "fuel_economy_combined_l100" DECIMAL(14,4),
    "fuel_economy_urban_l100" DECIMAL(14,4),
    "fuel_economy_extra_urban_l100" DECIMAL(14,4),
    "fuel_tank_litres" DECIMAL(14,4),
    "co2_gkm" DECIMAL(14,4),
    "emissions_standard" TEXT,
    "nox_mgkm" DECIMAL(14,4),
    "length_mm" DECIMAL(14,4),
    "width_mm" DECIMAL(14,4),
    "height_mm" DECIMAL(14,4),
    "wheelbase_mm" DECIMAL(14,4),
    "weight_kg" DECIMAL(14,4),
    "gross_weight_kg" DECIMAL(14,4),
    "boot_litres" DECIMAL(14,4),
    "boot_litres_max" DECIMAL(14,4),
    "tyre_front" TEXT,
    "tyre_rear" TEXT,
    "brake_front" TEXT,
    "brake_rear" TEXT,
    "battery_kwh" DECIMAL(14,4),
    "electric_range_km" DECIMAL(14,4),
    "charging_kw" DECIMAL(14,4),
    "source_file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "author_id" UUID,
    "review_type" TEXT NOT NULL DEFAULT 'editorial',
    "entity_type" TEXT,
    "entity_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "verdict" TEXT,
    "recommendation" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "overall_score" DECIMAL(4,2),
    "featured_media_id" UUID,
    "metadata" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reviews" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "product_id" UUID,
    "review_id" UUID,
    "user_id" UUID NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'REVIEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_helpfulness" (
    "id" UUID NOT NULL,
    "user_review_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "vote" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpfulness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_sections" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_scores" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "score" DECIMAL(4,2) NOT NULL,
    "max_score" DECIMAL(4,2) NOT NULL DEFAULT 10,

    CONSTRAINT "review_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_pros" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "review_pros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_cons" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "review_cons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "description" TEXT,
    "attributes" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "comparison_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" UUID NOT NULL,
    "template_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "comparison_type" TEXT,
    "entity_type" TEXT,
    "recommendation" TEXT,
    "winner_entity_type" TEXT,
    "winner_entity_id" UUID,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_items" (
    "id" UUID NOT NULL,
    "comparison_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "label" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "comparison_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_attributes" (
    "id" UUID NOT NULL,
    "comparison_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value_type" TEXT NOT NULL DEFAULT 'text',
    "group_key" TEXT,
    "values" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "comparison_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_values" (
    "id" UUID NOT NULL,
    "comparison_item_id" UUID NOT NULL,
    "comparison_attribute_id" UUID NOT NULL,
    "value" JSONB NOT NULL,
    "highlight" TEXT,

    CONSTRAINT "comparison_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL,
    "owner_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "contact_person" TEXT,
    "social_links" JSONB,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "listing_type" "listing_type" NOT NULL DEFAULT 'FREE',
    "verification_status" "verification_status" NOT NULL DEFAULT 'UNVERIFIED',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "pricing" TEXT,
    "certifications" JSONB,
    "faqs" JSONB,
    "status" "business_status" NOT NULL DEFAULT 'PENDING',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_category_links" (
    "business_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "business_category_links_pkey" PRIMARY KEY ("business_id","category_id")
);

-- CreateTable
CREATE TABLE "business_locations" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "label" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "district" TEXT,
    "locality" TEXT,
    "postal_code" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "google_maps_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_services" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_products" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_media" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "media_id" UUID,
    "url" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'gallery',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "day" INTEGER NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_requests" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "lead_type" TEXT NOT NULL DEFAULT 'contact',
    "status" "lead_status" NOT NULL DEFAULT 'NEW',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lead_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directory_events" (
    "id" UUID NOT NULL,
    "business_id" UUID,
    "event_type" "directory_event_type" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "directory_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_reviews" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "user_id" UUID,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_category_follows" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_category_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tools" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "company_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "pricing_model" "ai_pricing_model" NOT NULL DEFAULT 'FREEMIUM',
    "pricing_details" TEXT,
    "monthly_price" TEXT,
    "annual_price" TEXT,
    "free_plan" BOOLEAN NOT NULL DEFAULT false,
    "free_trial" BOOLEAN NOT NULL DEFAULT false,
    "api_available" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "documentation" TEXT,
    "affiliate_url" TEXT,
    "platforms" JSONB,
    "languages" JSONB,
    "faqs" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "bookmark_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_features" (
    "id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "feature_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_integrations" (
    "id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "integration_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_screenshots" (
    "id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "media_id" UUID,
    "url" TEXT,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tool_screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "collection_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_recently_viewed" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tool_recently_viewed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_events" (
    "id" UUID NOT NULL,
    "tool_id" UUID,
    "event_type" "ai_tool_event_type" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tool_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" UUID NOT NULL,
    "model_id" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "variables" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "model_id" UUID,
    "prompt_id" UUID,
    "status" "ai_job_status" NOT NULL DEFAULT 'QUEUED',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_content" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "generated_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "id" UUID NOT NULL,
    "session_key" TEXT NOT NULL,
    "user_id" UUID,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "device" TEXT,
    "country" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" UUID NOT NULL,
    "session_id" UUID,
    "user_id" UUID,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" UUID,
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "path" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_aggregates" (
    "id" UUID NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_sources" (
    "id" UUID NOT NULL,
    "session_id" UUID,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" UUID NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_conversions" (
    "id" UUID NOT NULL,
    "partner" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_saved_reports" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "filters" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_index" (
    "id" UUID NOT NULL,
    "entity_type" "search_entity_type" NOT NULL,
    "entity_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "keywords" TEXT,
    "tags" TEXT,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "category" TEXT,
    "location" TEXT,
    "author" TEXT,
    "brand" TEXT,
    "price_min" DECIMAL(12,2),
    "price_max" DECIMAL(12,2),
    "vehicle_type" TEXT,
    "fuel_type" TEXT,
    "loan_type" TEXT,
    "material_type" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" "publish_status" NOT NULL DEFAULT 'PUBLISHED',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "search_vector" tsvector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "results" INTEGER,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "latency_ms" INTEGER,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_result_clicks" (
    "id" UUID NOT NULL,
    "query_id" UUID,
    "entity_type" "search_entity_type" NOT NULL,
    "entity_id" UUID NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_result_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popular_searches" (
    "id" UUID NOT NULL,
    "keyword" TEXT NOT NULL,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "popular_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" UUID NOT NULL,
    "session_id" UUID,
    "event_name" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "source" VARCHAR(80),
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" UUID NOT NULL,
    "template_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "notification_channel" NOT NULL DEFAULT 'IN_APP',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "template_id" UUID,
    "channel" "notification_channel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" DECIMAL(12,2),
    "price_yearly" DECIMAL(12,2),
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'TRIALING',
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "subscription_id" UUID,
    "number" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "provider_ref" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "payment_id" UUID,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_keys" (
    "id" UUID NOT NULL,
    "namespace" TEXT NOT NULL DEFAULT 'common',
    "key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "translation_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_values" (
    "id" UUID NOT NULL,
    "key_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_request_logs" (
    "id" UUID NOT NULL,
    "request_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "user_id" UUID,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" UUID NOT NULL,
    "endpoint_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status_code" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_user_id_key" ON "users"("auth0_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "login_history_user_id_login_time_idx" ON "login_history"("user_id", "login_time");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "security_events_event_type_created_at_idx" ON "security_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "security_events_severity_status_idx" ON "security_events"("severity", "status");

-- CreateIndex
CREATE INDEX "security_events_user_id_created_at_idx" ON "security_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bookmarks_entity_type_entity_id_idx" ON "bookmarks"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_collection_name_idx" ON "bookmarks"("user_id", "collection_name");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_entity_type_entity_id_key" ON "bookmarks"("user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_activity_user_id_created_at_idx" ON "user_activity"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_content_subscriptions_user_id_idx" ON "user_content_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_content_subscriptions_user_id_subscription_type_target_key" ON "user_content_subscriptions"("user_id", "subscription_type", "target");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_idx" ON "settings"("group");

-- CreateIndex
CREATE INDEX "contact_messages_status_created_at_idx" ON "contact_messages"("status", "created_at");

-- CreateIndex
CREATE INDEX "contact_messages_topic_created_at_idx" ON "contact_messages"("topic", "created_at");

-- CreateIndex
CREATE INDEX "contact_messages_email_created_at_idx" ON "contact_messages"("email", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "themes_slug_key" ON "themes"("slug");

-- CreateIndex
CREATE INDEX "themes_tenant_key_idx" ON "themes"("tenant_key");

-- CreateIndex
CREATE INDEX "themes_marketplace_listed_idx" ON "themes"("marketplace_listed");

-- CreateIndex
CREATE INDEX "themes_scheduled_from_scheduled_until_idx" ON "themes"("scheduled_from", "scheduled_until");

-- CreateIndex
CREATE INDEX "theme_assets_theme_id_idx" ON "theme_assets"("theme_id");

-- CreateIndex
CREATE UNIQUE INDEX "theme_assets_theme_id_type_key" ON "theme_assets"("theme_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "menus_slug_key" ON "menus"("slug");

-- CreateIndex
CREATE INDEX "menus_location_idx" ON "menus"("location");

-- CreateIndex
CREATE INDEX "menu_items_menu_id_sort_order_idx" ON "menu_items"("menu_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "media_folders_parent_id_slug_key" ON "media_folders"("parent_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "media_albums_slug_key" ON "media_albums"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_slug_key" ON "media_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_public_id_key" ON "media_assets"("public_id");

-- CreateIndex
CREATE INDEX "media_assets_folder_id_idx" ON "media_assets"("folder_id");

-- CreateIndex
CREATE INDEX "media_assets_resource_type_idx" ON "media_assets"("resource_type");

-- CreateIndex
CREATE INDEX "media_usage_asset_id_idx" ON "media_usage"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_usage_asset_id_entity_type_entity_id_field_name_key" ON "media_usage"("asset_id", "entity_type", "entity_id", "field_name");

-- CreateIndex
CREATE INDEX "media_asset_versions_asset_id_idx" ON "media_asset_versions"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_status_slug_idx" ON "categories"("status", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_published_at_idx" ON "articles"("status", "published_at");

-- CreateIndex
CREATE INDEX "articles_category_id_status_idx" ON "articles"("category_id", "status");

-- CreateIndex
CREATE INDEX "articles_author_id_published_at_idx" ON "articles"("author_id", "published_at");

-- CreateIndex
CREATE INDEX "articles_is_featured_status_idx" ON "articles"("is_featured", "status");

-- CreateIndex
CREATE INDEX "articles_hero_image_id_idx" ON "articles"("hero_image_id");

-- CreateIndex
CREATE INDEX "articles_og_image_id_idx" ON "articles"("og_image_id");

-- CreateIndex
CREATE INDEX "article_related_article_id_sort_order_idx" ON "article_related"("article_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "page_versions_page_id_version_key" ON "page_versions"("page_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "article_versions_article_id_version_key" ON "article_versions"("article_id", "version");

-- CreateIndex
CREATE INDEX "comments_article_id_status_idx" ON "comments"("article_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_status_slug_idx" ON "pages"("status", "slug");

-- CreateIndex
CREATE INDEX "seo_metadata_entity_type_idx" ON "seo_metadata"("entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_entity_type_entity_id_key" ON "seo_metadata"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "seo_redirects_source_path_key" ON "seo_redirects"("source_path");

-- CreateIndex
CREATE INDEX "seo_redirects_status_idx" ON "seo_redirects"("status");

-- CreateIndex
CREATE INDEX "seo_audits_resolved_idx" ON "seo_audits"("resolved");

-- CreateIndex
CREATE INDEX "seo_audits_entity_type_entity_id_idx" ON "seo_audits"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "seo_audits_issue_type_idx" ON "seo_audits"("issue_type");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_layouts_slug_key" ON "homepage_layouts"("slug");

-- CreateIndex
CREATE INDEX "homepage_layouts_status_idx" ON "homepage_layouts"("status");

-- CreateIndex
CREATE INDEX "homepage_sections_layout_id_sort_order_idx" ON "homepage_sections"("layout_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_slug_key" ON "widgets"("slug");

-- CreateIndex
CREATE INDEX "widget_instances_section_id_sort_order_idx" ON "widget_instances"("section_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "sponsors_slug_key" ON "sponsors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ad_placements_slug_key" ON "ad_placements"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ad_campaigns_slug_key" ON "ad_campaigns"("slug");

-- CreateIndex
CREATE INDEX "ad_campaigns_status_starts_at_idx" ON "ad_campaigns"("status", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "advertisements_slug_key" ON "advertisements"("slug");

-- CreateIndex
CREATE INDEX "advertisements_campaign_id_status_idx" ON "advertisements"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "advertisements_placement_id_status_idx" ON "advertisements"("placement_id", "status");

-- CreateIndex
CREATE INDEX "advertisements_type_status_idx" ON "advertisements"("type", "status");

-- CreateIndex
CREATE INDEX "ad_impressions_ad_id_created_at_idx" ON "ad_impressions"("ad_id", "created_at");

-- CreateIndex
CREATE INDEX "ad_clicks_ad_id_created_at_idx" ON "ad_clicks"("ad_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "calculator_categories_slug_key" ON "calculator_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "calculators_slug_key" ON "calculators"("slug");

-- CreateIndex
CREATE INDEX "calculators_status_slug_idx" ON "calculators"("status", "slug");

-- CreateIndex
CREATE INDEX "calculators_category_id_idx" ON "calculators"("category_id");

-- CreateIndex
CREATE INDEX "calculators_illustration_media_id_idx" ON "calculators"("illustration_media_id");

-- CreateIndex
CREATE INDEX "calculator_fields_calculator_id_sort_order_idx" ON "calculator_fields"("calculator_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "calculator_fields_calculator_id_key_key" ON "calculator_fields"("calculator_id", "key");

-- CreateIndex
CREATE INDEX "calculator_versions_calculator_id_idx" ON "calculator_versions"("calculator_id");

-- CreateIndex
CREATE UNIQUE INDEX "calculator_versions_calculator_id_version_key" ON "calculator_versions"("calculator_id", "version");

-- CreateIndex
CREATE INDEX "calculation_history_calculator_id_created_at_idx" ON "calculation_history"("calculator_id", "created_at");

-- CreateIndex
CREATE INDEX "calculation_history_user_id_created_at_idx" ON "calculation_history"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "calculator_analytics_events_calculator_id_event_type_create_idx" ON "calculator_analytics_events"("calculator_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "saved_calculations_user_id_calculator_id_idx" ON "saved_calculations"("user_id", "calculator_id");

-- CreateIndex
CREATE UNIQUE INDEX "finance_categories_slug_key" ON "finance_categories"("slug");

-- CreateIndex
CREATE INDEX "finance_categories_sort_order_idx" ON "finance_categories"("sort_order");

-- CreateIndex
CREATE INDEX "finance_categories_loan_hub_enabled_status_idx" ON "finance_categories"("loan_hub_enabled", "status");

-- CreateIndex
CREATE INDEX "finance_categories_featured_image_media_id_idx" ON "finance_categories"("featured_image_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "banks_slug_key" ON "banks"("slug");

-- CreateIndex
CREATE INDEX "banks_status_idx" ON "banks"("status");

-- CreateIndex
CREATE INDEX "banks_lender_type_idx" ON "banks"("lender_type");

-- CreateIndex
CREATE INDEX "banks_logo_media_id_idx" ON "banks"("logo_media_id");

-- CreateIndex
CREATE INDEX "loans_category_id_slug_idx" ON "loans"("category_id", "slug");

-- CreateIndex
CREATE INDEX "loans_loan_type_idx" ON "loans"("loan_type");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_category_id_idx" ON "loans"("category_id");

-- CreateIndex
CREATE INDEX "loans_featured_status_idx" ON "loans"("featured", "status");

-- CreateIndex
CREATE INDEX "loans_sponsored_status_idx" ON "loans"("sponsored", "status");

-- CreateIndex
CREATE INDEX "loans_needs_rate_review_status_idx" ON "loans"("needs_rate_review", "status");

-- CreateIndex
CREATE INDEX "loans_rate_last_verified_at_idx" ON "loans"("rate_last_verified_at");

-- CreateIndex
CREATE UNIQUE INDEX "loans_bank_id_slug_key" ON "loans"("bank_id", "slug");

-- CreateIndex
CREATE INDEX "credit_cards_status_idx" ON "credit_cards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "credit_cards_bank_id_slug_key" ON "credit_cards"("bank_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_products_slug_key" ON "insurance_products"("slug");

-- CreateIndex
CREATE INDEX "insurance_products_status_idx" ON "insurance_products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "investment_products_slug_key" ON "investment_products"("slug");

-- CreateIndex
CREATE INDEX "investment_products_status_idx" ON "investment_products"("status");

-- CreateIndex
CREATE INDEX "investment_products_risk_level_idx" ON "investment_products"("risk_level");

-- CreateIndex
CREATE INDEX "interest_rates_loan_id_effective_from_idx" ON "interest_rates"("loan_id", "effective_from");

-- CreateIndex
CREATE INDEX "interest_rates_product_type_effective_from_idx" ON "interest_rates"("product_type", "effective_from");

-- CreateIndex
CREATE INDEX "interest_rates_bank_id_idx" ON "interest_rates"("bank_id");

-- CreateIndex
CREATE INDEX "finance_faqs_status_sort_order_idx" ON "finance_faqs"("status", "sort_order");

-- CreateIndex
CREATE INDEX "finance_faqs_entity_type_entity_id_idx" ON "finance_faqs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "finance_glossary_terms_slug_key" ON "finance_glossary_terms"("slug");

-- CreateIndex
CREATE INDEX "finance_glossary_terms_status_idx" ON "finance_glossary_terms"("status");

-- CreateIndex
CREATE UNIQUE INDEX "finance_guides_slug_key" ON "finance_guides"("slug");

-- CreateIndex
CREATE INDEX "finance_guides_status_idx" ON "finance_guides"("status");

-- CreateIndex
CREATE INDEX "affiliate_clicks_entity_type_entity_id_idx" ON "affiliate_clicks"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "affiliate_clicks_created_at_idx" ON "affiliate_clicks"("created_at");

-- CreateIndex
CREATE INDEX "affiliate_leads_entity_type_entity_id_idx" ON "affiliate_leads"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "affiliate_leads_created_at_idx" ON "affiliate_leads"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "finance_comparisons_slug_key" ON "finance_comparisons"("slug");

-- CreateIndex
CREATE INDEX "finance_comparisons_status_idx" ON "finance_comparisons"("status");

-- CreateIndex
CREATE INDEX "finance_comparisons_entity_type_status_idx" ON "finance_comparisons"("entity_type", "status");

-- CreateIndex
CREATE INDEX "loan_rate_histories_loan_id_effective_date_idx" ON "loan_rate_histories"("loan_id", "effective_date");

-- CreateIndex
CREATE INDEX "content_sources_entity_type_entity_id_idx" ON "content_sources"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "content_sources_status_idx" ON "content_sources"("status");

-- CreateIndex
CREATE INDEX "loan_eligibility_checks_user_id_created_at_idx" ON "loan_eligibility_checks"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "credit_score_checks_user_id_created_at_idx" ON "credit_score_checks"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "finance_portfolios_user_id_idx" ON "finance_portfolios"("user_id");

-- CreateIndex
CREATE INDEX "finance_portfolio_holdings_portfolio_id_idx" ON "finance_portfolio_holdings"("portfolio_id");

-- CreateIndex
CREATE INDEX "finance_goals_user_id_status_idx" ON "finance_goals"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_categories_slug_key" ON "construction_categories"("slug");

-- CreateIndex
CREATE INDEX "construction_categories_sort_order_idx" ON "construction_categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "construction_brands_slug_key" ON "construction_brands"("slug");

-- CreateIndex
CREATE INDEX "construction_brands_status_idx" ON "construction_brands"("status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_materials_slug_key" ON "construction_materials"("slug");

-- CreateIndex
CREATE INDEX "construction_materials_status_idx" ON "construction_materials"("status");

-- CreateIndex
CREATE INDEX "construction_materials_category_id_idx" ON "construction_materials"("category_id");

-- CreateIndex
CREATE INDEX "construction_materials_brand_id_idx" ON "construction_materials"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_templates_slug_key" ON "cost_templates"("slug");

-- CreateIndex
CREATE INDEX "cost_templates_status_idx" ON "cost_templates"("status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_estimators_slug_key" ON "construction_estimators"("slug");

-- CreateIndex
CREATE INDEX "construction_projects_user_id_created_at_idx" ON "construction_projects"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "construction_projects_user_id_status_idx" ON "construction_projects"("user_id", "status");

-- CreateIndex
CREATE INDEX "construction_projects_location_id_idx" ON "construction_projects"("location_id");

-- CreateIndex
CREATE INDEX "construction_project_items_project_id_idx" ON "construction_project_items"("project_id");

-- CreateIndex
CREATE INDEX "construction_project_items_material_id_idx" ON "construction_project_items"("material_id");

-- CreateIndex
CREATE INDEX "construction_faqs_status_sort_order_idx" ON "construction_faqs"("status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "construction_guides_slug_key" ON "construction_guides"("slug");

-- CreateIndex
CREATE INDEX "construction_guides_status_idx" ON "construction_guides"("status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_checklists_slug_key" ON "construction_checklists"("slug");

-- CreateIndex
CREATE INDEX "construction_checklists_status_idx" ON "construction_checklists"("status");

-- CreateIndex
CREATE INDEX "construction_project_checklist_progress_project_id_idx" ON "construction_project_checklist_progress"("project_id");

-- CreateIndex
CREATE INDEX "construction_project_checklist_progress_checklist_slug_idx" ON "construction_project_checklist_progress"("checklist_slug");

-- CreateIndex
CREATE UNIQUE INDEX "construction_project_checklist_progress_project_id_checklis_key" ON "construction_project_checklist_progress"("project_id", "checklist_slug");

-- CreateIndex
CREATE UNIQUE INDEX "construction_comparisons_slug_key" ON "construction_comparisons"("slug");

-- CreateIndex
CREATE INDEX "construction_comparisons_status_idx" ON "construction_comparisons"("status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_locations_slug_key" ON "construction_locations"("slug");

-- CreateIndex
CREATE INDEX "construction_locations_type_name_idx" ON "construction_locations"("type", "name");

-- CreateIndex
CREATE INDEX "construction_locations_parent_id_idx" ON "construction_locations"("parent_id");

-- CreateIndex
CREATE INDEX "construction_material_prices_material_id_effective_from_idx" ON "construction_material_prices"("material_id", "effective_from");

-- CreateIndex
CREATE INDEX "construction_material_prices_location_id_effective_from_idx" ON "construction_material_prices"("location_id", "effective_from");

-- CreateIndex
CREATE INDEX "construction_material_prices_freshness_effective_from_idx" ON "construction_material_prices"("freshness", "effective_from");

-- CreateIndex
CREATE INDEX "construction_material_prices_source_type_rate_status_idx" ON "construction_material_prices"("source_type", "rate_status");

-- CreateIndex
CREATE INDEX "construction_material_prices_specification_id_location_id_idx" ON "construction_material_prices"("specification_id", "location_id");

-- CreateIndex
CREATE INDEX "construction_seo_audit_runs_status_created_at_idx" ON "construction_seo_audit_runs"("status", "created_at");

-- CreateIndex
CREATE INDEX "construction_seo_audit_runs_created_at_idx" ON "construction_seo_audit_runs"("created_at");

-- CreateIndex
CREATE INDEX "construction_seo_audit_issues_run_id_severity_idx" ON "construction_seo_audit_issues"("run_id", "severity");

-- CreateIndex
CREATE INDEX "construction_seo_audit_issues_run_id_issue_type_idx" ON "construction_seo_audit_issues"("run_id", "issue_type");

-- CreateIndex
CREATE INDEX "construction_seo_audit_issues_run_id_page_type_idx" ON "construction_seo_audit_issues"("run_id", "page_type");

-- CreateIndex
CREATE INDEX "construction_seo_audit_issues_run_id_status_idx" ON "construction_seo_audit_issues"("run_id", "status");

-- CreateIndex
CREATE INDEX "construction_seo_audit_issues_path_idx" ON "construction_seo_audit_issues"("path");

-- CreateIndex
CREATE INDEX "construction_search_events_query_hash_created_at_idx" ON "construction_search_events"("query_hash", "created_at");

-- CreateIndex
CREATE INDEX "construction_search_events_created_at_idx" ON "construction_search_events"("created_at");

-- CreateIndex
CREATE INDEX "construction_search_events_surface_created_at_idx" ON "construction_search_events"("surface", "created_at");

-- CreateIndex
CREATE INDEX "construction_search_events_intent_created_at_idx" ON "construction_search_events"("intent", "created_at");

-- CreateIndex
CREATE INDEX "construction_search_events_result_count_created_at_idx" ON "construction_search_events"("result_count", "created_at");

-- CreateIndex
CREATE INDEX "construction_search_opportunities_status_search_count_idx" ON "construction_search_opportunities"("status", "search_count");

-- CreateIndex
CREATE INDEX "construction_search_opportunities_opportunity_type_search_c_idx" ON "construction_search_opportunities"("opportunity_type", "search_count");

-- CreateIndex
CREATE INDEX "construction_search_opportunities_intent_search_count_idx" ON "construction_search_opportunities"("intent", "search_count");

-- CreateIndex
CREATE INDEX "construction_search_opportunities_last_seen_at_idx" ON "construction_search_opportunities"("last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "construction_search_opportunities_query_hash_window_days_key" ON "construction_search_opportunities"("query_hash", "window_days");

-- CreateIndex
CREATE UNIQUE INDEX "construction_vcci_methodologies_version_key" ON "construction_vcci_methodologies"("version");

-- CreateIndex
CREATE INDEX "construction_vcci_snapshots_scope_calculation_date_idx" ON "construction_vcci_snapshots"("scope", "calculation_date");

-- CreateIndex
CREATE INDEX "construction_vcci_snapshots_location_id_calculation_date_idx" ON "construction_vcci_snapshots"("location_id", "calculation_date");

-- CreateIndex
CREATE INDEX "construction_vcci_snapshots_component_key_calculation_date_idx" ON "construction_vcci_snapshots"("component_key", "calculation_date");

-- CreateIndex
CREATE INDEX "construction_vcci_snapshots_status_calculation_date_idx" ON "construction_vcci_snapshots"("status", "calculation_date");

-- CreateIndex
CREATE INDEX "construction_vcci_snapshots_methodology_id_calculation_date_idx" ON "construction_vcci_snapshots"("methodology_id", "calculation_date");

-- CreateIndex
CREATE INDEX "construction_cost_rates_work_type_effective_from_idx" ON "construction_cost_rates"("work_type", "effective_from");

-- CreateIndex
CREATE INDEX "construction_cost_rates_location_id_work_type_idx" ON "construction_cost_rates"("location_id", "work_type");

-- CreateIndex
CREATE INDEX "construction_cost_rates_methodology_key_methodology_version_idx" ON "construction_cost_rates"("methodology_key", "methodology_version");

-- CreateIndex
CREATE INDEX "construction_calculations_user_id_created_at_idx" ON "construction_calculations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "construction_calculations_project_id_created_at_idx" ON "construction_calculations"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "construction_calculations_calculator_slug_methodology_versi_idx" ON "construction_calculations"("calculator_slug", "methodology_version");

-- CreateIndex
CREATE INDEX "construction_boqs_project_id_status_idx" ON "construction_boqs"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_boqs_project_id_name_version_key" ON "construction_boqs"("project_id", "name", "version");

-- CreateIndex
CREATE INDEX "construction_boq_items_boq_id_sort_order_idx" ON "construction_boq_items"("boq_id", "sort_order");

-- CreateIndex
CREATE INDEX "construction_boq_items_material_id_idx" ON "construction_boq_items"("material_id");

-- CreateIndex
CREATE INDEX "construction_boq_items_phase_id_idx" ON "construction_boq_items"("phase_id");

-- CreateIndex
CREATE INDEX "construction_project_phases_project_id_sort_order_idx" ON "construction_project_phases"("project_id", "sort_order");

-- CreateIndex
CREATE INDEX "construction_project_phases_project_id_status_idx" ON "construction_project_phases"("project_id", "status");

-- CreateIndex
CREATE INDEX "construction_budget_items_project_id_idx" ON "construction_budget_items"("project_id");

-- CreateIndex
CREATE INDEX "construction_budget_items_phase_id_idx" ON "construction_budget_items"("phase_id");

-- CreateIndex
CREATE INDEX "construction_expenses_project_id_spent_on_idx" ON "construction_expenses"("project_id", "spent_on");

-- CreateIndex
CREATE INDEX "construction_expenses_budget_item_id_idx" ON "construction_expenses"("budget_item_id");

-- CreateIndex
CREATE INDEX "construction_expenses_phase_id_idx" ON "construction_expenses"("phase_id");

-- CreateIndex
CREATE INDEX "construction_expenses_vendor_business_id_idx" ON "construction_expenses"("vendor_business_id");

-- CreateIndex
CREATE INDEX "construction_price_alerts_user_id_status_idx" ON "construction_price_alerts"("user_id", "status");

-- CreateIndex
CREATE INDEX "construction_price_alerts_material_id_status_idx" ON "construction_price_alerts"("material_id", "status");

-- CreateIndex
CREATE INDEX "construction_price_alerts_location_id_idx" ON "construction_price_alerts"("location_id");

-- CreateIndex
CREATE INDEX "construction_price_alerts_status_deleted_at_idx" ON "construction_price_alerts"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "construction_price_alert_triggers_alert_id_triggered_at_idx" ON "construction_price_alert_triggers"("alert_id", "triggered_at");

-- CreateIndex
CREATE INDEX "construction_price_alert_triggers_triggered_at_idx" ON "construction_price_alert_triggers"("triggered_at");

-- CreateIndex
CREATE INDEX "construction_community_price_reports_user_id_created_at_idx" ON "construction_community_price_reports"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "construction_community_price_reports_material_id_location_i_idx" ON "construction_community_price_reports"("material_id", "location_id", "status");

-- CreateIndex
CREATE INDEX "construction_community_price_reports_status_purchase_date_idx" ON "construction_community_price_reports"("status", "purchase_date");

-- CreateIndex
CREATE INDEX "construction_community_price_reports_status_trust_score_idx" ON "construction_community_price_reports"("status", "trust_score");

-- CreateIndex
CREATE INDEX "construction_community_price_reports_deleted_at_idx" ON "construction_community_price_reports"("deleted_at");

-- CreateIndex
CREATE INDEX "construction_saved_comparisons_user_id_created_at_idx" ON "construction_saved_comparisons"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "construction_documents_project_id_kind_idx" ON "construction_documents"("project_id", "kind");

-- CreateIndex
CREATE INDEX "construction_documents_media_id_idx" ON "construction_documents"("media_id");

-- CreateIndex
CREATE INDEX "construction_documents_boq_id_idx" ON "construction_documents"("boq_id");

-- CreateIndex
CREATE INDEX "construction_documents_expense_id_idx" ON "construction_documents"("expense_id");

-- CreateIndex
CREATE INDEX "construction_documents_phase_id_idx" ON "construction_documents"("phase_id");

-- CreateIndex
CREATE INDEX "construction_documents_quote_document_id_idx" ON "construction_documents"("quote_document_id");

-- CreateIndex
CREATE INDEX "construction_rate_sources_source_type_idx" ON "construction_rate_sources"("source_type");

-- CreateIndex
CREATE INDEX "construction_rate_sources_location_id_idx" ON "construction_rate_sources"("location_id");

-- CreateIndex
CREATE INDEX "construction_material_specifications_slug_idx" ON "construction_material_specifications"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "construction_material_specifications_material_id_slug_key" ON "construction_material_specifications"("material_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "construction_labour_trades_slug_key" ON "construction_labour_trades"("slug");

-- CreateIndex
CREATE INDEX "construction_labour_rates_trade_id_location_id_effective_fr_idx" ON "construction_labour_rates"("trade_id", "location_id", "effective_from");

-- CreateIndex
CREATE INDEX "construction_labour_rates_source_type_rate_status_idx" ON "construction_labour_rates"("source_type", "rate_status");

-- CreateIndex
CREATE UNIQUE INDEX "construction_equipment_slug_key" ON "construction_equipment"("slug");

-- CreateIndex
CREATE INDEX "construction_equipment_rates_equipment_id_location_id_idx" ON "construction_equipment_rates"("equipment_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "construction_professional_services_slug_key" ON "construction_professional_services"("slug");

-- CreateIndex
CREATE INDEX "construction_professional_rates_service_id_location_id_idx" ON "construction_professional_rates"("service_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "construction_phase_templates_code_key" ON "construction_phase_templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "construction_work_items_code_key" ON "construction_work_items"("code");

-- CreateIndex
CREATE INDEX "construction_work_items_phase_id_idx" ON "construction_work_items"("phase_id");

-- CreateIndex
CREATE INDEX "construction_work_item_resources_work_item_id_resource_type_idx" ON "construction_work_item_resources"("work_item_id", "resource_type");

-- CreateIndex
CREATE UNIQUE INDEX "cwir_item_type_key_unique" ON "construction_work_item_resources"("work_item_id", "resource_type", "resource_key");

-- CreateIndex
CREATE INDEX "construction_productivity_norms_trade_id_work_item_id_idx" ON "construction_productivity_norms"("trade_id", "work_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "construction_wastage_rules_category_key_key" ON "construction_wastage_rules"("category_key");

-- CreateIndex
CREATE UNIQUE INDEX "construction_quality_tiers_code_key" ON "construction_quality_tiers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "construction_quality_specifications_tier_id_category_key_key" ON "construction_quality_specifications"("tier_id", "category_key");

-- CreateIndex
CREATE UNIQUE INDEX "construction_interior_components_slug_key" ON "construction_interior_components"("slug");

-- CreateIndex
CREATE INDEX "construction_interior_rates_component_id_location_id_idx" ON "construction_interior_rates"("component_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "construction_location_cost_factors_location_id_key" ON "construction_location_cost_factors"("location_id");

-- CreateIndex
CREATE INDEX "construction_benchmark_rates_location_id_building_type_idx" ON "construction_benchmark_rates"("location_id", "building_type");

-- CreateIndex
CREATE UNIQUE INDEX "construction_commercial_rules_location_id_kind_key" ON "construction_commercial_rules"("location_id", "kind");

-- CreateIndex
CREATE INDEX "construction_rate_reviews_status_created_at_idx" ON "construction_rate_reviews"("status", "created_at");

-- CreateIndex
CREATE INDEX "construction_supplier_quotations_status_quoted_at_idx" ON "construction_supplier_quotations"("status", "quoted_at");

-- CreateIndex
CREATE INDEX "construction_user_rate_overrides_user_id_project_id_idx" ON "construction_user_rate_overrides"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "construction_rate_audit_logs_entity_entity_id_idx" ON "construction_rate_audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "construction_rate_audit_logs_created_at_idx" ON "construction_rate_audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_manufacturers_slug_key" ON "automobile_manufacturers"("slug");

-- CreateIndex
CREATE INDEX "automobile_manufacturers_status_idx" ON "automobile_manufacturers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_vehicles_slug_key" ON "automobile_vehicles"("slug");

-- CreateIndex
CREATE INDEX "automobile_vehicles_status_idx" ON "automobile_vehicles"("status");

-- CreateIndex
CREATE INDEX "automobile_vehicles_manufacturer_id_idx" ON "automobile_vehicles"("manufacturer_id");

-- CreateIndex
CREATE INDEX "automobile_vehicles_category_idx" ON "automobile_vehicles"("category");

-- CreateIndex
CREATE INDEX "automobile_vehicles_fuel_type_idx" ON "automobile_vehicles"("fuel_type");

-- CreateIndex
CREATE INDEX "automobile_vehicles_seating_capacity_idx" ON "automobile_vehicles"("seating_capacity");

-- CreateIndex
CREATE INDEX "automobile_vehicles_ex_showroom_price_idx" ON "automobile_vehicles"("ex_showroom_price");

-- CreateIndex
CREATE INDEX "automobile_vehicles_manufacturer_id_model_idx" ON "automobile_vehicles"("manufacturer_id", "model");

-- CreateIndex
CREATE INDEX "automobile_vehicles_available_in_india_idx" ON "automobile_vehicles"("available_in_india");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_vehicles_manufacturer_id_model_variant_key" ON "automobile_vehicles"("manufacturer_id", "model", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_image_cache_cache_key_key" ON "automobile_image_cache"("cache_key");

-- CreateIndex
CREATE INDEX "automobile_image_cache_expires_at_idx" ON "automobile_image_cache"("expires_at");

-- CreateIndex
CREATE INDEX "automobile_vehicle_images_vehicle_id_display_order_idx" ON "automobile_vehicle_images"("vehicle_id", "display_order");

-- CreateIndex
CREATE INDEX "automobile_maintenance_schedules_vehicle_id_idx" ON "automobile_maintenance_schedules"("vehicle_id");

-- CreateIndex
CREATE INDEX "automobile_faqs_status_sort_order_idx" ON "automobile_faqs"("status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_guides_slug_key" ON "automobile_guides"("slug");

-- CreateIndex
CREATE INDEX "automobile_guides_status_idx" ON "automobile_guides"("status");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_comparisons_slug_key" ON "automobile_comparisons"("slug");

-- CreateIndex
CREATE INDEX "automobile_comparisons_status_idx" ON "automobile_comparisons"("status");

-- CreateIndex
CREATE INDEX "cars_make_idx" ON "cars"("make");

-- CreateIndex
CREATE INDEX "cars_make_model_idx" ON "cars"("make", "model");

-- CreateIndex
CREATE INDEX "cars_engine_fuel_type_idx" ON "cars"("engine_fuel_type");

-- CreateIndex
CREATE INDEX "cars_year_from_idx" ON "cars"("year_from");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_slug_key" ON "reviews"("slug");

-- CreateIndex
CREATE INDEX "reviews_product_id_status_idx" ON "reviews"("product_id", "status");

-- CreateIndex
CREATE INDEX "reviews_status_published_at_idx" ON "reviews"("status", "published_at");

-- CreateIndex
CREATE INDEX "reviews_entity_type_entity_id_idx" ON "reviews"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "reviews_review_type_idx" ON "reviews"("review_type");

-- CreateIndex
CREATE INDEX "user_reviews_entity_type_entity_id_status_idx" ON "user_reviews"("entity_type", "entity_id", "status");

-- CreateIndex
CREATE INDEX "user_reviews_status_idx" ON "user_reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_reviews_user_id_entity_type_entity_id_key" ON "user_reviews"("user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_helpfulness_user_review_id_user_id_key" ON "review_helpfulness"("user_review_id", "user_id");

-- CreateIndex
CREATE INDEX "review_sections_review_id_sort_order_idx" ON "review_sections"("review_id", "sort_order");

-- CreateIndex
CREATE INDEX "review_scores_review_id_idx" ON "review_scores"("review_id");

-- CreateIndex
CREATE INDEX "review_pros_review_id_idx" ON "review_pros"("review_id");

-- CreateIndex
CREATE INDEX "review_cons_review_id_idx" ON "review_cons"("review_id");

-- CreateIndex
CREATE INDEX "comparison_templates_entity_type_idx" ON "comparison_templates"("entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "comparisons_slug_key" ON "comparisons"("slug");

-- CreateIndex
CREATE INDEX "comparisons_status_slug_idx" ON "comparisons"("status", "slug");

-- CreateIndex
CREATE INDEX "comparisons_entity_type_idx" ON "comparisons"("entity_type");

-- CreateIndex
CREATE INDEX "comparisons_comparison_type_idx" ON "comparisons"("comparison_type");

-- CreateIndex
CREATE INDEX "comparison_items_entity_type_entity_id_idx" ON "comparison_items"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparison_items_comparison_id_product_id_key" ON "comparison_items"("comparison_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparison_attributes_comparison_id_key_key" ON "comparison_attributes"("comparison_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "comparison_values_comparison_item_id_comparison_attribute_i_key" ON "comparison_values"("comparison_item_id", "comparison_attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_categories_slug_key" ON "business_categories"("slug");

-- CreateIndex
CREATE INDEX "business_categories_parent_id_idx" ON "business_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "businesses_status_slug_idx" ON "businesses"("status", "slug");

-- CreateIndex
CREATE INDEX "businesses_featured_sponsored_idx" ON "businesses"("featured", "sponsored");

-- CreateIndex
CREATE INDEX "businesses_verification_status_idx" ON "businesses"("verification_status");

-- CreateIndex
CREATE INDEX "businesses_listing_type_idx" ON "businesses"("listing_type");

-- CreateIndex
CREATE INDEX "business_locations_business_id_idx" ON "business_locations"("business_id");

-- CreateIndex
CREATE INDEX "business_locations_city_country_idx" ON "business_locations"("city", "country");

-- CreateIndex
CREATE INDEX "business_locations_state_city_idx" ON "business_locations"("state", "city");

-- CreateIndex
CREATE INDEX "business_locations_latitude_longitude_idx" ON "business_locations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "business_services_business_id_idx" ON "business_services"("business_id");

-- CreateIndex
CREATE INDEX "business_products_business_id_idx" ON "business_products"("business_id");

-- CreateIndex
CREATE INDEX "business_media_business_id_kind_idx" ON "business_media"("business_id", "kind");

-- CreateIndex
CREATE INDEX "business_hours_business_id_idx" ON "business_hours"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_business_id_day_key" ON "business_hours"("business_id", "day");

-- CreateIndex
CREATE INDEX "lead_requests_business_id_status_idx" ON "lead_requests"("business_id", "status");

-- CreateIndex
CREATE INDEX "lead_requests_status_created_at_idx" ON "lead_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "directory_events_event_type_created_at_idx" ON "directory_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "directory_events_business_id_event_type_idx" ON "directory_events"("business_id", "event_type");

-- CreateIndex
CREATE INDEX "business_reviews_business_id_rating_idx" ON "business_reviews"("business_id", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ai_categories_slug_key" ON "ai_categories"("slug");

-- CreateIndex
CREATE INDEX "ai_categories_parent_id_idx" ON "ai_categories"("parent_id");

-- CreateIndex
CREATE INDEX "ai_category_follows_user_id_created_at_idx" ON "ai_category_follows"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_category_follows_category_id_idx" ON "ai_category_follows"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_category_follows_user_id_category_id_key" ON "ai_category_follows"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tools_slug_key" ON "ai_tools"("slug");

-- CreateIndex
CREATE INDEX "ai_tools_status_slug_idx" ON "ai_tools"("status", "slug");

-- CreateIndex
CREATE INDEX "ai_tools_featured_sponsored_idx" ON "ai_tools"("featured", "sponsored");

-- CreateIndex
CREATE INDEX "ai_tools_pricing_model_idx" ON "ai_tools"("pricing_model");

-- CreateIndex
CREATE INDEX "ai_tools_category_id_idx" ON "ai_tools"("category_id");

-- CreateIndex
CREATE INDEX "ai_tools_company_id_idx" ON "ai_tools"("company_id");

-- CreateIndex
CREATE INDEX "ai_features_tool_id_idx" ON "ai_features"("tool_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_features_tool_id_feature_name_key" ON "ai_features"("tool_id", "feature_name");

-- CreateIndex
CREATE INDEX "ai_integrations_tool_id_idx" ON "ai_integrations"("tool_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_integrations_tool_id_integration_name_key" ON "ai_integrations"("tool_id", "integration_name");

-- CreateIndex
CREATE INDEX "tool_screenshots_tool_id_sort_order_idx" ON "tool_screenshots"("tool_id", "sort_order");

-- CreateIndex
CREATE INDEX "user_bookmarks_user_id_collection_name_idx" ON "user_bookmarks"("user_id", "collection_name");

-- CreateIndex
CREATE INDEX "user_bookmarks_tool_id_idx" ON "user_bookmarks"("tool_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_bookmarks_user_id_tool_id_key" ON "user_bookmarks"("user_id", "tool_id");

-- CreateIndex
CREATE INDEX "ai_tool_recently_viewed_user_id_viewed_at_idx" ON "ai_tool_recently_viewed"("user_id", "viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_recently_viewed_user_id_tool_id_key" ON "ai_tool_recently_viewed"("user_id", "tool_id");

-- CreateIndex
CREATE INDEX "ai_tool_events_tool_id_event_type_created_at_idx" ON "ai_tool_events"("tool_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "ai_tool_events_event_type_created_at_idx" ON "ai_tool_events"("event_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_slug_key" ON "ai_models"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompts_slug_key" ON "ai_prompts"("slug");

-- CreateIndex
CREATE INDEX "ai_jobs_status_created_at_idx" ON "ai_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "ai_jobs_user_id_created_at_idx" ON "ai_jobs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "generated_content_job_id_idx" ON "generated_content"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_sessions_session_key_key" ON "analytics_sessions"("session_key");

-- CreateIndex
CREATE INDEX "analytics_sessions_started_at_idx" ON "analytics_sessions"("started_at");

-- CreateIndex
CREATE INDEX "analytics_sessions_user_id_idx" ON "analytics_sessions"("user_id");

-- CreateIndex
CREATE INDEX "page_views_path_created_at_idx" ON "page_views"("path", "created_at");

-- CreateIndex
CREATE INDEX "page_views_user_id_created_at_idx" ON "page_views"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_entity_type_entity_id_idx" ON "analytics_events"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_created_at_idx" ON "analytics_events"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_created_at_idx" ON "analytics_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_aggregates_period_period_start_idx" ON "analytics_aggregates"("period", "period_start");

-- CreateIndex
CREATE INDEX "analytics_aggregates_metric_name_period_start_idx" ON "analytics_aggregates"("metric_name", "period_start");

-- CreateIndex
CREATE INDEX "analytics_aggregates_metric_name_period_period_start_entity_idx" ON "analytics_aggregates"("metric_name", "period", "period_start", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "traffic_sources_source_created_at_idx" ON "traffic_sources"("source", "created_at");

-- CreateIndex
CREATE INDEX "traffic_sources_campaign_created_at_idx" ON "traffic_sources"("campaign", "created_at");

-- CreateIndex
CREATE INDEX "system_metrics_metric_name_recorded_at_idx" ON "system_metrics"("metric_name", "recorded_at");

-- CreateIndex
CREATE INDEX "affiliate_conversions_partner_idx" ON "affiliate_conversions"("partner");

-- CreateIndex
CREATE INDEX "affiliate_conversions_entity_type_entity_id_idx" ON "affiliate_conversions"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "analytics_saved_reports_created_by_idx" ON "analytics_saved_reports"("created_by");

-- CreateIndex
CREATE INDEX "search_index_entity_type_status_idx" ON "search_index"("entity_type", "status");

-- CreateIndex
CREATE INDEX "search_index_category_idx" ON "search_index"("category");

-- CreateIndex
CREATE INDEX "search_index_published_at_idx" ON "search_index"("published_at");

-- CreateIndex
CREATE INDEX "search_index_slug_idx" ON "search_index"("slug");

-- CreateIndex
CREATE INDEX "search_index_location_idx" ON "search_index"("location");

-- CreateIndex
CREATE INDEX "search_index_brand_idx" ON "search_index"("brand");

-- CreateIndex
CREATE INDEX "search_index_rating_idx" ON "search_index"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "search_index_entity_type_entity_id_key" ON "search_index"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "search_queries_query_idx" ON "search_queries"("query");

-- CreateIndex
CREATE INDEX "search_queries_created_at_idx" ON "search_queries"("created_at");

-- CreateIndex
CREATE INDEX "search_queries_results_idx" ON "search_queries"("results");

-- CreateIndex
CREATE INDEX "search_result_clicks_entity_type_entity_id_idx" ON "search_result_clicks"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "search_result_clicks_created_at_idx" ON "search_result_clicks"("created_at");

-- CreateIndex
CREATE INDEX "search_result_clicks_query_id_idx" ON "search_result_clicks"("query_id");

-- CreateIndex
CREATE UNIQUE INDEX "popular_searches_keyword_key" ON "popular_searches"("keyword");

-- CreateIndex
CREATE INDEX "popular_searches_search_count_idx" ON "popular_searches"("search_count");

-- CreateIndex
CREATE INDEX "click_events_event_name_created_at_idx" ON "click_events"("event_name", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_templates_slug_key" ON "newsletter_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_campaigns_slug_key" ON "newsletter_campaigns"("slug");

-- CreateIndex
CREATE INDEX "newsletter_campaigns_status_scheduled_at_idx" ON "newsletter_campaigns"("status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_slug_key" ON "notification_templates"("slug");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "user_notifications_user_id_read_at_idx" ON "user_notifications"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_user_id_notification_id_key" ON "user_notifications"("user_id", "notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_status_idx" ON "subscriptions"("plan_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE INDEX "invoices_status_issued_at_idx" ON "invoices"("status", "issued_at");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- CreateIndex
CREATE INDEX "transactions_payment_id_created_at_idx" ON "transactions"("payment_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "translation_keys_namespace_key_key" ON "translation_keys"("namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "translation_values_key_id_language_id_key" ON "translation_values"("key_id", "language_id");

-- CreateIndex
CREATE INDEX "api_request_logs_created_at_idx" ON "api_request_logs"("created_at");

-- CreateIndex
CREATE INDEX "api_request_logs_path_created_at_idx" ON "api_request_logs"("path", "created_at");

-- CreateIndex
CREATE INDEX "api_request_logs_status_code_created_at_idx" ON "api_request_logs"("status_code", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_key_prefix_idx" ON "api_keys"("key_prefix");

-- CreateIndex
CREATE INDEX "webhook_deliveries_endpoint_id_created_at_idx" ON "webhook_deliveries"("endpoint_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_content_subscriptions" ADD CONSTRAINT "user_content_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_assets" ADD CONSTRAINT "theme_assets_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_assets" ADD CONSTRAINT "theme_assets_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_asset_blobs" ADD CONSTRAINT "media_asset_blobs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_usage" ADD CONSTRAINT "media_usage_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_asset_versions" ADD CONSTRAINT "media_asset_versions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_album_assets" ADD CONSTRAINT "media_album_assets_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "media_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_album_assets" ADD CONSTRAINT "media_album_assets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_asset_tags" ADD CONSTRAINT "media_asset_tags_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_asset_tags" ADD CONSTRAINT "media_asset_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "media_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_featured_image_id_fkey" FOREIGN KEY ("featured_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_fkey" FOREIGN KEY ("hero_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_related" ADD CONSTRAINT "article_related_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_related" ADD CONSTRAINT "article_related_related_id_fkey" FOREIGN KEY ("related_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "homepage_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_instances" ADD CONSTRAINT "widget_instances_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "homepage_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_instances" ADD CONSTRAINT "widget_instances_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "ad_placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculators" ADD CONSTRAINT "calculators_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "calculator_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculator_fields" ADD CONSTRAINT "calculator_fields_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculator_versions" ADD CONSTRAINT "calculator_versions_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_history" ADD CONSTRAINT "calculation_history_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculator_analytics_events" ADD CONSTRAINT "calculator_analytics_events_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_calculations" ADD CONSTRAINT "saved_calculations_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_calculations" ADD CONSTRAINT "saved_calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_products" ADD CONSTRAINT "insurance_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_products" ADD CONSTRAINT "investment_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_rates" ADD CONSTRAINT "interest_rates_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_rates" ADD CONSTRAINT "interest_rates_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_faqs" ADD CONSTRAINT "finance_faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_guides" ADD CONSTRAINT "finance_guides_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_rate_histories" ADD CONSTRAINT "loan_rate_histories_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_portfolio_holdings" ADD CONSTRAINT "finance_portfolio_holdings_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "finance_portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_materials" ADD CONSTRAINT "construction_materials_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "construction_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_materials" ADD CONSTRAINT "construction_materials_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "construction_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_templates" ADD CONSTRAINT "cost_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "construction_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_estimators" ADD CONSTRAINT "construction_estimators_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "cost_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_projects" ADD CONSTRAINT "construction_projects_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_project_items" ADD CONSTRAINT "construction_project_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_project_items" ADD CONSTRAINT "construction_project_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "construction_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_project_checklist_progress" ADD CONSTRAINT "construction_project_checklist_progress_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_project_checklist_progress" ADD CONSTRAINT "construction_project_checklist_progress_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "construction_checklists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_locations" ADD CONSTRAINT "construction_locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_material_prices" ADD CONSTRAINT "construction_material_prices_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "construction_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_material_prices" ADD CONSTRAINT "construction_material_prices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_material_prices" ADD CONSTRAINT "construction_material_prices_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "construction_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_material_prices" ADD CONSTRAINT "construction_material_prices_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "construction_rate_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_material_prices" ADD CONSTRAINT "construction_material_prices_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "construction_material_specifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_seo_audit_issues" ADD CONSTRAINT "construction_seo_audit_issues_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "construction_seo_audit_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_vcci_snapshots" ADD CONSTRAINT "construction_vcci_snapshots_methodology_id_fkey" FOREIGN KEY ("methodology_id") REFERENCES "construction_vcci_methodologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_vcci_snapshots" ADD CONSTRAINT "construction_vcci_snapshots_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_cost_rates" ADD CONSTRAINT "construction_cost_rates_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_calculations" ADD CONSTRAINT "construction_calculations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_calculations" ADD CONSTRAINT "construction_calculations_calculator_id_fkey" FOREIGN KEY ("calculator_id") REFERENCES "calculators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_boqs" ADD CONSTRAINT "construction_boqs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_boq_items" ADD CONSTRAINT "construction_boq_items_boq_id_fkey" FOREIGN KEY ("boq_id") REFERENCES "construction_boqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_boq_items" ADD CONSTRAINT "construction_boq_items_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "construction_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_boq_items" ADD CONSTRAINT "construction_boq_items_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "construction_project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_project_phases" ADD CONSTRAINT "construction_project_phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_budget_items" ADD CONSTRAINT "construction_budget_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_budget_items" ADD CONSTRAINT "construction_budget_items_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "construction_project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_expenses" ADD CONSTRAINT "construction_expenses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_expenses" ADD CONSTRAINT "construction_expenses_budget_item_id_fkey" FOREIGN KEY ("budget_item_id") REFERENCES "construction_budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_expenses" ADD CONSTRAINT "construction_expenses_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "construction_project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_price_alerts" ADD CONSTRAINT "construction_price_alerts_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "construction_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_price_alerts" ADD CONSTRAINT "construction_price_alerts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_price_alert_triggers" ADD CONSTRAINT "construction_price_alert_triggers_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "construction_price_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_community_price_reports" ADD CONSTRAINT "construction_community_price_reports_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "construction_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_community_price_reports" ADD CONSTRAINT "construction_community_price_reports_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_community_price_reports" ADD CONSTRAINT "construction_community_price_reports_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "construction_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_community_price_reports" ADD CONSTRAINT "construction_community_price_reports_duplicate_of_id_fkey" FOREIGN KEY ("duplicate_of_id") REFERENCES "construction_community_price_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_documents" ADD CONSTRAINT "construction_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "construction_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_documents" ADD CONSTRAINT "construction_documents_boq_id_fkey" FOREIGN KEY ("boq_id") REFERENCES "construction_boqs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_documents" ADD CONSTRAINT "construction_documents_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "construction_expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_documents" ADD CONSTRAINT "construction_documents_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "construction_project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_documents" ADD CONSTRAINT "construction_documents_quote_document_id_fkey" FOREIGN KEY ("quote_document_id") REFERENCES "construction_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_rate_sources" ADD CONSTRAINT "construction_rate_sources_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_material_specifications" ADD CONSTRAINT "construction_material_specifications_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "construction_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_labour_rates" ADD CONSTRAINT "construction_labour_rates_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "construction_labour_trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_labour_rates" ADD CONSTRAINT "construction_labour_rates_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_labour_rates" ADD CONSTRAINT "construction_labour_rates_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "construction_rate_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_equipment_rates" ADD CONSTRAINT "construction_equipment_rates_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "construction_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_equipment_rates" ADD CONSTRAINT "construction_equipment_rates_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_professional_rates" ADD CONSTRAINT "construction_professional_rates_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "construction_professional_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_professional_rates" ADD CONSTRAINT "construction_professional_rates_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_work_items" ADD CONSTRAINT "construction_work_items_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "construction_phase_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_work_item_resources" ADD CONSTRAINT "construction_work_item_resources_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "construction_work_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_productivity_norms" ADD CONSTRAINT "construction_productivity_norms_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "construction_labour_trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_productivity_norms" ADD CONSTRAINT "construction_productivity_norms_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "construction_work_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_quality_specifications" ADD CONSTRAINT "construction_quality_specifications_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "construction_quality_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_interior_rates" ADD CONSTRAINT "construction_interior_rates_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "construction_interior_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_interior_rates" ADD CONSTRAINT "construction_interior_rates_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_location_cost_factors" ADD CONSTRAINT "construction_location_cost_factors_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_benchmark_rates" ADD CONSTRAINT "construction_benchmark_rates_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_benchmark_rates" ADD CONSTRAINT "construction_benchmark_rates_quality_tier_id_fkey" FOREIGN KEY ("quality_tier_id") REFERENCES "construction_quality_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_commercial_rules" ADD CONSTRAINT "construction_commercial_rules_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_rate_reviews" ADD CONSTRAINT "construction_rate_reviews_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_supplier_quotations" ADD CONSTRAINT "construction_supplier_quotations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "construction_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_vehicles" ADD CONSTRAINT "automobile_vehicles_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "automobile_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_vehicle_images" ADD CONSTRAINT "automobile_vehicle_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_vehicle_reviews" ADD CONSTRAINT "automobile_vehicle_reviews_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_vehicle_reviews" ADD CONSTRAINT "automobile_vehicle_reviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_maintenance_schedules" ADD CONSTRAINT "automobile_maintenance_schedules_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpfulness" ADD CONSTRAINT "review_helpfulness_user_review_id_fkey" FOREIGN KEY ("user_review_id") REFERENCES "user_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sections" ADD CONSTRAINT "review_sections_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_scores" ADD CONSTRAINT "review_scores_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_pros" ADD CONSTRAINT "review_pros_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_cons" ADD CONSTRAINT "review_cons_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "comparison_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_comparison_id_fkey" FOREIGN KEY ("comparison_id") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_attributes" ADD CONSTRAINT "comparison_attributes_comparison_id_fkey" FOREIGN KEY ("comparison_id") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_values" ADD CONSTRAINT "comparison_values_comparison_item_id_fkey" FOREIGN KEY ("comparison_item_id") REFERENCES "comparison_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_values" ADD CONSTRAINT "comparison_values_comparison_attribute_id_fkey" FOREIGN KEY ("comparison_attribute_id") REFERENCES "comparison_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "business_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_category_links" ADD CONSTRAINT "business_category_links_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_category_links" ADD CONSTRAINT "business_category_links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "business_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_locations" ADD CONSTRAINT "business_locations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_products" ADD CONSTRAINT "business_products_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_media" ADD CONSTRAINT "business_media_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directory_events" ADD CONSTRAINT "directory_events_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_categories" ADD CONSTRAINT "ai_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ai_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_category_follows" ADD CONSTRAINT "ai_category_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_category_follows" ADD CONSTRAINT "ai_category_follows_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ai_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tools" ADD CONSTRAINT "ai_tools_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ai_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tools" ADD CONSTRAINT "ai_tools_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_features" ADD CONSTRAINT "ai_features_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_integrations" ADD CONSTRAINT "ai_integrations_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_screenshots" ADD CONSTRAINT "tool_screenshots_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_recently_viewed" ADD CONSTRAINT "ai_tool_recently_viewed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_recently_viewed" ADD CONSTRAINT "ai_tool_recently_viewed_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_events" ADD CONSTRAINT "ai_tool_events_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "ai_tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "ai_prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "ai_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "analytics_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "analytics_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_sources" ADD CONSTRAINT "traffic_sources_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "analytics_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_result_clicks" ADD CONSTRAINT "search_result_clicks_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "search_queries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "analytics_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "newsletter_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_values" ADD CONSTRAINT "translation_values_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "translation_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_values" ADD CONSTRAINT "translation_values_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

