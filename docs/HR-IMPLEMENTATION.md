# HR management

Admin section under Human Resources. It covers the HRMS menu plus payroll and payslip generation.

## Screens

| Menu              | Path                    |
| ----------------- | ----------------------- |
| HRMS Dashboard    | `/hr`                   |
| HR Reports        | `/hr/reports`           |
| Notifications     | `/hr/notifications`     |
| Organization      | `/hr/organization`      |
| Exit Management   | `/hr/exits`             |
| Employees         | `/hr/employees`         |
| Leave             | `/hr/leave`             |
| Recruitment       | `/hr/recruitment`       |
| Job Openings      | `/hr/openings`          |
| Candidates        | `/hr/candidates`        |
| Interviews        | `/hr/interviews`        |
| Assets            | `/hr/assets`            |
| Asset Inventory   | `/hr/assets/inventory`  |
| Asset Masters     | `/hr/assets/masters`    |
| Asset Reports     | `/hr/assets/reports`    |
| Documents         | `/hr/documents`         |
| Browse Documents  | `/hr/documents/browse`  |
| Document Folders  | `/hr/documents/folders` |
| Document Types    | `/hr/documents/types`   |
| User Accounts     | `/hr/accounts`          |
| Login Sessions    | `/hr/sessions`          |
| ESS Requests      | `/hr/ess/requests`      |
| ESS Announcements | `/hr/ess/announcements` |
| My Profile        | `/hr/profile`           |
| Roles             | `/hr/roles`             |
| Assign Client     | `/hr/clients`           |
| Payroll           | `/hr/payroll`           |
| Payslips          | `/hr/payroll/payslips`  |

Departments remain at `/hr/departments` and are linked from Organization.

## Payroll

Save basic, HRA, allowances, and deductions per active employee. Generate a month as `YYYY-MM`. Net pay is basic + HRA + allowances − deductions. Each slip can be opened and printed.

## Permissions

`hr.view`, `hr.create`, `hr.edit`, `hr.delete`.

Accounts that already have `user.update` can use these routes before the permission catalog is reseeded.

## Data

Apply both HR migrations with `scripts/db-migrate-live.sh` against live Postgres.
