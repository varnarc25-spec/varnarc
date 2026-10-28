# Election statistical reports

Catalog of links from the Election Commission of India statistical reports page, stored for the admin portal.

## Data

- Source: `https://www.eci.gov.in/statistical-reports`
- Table: `election_statistical_reports`
- Seed catalog: `packages/validation/src/election-reports.ts`
- Load: `pnpm --filter @varnarc/database seed:election-reports`
- Three bye-election labels on the ECI page have no file (`Jan 2010`, `November 2010`, `Dec 2009`). Those rows are stored with a null URL.
- Each report page's file list is stored in `election_statistical_report_files`.
- `election_states` is the state table. A file title that names one state (for example `Gujarat-111-Umreth`) is linked to that state. Otherwise the page heading is used when it names one state.
- Load file rows: `pnpm --filter @varnarc/database scrape:election-report-files`

## API

- `GET /api/v1/election-reports` — paginated list with section, state, and search filters
- `GET /api/v1/election-reports/states` — states with report and file counts
- `GET /api/v1/election-reports/:id` — one report and its file list
- Permission: `election.view` (granted to super admin, admin, and editor)

## Admin

- `/elections/statistical-reports`
- `/elections/statistical-reports/[id]` — PDF and spreadsheet links from that page
- `/elections/states`
