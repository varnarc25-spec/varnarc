# Changelog

## Unreleased

### Added

- Admin laptop rental proposals for clients, with calculated GST and deposit totals and a downloadable PDF.
- Laptop rental operations: agreement, tagged laptops, deposit, monthly invoices, support cases, and damage or loss charges.
- CRM module for companies, contacts, activity, proposals, and rentals. Laptop proposals moved out of Human Resources.
- Each rented laptop can store its own brand, model, processor, memory, storage, display, and operating system.
- CRM laptop inventory. Proposals select laptops from that list.
- Laptop inventory stores monthly rate, commitment rate, GST, and security deposit, and copies them onto a proposal when the laptop is selected.
- Laptop catalog matches the rental product list: category, year, generation, one-month and 12-month rates, and detailed specifications.
- Proposal pricing is the sum of the selected laptops and their quantities. CRM → Discounts stores the term discounts, and a proposal shows the matching percent so it can be changed.
- The laptop list shows the 3-, 6-, 9-, and 12-month prices, calculated from the one-month rate and those discounts.

## 0.1.0 — 2026-07-16

### Added

- Turborepo + pnpm monorepo scaffold
- Apps: `@varnarc/web`, `@varnarc/admin`, `@varnarc/api`
- Packages: ui, auth, database, types, validation, hooks, utils, config
- Prisma Phase 1 schema + Auth0 RBAC models (users, roles, permissions, login_history, audit_logs)
- NestJS Auth0 JWT guards, `/api/v1/auth/*` endpoints, RBAC decorators
- Next.js Auth0 client + middleware structure for web and admin
- Docker and GitHub Actions skeletons
- Architecture docs and `AI_RULES.md`
