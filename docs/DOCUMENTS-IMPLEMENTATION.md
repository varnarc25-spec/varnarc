# Documents, forms, and templates

Public catalog and generators for letters, receipts, invoices, and guidance. Rendering is a shared schema in `@varnarc/validation`. The API writes PDF and DOCX. The admin app manages categories and templates.

## Routes

Public web:

- `/documents`
- `/documents/category/[slug]`
- `/documents/[slug]`
- `/documents/[slug]/create`
- `/documents/[slug]/preview` (same generator, not indexed)
- `/documents/search`
- `/documents/popular`
- `/documents/latest`

Signed-in visitors:

- `/account/documents`
- `/account/documents/[id]`

Admin:

- `/documents` dashboard
- `/documents/templates` and `/documents/templates/new` and `/documents/templates/[id]`
- `/documents/categories`

API prefix is the existing Nest `documents` controller. Admin calls go through `/api/admin/documents/*`. Public downloads go through `/api/documents/export`. Saved documents go through `/api/documents/save` and `/api/documents/saved/[id]`.

## Data

Migration: `packages/database/prisma/migrations/20261016030000_documents_module`.

Apply it on the live database:

```bash
scripts/db-migrate-live.sh
```

Then seed once. `seedDocuments` inserts missing categories and templates and skips rows that already exist, so a later run does not overwrite admin edits.

```bash
pnpm --filter @varnarc/database seed:documents
```

Set `DOCUMENT_ENCRYPTION_KEY` to 32 random bytes in base64 (`openssl rand -base64 32`) before anyone can save a document. Anonymous downloads are not stored.

## Seeded templates

38 published generators (personal letters, employer sample formats, receipts, invoices, quotations, and checklists) and 12 `REVIEW_REQUIRED` outlines.

Published examples include resume, cover letter, resignation letter, experience certificate, salary certificate, leave application, rent receipt, bank account closure, loan foreclosure request, standard invoice, quotation, purchase order, contractor quotation, and vehicle delivery receipt.

Review-required, and not published: rental agreement, GST invoice, affidavit draft, power of attorney sample, non-disclosure agreement, legal notice draft, income certificate guidance, PAN correction guidance, Aadhaar update guidance, passport application guidance, construction agreement, and vehicle sale agreement.

Official links are limited to Income Tax (`incometax.gov.in`), UIDAI (`uidai.gov.in`), Passport Seva (`passportindia.gov.in`), and Parivahan (`parivahan.gov.in`). Government pages are preparation notes. They do not reproduce certificates, seals, or identity numbers.

Many names from the original category list are groups, not separate templates: warning letters, termination letters, meeting minutes, and most state certificates. Add those only after the wording is reviewed.

## Security

- Form and template schemas are validated with Zod.
- Templates render structured blocks. User text is escaped. Unknown tokens are rejected before publish.
- Fields that ask for Aadhaar, PAN, passwords, OTPs, CVV, or account numbers cannot be published.
- Saved inputs and rendered blocks are AES-256-GCM ciphertext. Search analytics drop emails and long digit runs.
- Public export is rate limited (`documents: 20` per minute). The web export route checks that the request origin host matches the site host.
- Generated files send `X-Robots-Tag: noindex` and `Cache-Control: no-store`.
- Create, preview, search, and account pages are excluded from the sitemap. Published catalog and template URLs are included.
- Admin publish requires `document.publish`. Create and edit require the matching document permissions.

## Deploy

1. Set `DOCUMENT_ENCRYPTION_KEY` on the API service.
2. Run `scripts/db-migrate-live.sh`.
3. Run the database seed if this is the first deploy.
4. Build `@varnarc/validation`, `@varnarc/database`, and `@varnarc/api` so the API uses the new client and the Noto Sans file copied by Nest assets.

PDF embedding uses `apps/api/src/assets/fonts/NotoSans-Regular.ttf` when that file is present. Without it, PDF output uses Helvetica and writes rupees as `Rs.`. DOCX keeps the rupee sign.

## Known limits

- There is no CAPTCHA provider in the stack. Abuse control is the existing rate limiter.
- Premium templates are blocked with `PREMIUM_REQUIRED`. Every seed is free. There is no payment flow.
- Legal and government outlines do not invent stamp duty, fees, or extra clauses.
- State-specific doorway pages are not generated.
- Anonymous visitors can generate and download. Saving requires a signed-in account and the encryption key.
- Table layout in PDF is plain text rows, not a drawn grid.
