# CRM

Customer companies, contacts, activity, laptop rental proposals, and live rentals. Human Resources → Assign Client stays the employee-staffing list and is separate from these companies.

## Screens

| Menu      | Path                  |
| --------- | --------------------- |
| Dashboard | `/crm`                |
| Companies | `/crm/companies`      |
| Company   | `/crm/companies/[id]` |
| Contacts  | `/crm/contacts`       |
| Laptops   | `/crm/laptops`        |
| Discounts | `/crm/discounts`      |
| Proposals | `/crm/proposals`      |
| Rentals   | `/crm/rentals`        |

Older `/hr/proposals` addresses redirect to the CRM proposal pages.

## Companies and contacts

A company has a name, email, phone, address, city, GSTIN, website, and notes. Contacts belong to one company. Marking a contact primary clears that flag on the company's other contacts. Activity is a note, call, meeting, or email, and can point at one of that company's proposals.

Deleting a company is blocked while it still has proposals. Deleting a contact hides it from the lists.

## Laptops

CRM → Laptops is the rental catalog. The list can be searched, filtered by brand, processor, memory, year, category, and stock, sorted, paged, and exported as CSV. Export PDF sends the filtered models to the client in the laptop proposal layout, using the proposal wording, term prices, and the company profile. It opens with the newest model year first. Every model has a launch year. A blank year was filled from the product's launch year, and the Latitude 5450 that had been stored as 2023 is 2024. Models from 2020 and earlier are not kept in the catalog. 2024, 2025, and 2026 Dell models are priced from published Bangalore monthly rents, before GST. The Bangalore Rentlap models are in the same list, and they use those same one-month rates and deposits. Rentlap's own advertised rents are not stored. Beside the one-month rate, the list shows the 3-, 6-, 9-, and 12-month monthly prices, calculated from the discounts in CRM → Discounts. Each laptop is a model: Windows or Apple, brand, year, generation, processor, memory, storage, screen, graphics, and operating system. Pricing is the one-month rate, GST, and the security deposit. The 3-, 6-, 9-, and 12-month prices are calculated from that rate. A row can also carry an asset tag and serial number when it is one physical laptop.

On a new or edited proposal, each selected laptop has its own quantity. The rental and the security deposit are the sum of those laptops. CRM → Discounts stores the term discounts (3 months 5%, 6 months 10%, 9 months 15%, 12 months 20% by default). The proposal uses the highest saved percent whose months are at or below the commitment length, shows that percent, and lets it be changed for that proposal. The deposit is not discounted.

## Proposals and rentals

CRM → Proposals is the laptop rental offer. A new proposal can use an existing company or a new company name. A new name is saved as a CRM company. The printed customer name can differ from the company record. Issuer details and the logo come from Settings → Company profile.

The printed rental pricing table lists the monthly price and the 3-, 6-, 9-, and 12-month prices, each calculated from the one-month rate and the term discount. The proposal pipeline is Draft, Sent, Accepted, and Declined. Accept a proposal, then open Rental service to start the agreement, tag laptops, record the deposit, raise invoices, handle support, and close the rental. Each laptop has its own details: asset tag, serial number, brand, model, processor, memory, storage, display, and operating system. The form starts from the specification on the proposal. CRM → Rentals lists every agreement.

## Permissions

`crm.view`, `crm.create`, `crm.edit`, `crm.delete`.

Accounts that already have `user.update`, or the matching `hr.view` / `hr.create` / `hr.edit` / `hr.delete` permission, can use these routes before the permission catalog is reseeded.

## Data

Apply `packages/database/prisma/migrations/20261005170000_crm_laptop_pricing` with `scripts/db-migrate-live.sh`. That migration adds the catalog fields and the current rental models. `20261005200000_rental_discount_tiers` stores the term discounts. Laptop inventory is separate from HR. A proposal stores which catalog laptops it includes.
