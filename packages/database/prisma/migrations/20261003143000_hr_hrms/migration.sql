CREATE TABLE IF NOT EXISTS "hr_organizations" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "kind" TEXT NOT NULL DEFAULT 'UNIT',
  "parent_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_organizations_code_key" ON "hr_organizations"("code");
ALTER TABLE "hr_organizations" DROP CONSTRAINT IF EXISTS "hr_organizations_parent_id_fkey";
ALTER TABLE "hr_organizations" ADD CONSTRAINT "hr_organizations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hr_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_exits" (
  "id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "last_working_day" DATE NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'INITIATED',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_exits_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_exits_employee_id_status_idx" ON "hr_exits"("employee_id", "status");
ALTER TABLE "hr_exits" DROP CONSTRAINT IF EXISTS "hr_exits_employee_id_fkey";
ALTER TABLE "hr_exits" ADD CONSTRAINT "hr_exits_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_job_openings" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "department_id" UUID,
  "location" TEXT,
  "openings" INTEGER NOT NULL DEFAULT 1,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_job_openings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_job_openings_status_idx" ON "hr_job_openings"("status");
ALTER TABLE "hr_job_openings" DROP CONSTRAINT IF EXISTS "hr_job_openings_department_id_fkey";
ALTER TABLE "hr_job_openings" ADD CONSTRAINT "hr_job_openings_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_candidates" (
  "id" UUID NOT NULL,
  "opening_id" UUID NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'APPLIED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_candidates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_candidates_opening_id_status_idx" ON "hr_candidates"("opening_id", "status");
ALTER TABLE "hr_candidates" DROP CONSTRAINT IF EXISTS "hr_candidates_opening_id_fkey";
ALTER TABLE "hr_candidates" ADD CONSTRAINT "hr_candidates_opening_id_fkey" FOREIGN KEY ("opening_id") REFERENCES "hr_job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_interviews" (
  "id" UUID NOT NULL,
  "candidate_id" UUID NOT NULL,
  "scheduled_at" TIMESTAMP(3) NOT NULL,
  "interviewer" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "result" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_interviews_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_interviews_candidate_id_idx" ON "hr_interviews"("candidate_id");
ALTER TABLE "hr_interviews" DROP CONSTRAINT IF EXISTS "hr_interviews_candidate_id_fkey";
ALTER TABLE "hr_interviews" ADD CONSTRAINT "hr_interviews_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "hr_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_asset_masters" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_asset_masters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_assets" (
  "id" UUID NOT NULL,
  "master_id" UUID NOT NULL,
  "asset_tag" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "employee_id" UUID,
  "assigned_on" DATE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_assets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_assets_asset_tag_key" ON "hr_assets"("asset_tag");
CREATE INDEX IF NOT EXISTS "hr_assets_status_idx" ON "hr_assets"("status");
CREATE INDEX IF NOT EXISTS "hr_assets_employee_id_idx" ON "hr_assets"("employee_id");
ALTER TABLE "hr_assets" DROP CONSTRAINT IF EXISTS "hr_assets_master_id_fkey";
ALTER TABLE "hr_assets" ADD CONSTRAINT "hr_assets_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "hr_asset_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hr_assets" DROP CONSTRAINT IF EXISTS "hr_assets_employee_id_fkey";
ALTER TABLE "hr_assets" ADD CONSTRAINT "hr_assets_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_document_folders" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "parent_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_document_folders_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "hr_document_folders" DROP CONSTRAINT IF EXISTS "hr_document_folders_parent_id_fkey";
ALTER TABLE "hr_document_folders" ADD CONSTRAINT "hr_document_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hr_document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_document_types" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_document_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_document_types_code_key" ON "hr_document_types"("code");

CREATE TABLE IF NOT EXISTS "hr_documents" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "folder_id" UUID,
  "type_id" UUID,
  "employee_id" UUID,
  "reference" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_documents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_documents_folder_id_idx" ON "hr_documents"("folder_id");
ALTER TABLE "hr_documents" DROP CONSTRAINT IF EXISTS "hr_documents_folder_id_fkey";
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "hr_document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hr_documents" DROP CONSTRAINT IF EXISTS "hr_documents_type_id_fkey";
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "hr_document_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hr_documents" DROP CONSTRAINT IF EXISTS "hr_documents_employee_id_fkey";
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_portal_accounts" (
  "id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_portal_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_portal_accounts_employee_id_key" ON "hr_portal_accounts"("employee_id");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_portal_accounts_email_key" ON "hr_portal_accounts"("email");
ALTER TABLE "hr_portal_accounts" DROP CONSTRAINT IF EXISTS "hr_portal_accounts_employee_id_fkey";
ALTER TABLE "hr_portal_accounts" ADD CONSTRAINT "hr_portal_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_login_sessions" (
  "id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMP(3),
  "ip_address" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_login_sessions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_login_sessions_account_id_status_idx" ON "hr_login_sessions"("account_id", "status");
ALTER TABLE "hr_login_sessions" DROP CONSTRAINT IF EXISTS "hr_login_sessions_account_id_fkey";
ALTER TABLE "hr_login_sessions" ADD CONSTRAINT "hr_login_sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "hr_portal_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_ess_requests" (
  "id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "request_type" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "details" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_ess_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_ess_requests_status_idx" ON "hr_ess_requests"("status");
ALTER TABLE "hr_ess_requests" DROP CONSTRAINT IF EXISTS "hr_ess_requests_employee_id_fkey";
ALTER TABLE "hr_ess_requests" ADD CONSTRAINT "hr_ess_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_announcements" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "published_on" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_announcements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_notifications" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_roles" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_roles_name_key" ON "hr_roles"("name");

CREATE TABLE IF NOT EXISTS "hr_role_assignments" (
  "id" UUID NOT NULL,
  "role_id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_role_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_role_assignments_role_id_employee_id_key" ON "hr_role_assignments"("role_id", "employee_id");
ALTER TABLE "hr_role_assignments" DROP CONSTRAINT IF EXISTS "hr_role_assignments_role_id_fkey";
ALTER TABLE "hr_role_assignments" ADD CONSTRAINT "hr_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "hr_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hr_role_assignments" DROP CONSTRAINT IF EXISTS "hr_role_assignments_employee_id_fkey";
ALTER TABLE "hr_role_assignments" ADD CONSTRAINT "hr_role_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_clients" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_client_assignments" (
  "id" UUID NOT NULL,
  "client_id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_client_assignments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "hr_client_assignments_client_id_idx" ON "hr_client_assignments"("client_id");
CREATE INDEX IF NOT EXISTS "hr_client_assignments_employee_id_idx" ON "hr_client_assignments"("employee_id");
ALTER TABLE "hr_client_assignments" DROP CONSTRAINT IF EXISTS "hr_client_assignments_client_id_fkey";
ALTER TABLE "hr_client_assignments" ADD CONSTRAINT "hr_client_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "hr_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hr_client_assignments" DROP CONSTRAINT IF EXISTS "hr_client_assignments_employee_id_fkey";
ALTER TABLE "hr_client_assignments" ADD CONSTRAINT "hr_client_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_salaries" (
  "id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "basic" DECIMAL(12,2) NOT NULL,
  "hra" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "allowances" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_salaries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_salaries_employee_id_key" ON "hr_salaries"("employee_id");
ALTER TABLE "hr_salaries" DROP CONSTRAINT IF EXISTS "hr_salaries_employee_id_fkey";
ALTER TABLE "hr_salaries" ADD CONSTRAINT "hr_salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_payroll_runs" (
  "id" UUID NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_payroll_runs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_payroll_runs_period_key" ON "hr_payroll_runs"("period");

CREATE TABLE IF NOT EXISTS "hr_payslips" (
  "id" UUID NOT NULL,
  "payroll_run_id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "basic" DECIMAL(12,2) NOT NULL,
  "hra" DECIMAL(12,2) NOT NULL,
  "allowances" DECIMAL(12,2) NOT NULL,
  "deductions" DECIMAL(12,2) NOT NULL,
  "net_pay" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_payslips_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "hr_payslips_payroll_run_id_employee_id_key" ON "hr_payslips"("payroll_run_id", "employee_id");
ALTER TABLE "hr_payslips" DROP CONSTRAINT IF EXISTS "hr_payslips_payroll_run_id_fkey";
ALTER TABLE "hr_payslips" ADD CONSTRAINT "hr_payslips_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "hr_payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hr_payslips" DROP CONSTRAINT IF EXISTS "hr_payslips_employee_id_fkey";
ALTER TABLE "hr_payslips" ADD CONSTRAINT "hr_payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
