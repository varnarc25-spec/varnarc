CREATE TABLE IF NOT EXISTS "hr_departments" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_departments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hr_departments_code_key" ON "hr_departments"("code");

CREATE TABLE IF NOT EXISTS "hr_employees" (
  "id" UUID NOT NULL,
  "employee_code" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "job_title" TEXT NOT NULL,
  "department_id" UUID,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "joined_on" DATE,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_employees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hr_employees_employee_code_key" ON "hr_employees"("employee_code");
CREATE INDEX IF NOT EXISTS "hr_employees_department_id_idx" ON "hr_employees"("department_id");
CREATE INDEX IF NOT EXISTS "hr_employees_status_idx" ON "hr_employees"("status");

ALTER TABLE "hr_employees"
  DROP CONSTRAINT IF EXISTS "hr_employees_department_id_fkey";
ALTER TABLE "hr_employees"
  ADD CONSTRAINT "hr_employees_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES "hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "hr_leave_requests" (
  "id" UUID NOT NULL,
  "employee_id" UUID NOT NULL,
  "leave_type" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "hr_leave_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "hr_leave_requests_employee_id_status_idx" ON "hr_leave_requests"("employee_id", "status");

ALTER TABLE "hr_leave_requests"
  DROP CONSTRAINT IF EXISTS "hr_leave_requests_employee_id_fkey";
ALTER TABLE "hr_leave_requests"
  ADD CONSTRAINT "hr_leave_requests_employee_id_fkey"
  FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
