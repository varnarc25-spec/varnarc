CREATE TABLE "hr_salary_hikes" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "effective_on" DATE NOT NULL,
    "percentage" DECIMAL(6,2) NOT NULL,
    "previous_basic" DECIMAL(12,2) NOT NULL,
    "previous_hra" DECIMAL(12,2) NOT NULL,
    "previous_special_allowance" DECIMAL(12,2) NOT NULL,
    "previous_leave_travel_allowance" DECIMAL(12,2) NOT NULL,
    "previous_professional_tax" DECIMAL(12,2) NOT NULL,
    "basic" DECIMAL(12,2) NOT NULL,
    "hra" DECIMAL(12,2) NOT NULL,
    "special_allowance" DECIMAL(12,2) NOT NULL,
    "leave_travel_allowance" DECIMAL(12,2) NOT NULL,
    "professional_tax" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_salary_hikes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hr_salary_hikes_employee_id_idx" ON "hr_salary_hikes"("employee_id");

ALTER TABLE "hr_salary_hikes" ADD CONSTRAINT "hr_salary_hikes_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
