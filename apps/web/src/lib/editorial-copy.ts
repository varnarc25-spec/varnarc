/** Unique on-page copy when CMS/seed text is a known template. */

export function isTemplatedReviewCopy(text?: string | null): boolean {
  const t = text?.trim() ?? '';
  if (!t) return true;
  return (
    /^Editorial roundup and buying advice/i.test(t) ||
    t.includes('our editorial team tested and compared popular options') ||
    t === 'Solid options exist across budgets — match features to your actual use case.'
  );
}

export function isTemplatedCalculatorGuide(text?: string | null): boolean {
  const t = text?.trim() ?? '';
  if (!t) return true;
  return (
    /^Learn how to use the /i.test(t) ||
    t.includes('Enter your values step by step') ||
    t.includes('Treat calculator output as a planning estimate')
  );
}

const REVIEW_COPY: Record<
  string,
  { summary: string; body: string; verdict: string; pros: string[]; cons: string[] }
> = {
  'car-tyres': {
    summary:
      'Pick tyres for Indian heat, monsoon grip, and potholes — not only the cheapest label on the sidewall.',
    body: `## What matters on Indian roads

Load index, speed rating, and a wet-braking compound matter more than tread pattern marketing. For city hatchbacks, a mid-range touring tyre usually lasts longer than a cheap no-name set that cups by 20,000 km.

## How we compared

We looked at wet grip claims, warranty (years vs km), and typical fitted prices in metros. Always match the size on the car’s door sticker; upsizing without checking speedo/load is a common mistake.

## Buying tip

Replace in pairs on the same axle. Ask the dealer to record the DOT week code so you are not sold old stock.`,
    verdict:
      'Buy a reputable touring tyre in the correct size; skip ultra-cheap unknown brands for monsoon use.',
    pros: ['Clear size/load guidance', 'Metro fitting widely available'],
    cons: ['Premium compounds cost more', 'Old warehouse stock still common'],
  },
  'home-loan-banks': {
    summary:
      'Compare processing fee, prepayment rules, and floating-rate reset — not only the advertised starting ROI.',
    body: `## What to compare

Home loan “best bank” lists hide FOIR, CIBIL floors, and balance-transfer lock-ins. Ask for a written rate with your profile (salaried vs self-employed) and the current repo-linked spread.

## Documents and timeline

Salaried files move faster with Form 16 and six-month statements. Self-employed files need ITR consistency. Sanction ≠ disbursement; property legal and technical still sit in the middle.

## Prepayment

Confirm whether floating-rate loans allow part-prepayment without penalty (RBI rules apply to most floating home loans).`,
    verdict:
      'Shortlist two lenders on fee + prepayment + service, then pick the written quote — not the banner rate.',
    pros: ['Fee and prepayment called out', 'Salaried vs self-employed split'],
    cons: ['Rates move with the repo', 'Branch service varies widely'],
  },
  'kitchen-chimneys': {
    summary:
      'Size suction (m³/h) to your hob width and Indian tadka smoke — auto-clean models trade noise for easier maintenance.',
    body: `## Suction and size

A 90 cm hob needs more m³/h than a 60 cm two-burner. Filterless auto-clean units help if you cook daily with oil; baffle filters need washing.

## Installation

Ducted to the outside beats recirculating for Indian kitchens. Measure wall depth and chimney height before you buy a glass canopy that will not fit under the slab.`,
    verdict: 'Match chimney width to the hob and prefer ducted exhaust if the wall allows it.',
    pros: ['Sizing guidance for Indian cooking', 'Maintenance called out'],
    cons: ['Ducting cost extra', 'Noise ratings are often optimistic'],
  },
  'robot-vacuums': {
    summary:
      'LIDAR mapping and mopping help Indian apartments with mixed tile and rugs; threshold climb and dustbin size matter more than app gimmicks.',
    body: `## Floors and hair

Indian homes mix tile, marble, and short rugs. Look at obstacle height, tangle-resistant brushes, and a dustbin you can empty without a dock if you skip auto-empty.

## Wi-Fi and maps

2.4 GHz Wi-Fi is still the safe bet. Multi-floor maps help duplexes; they fail if you carry the robot between floors without saving maps.`,
    verdict: 'Buy mapping + decent suction; skip no-name bots that die on 15 mm thresholds.',
    pros: ['Threshold and dustbin called out', 'Wi-Fi 2.4 GHz note'],
    cons: ['Auto-empty docks are expensive', 'Pet hair still clogs cheap brushes'],
  },
  'dash-cams': {
    summary:
      'Front + cabin or front + rear, parking mode, and a capacitor (not only a battery) for Indian heat.',
    body: `## What to buy

A 1080p+ front camera with a wide FOV and a reliable parking mode matters more than 4K marketing. Capacitor-based units survive dashboard heat better than lithium packs.

## Install and evidence

Hardwire parking mode through a kit; cigarette-socket cams die when the engine is off. Keep a formatted high-endurance microSD and know how to export a clip for insurance.`,
    verdict: 'Front+rear with parking mode and a capacitor camera is the practical India setup.',
    pros: ['Heat and parking mode called out', 'Evidence/export reminder'],
    cons: ['Hardwire install is extra', 'Cheap cards fail in heat'],
  },
  'solar-panels-home': {
    summary:
      'Rooftop kW is limited by shadow-free area and DISCOM net-metering — panel brand is secondary to structure and inverter pairing.',
    body: `## Sizing

Estimate units from your bill, then rooftop area (about 100 sq ft per kW as a rough check). South-facing unshaded roof wins; water tanks and parapets steal yield.

## Policy

Net metering, subsidy paperwork, and structure warranty (wind load) decide bankability more than a 0.2% efficiency difference on the datasheet.`,
    verdict: 'Size to unshaded roof and a listed installer; do not chase peak-watt marketing.',
    pros: ['Area and DISCOM called out', 'Structure/wind note'],
    cons: ['Subsidy timelines slip', 'Shading kills yield'],
  },
  'solar-inverters': {
    summary:
      'On-grid inverters must match string voltage, DISCOM rules, and anti-islanding — hybrid units add batteries at a real cost.',
    body: `## On-grid vs hybrid

On-grid is the default for net-metered homes. Hybrid/off-grid only if you need backup hours and can place batteries safely.

## Specs to match

MPPT range, phase (single vs three), and service network in your city. An orphan inverter brand is a five-year problem.`,
    verdict: 'Match inverter type to net-metering; buy a brand with local service.',
    pros: ['On-grid vs hybrid split', 'Service network called out'],
    cons: ['Hybrid + battery is expensive', 'Phase mismatch is a common install error'],
  },
};

function genericReview(title: string): (typeof REVIEW_COPY)[string] {
  return {
    summary: `${title}: compare specifications, warranty, and service in India — not a canned roundup.`,
    body: `## How to use this page

${title} is a buying shortlist for Indian conditions: heat, service network, and typical metro pricing. Scores are editorial, not lab tests of every SKU.

## What to verify before you pay

Warranty in writing, spare-part availability, and return policy. Advertised “from” prices often exclude installation or compulsory add-ons.`,
    verdict: `Use ${title} to shortlist, then confirm a written quote and warranty.`,
    pros: ['India-focused checklist', 'Warranty reminder'],
    cons: ['Not a lab test of every model', 'Prices move by city'],
  };
}

export function reviewEditorialCopy(slug: string, title: string) {
  return REVIEW_COPY[slug] ?? genericReview(title);
}

const GUIDE_COPY: Record<string, { excerpt: string; content: string }> = {
  'guide-loan-against-property-emi': {
    excerpt:
      'LAP EMI depends on property value, LTV cap, and tenure — not the same knobs as an unsecured personal loan.',
    content: `## Loan against property EMI

Enter sanctioned amount (or expected LTV × value), the quoted floating rate, and tenure in years. Lenders cap LTV by property type (residential vs commercial).

## What the result is not

It is not a sanction. Legal, technical, and FOIR still apply. Prepayment and conversion fees sit outside EMI.

## Next step

Use the [LAP hub](/finance/loans/loan-against-property) to compare LTV notes, then confirm the rate in a sanction letter.`,
  },
  'guide-gold-loan-emi': {
    excerpt:
      'Gold loan EMI (or bullet interest) tracks jewellery valuation, purity, and the lender’s LTV — not jewellery shop “making charges”.',
    content: `## Gold loan numbers

Input net gold grams (after purity), the lender’s per-gram rate, and whether you pay EMI or interest-only with principal at close.

## Valuation

Hallmark and ornament type change disbursement. Auction risk if you miss the due date — that is the product, not a calculator bug.

## Next step

Open the [gold loan hub](/finance/loans/gold-loan) and the gold EMI calculator with your gram weight.`,
  },
  'guide-credit-card-emi': {
    excerpt:
      'Card EMI adds converting interest and GST on interest — the “no-cost EMI” sticker is rarely the full cash price.',
    content: `## Card EMI vs loan EMI

Principal is the converted transaction. Rate is the converting interest (or subvention). Tenure is in months. GST on interest can apply.

## No-cost EMI

The discount is often loaded into the product price. Compare cash price vs EMI total before you convert.

## Next step

Use the credit-card EMI calculator, then read the converting terms on the issuer app.`,
  },
  'guide-business-loan-emi': {
    excerpt:
      'Business loan EMI is cash-flow math: GST turnover, FOIR-like bank tests, and processing fee still sit outside the schedule.',
    content: `## Inputs

Amount, rate, tenure. For working-capital style loans, tenure is shorter than a home loan. Balloon or overdraft products will not match this EMI engine.

## What banks still check

Banking credits, GST, and existing EMI. The calculator does not underwrite.

## Next step

[Business loan hub](/finance/loans/business-loan) plus a written quote.`,
  },
  'guide-home-loan-emi': {
    excerpt:
      'Home loan EMI is amount × rate × tenure; LTV and FOIR decide whether that EMI is even allowed.',
    content: `## The three knobs

Loan amount (after down payment), floating rate, tenure up to the bank’s max (often 20–30 years). Extra years cut EMI but raise total interest.

## Affordability

A 40% FOIR rule-of-thumb is a planning cap, not a promise. Use the eligibility calculator with your net income.

## Next step

[Home loan hub](/finance/loans/home-loan) and home-loan EMI tool.`,
  },
  'guide-car-loan': {
    excerpt:
      'Car loan EMI follows on-road price minus down payment; used cars add LTV haircuts and shorter tenure.',
    content: `## New vs used

New-car LTV is higher. Used-car tenure and LTV shrink with age. Insurance and RTO are in on-road price, not always in the loan.

## Rate vs dealer subvention

A “low EMI” scheme may hide a higher on-road price. Compare cash vs financed total.

## Next step

[Car loan hub](/finance/loans/car-loan) and the car EMI / on-road tools.`,
  },
  'guide-bike-loan-emi': {
    excerpt:
      'Two-wheeler EMI is small-ticket: processing fee as a % bites harder than on a home loan.',
    content: `## Inputs

On-road price, down payment, rate, tenure (often 12–48 months). Dealer hypothecation and insurance add-ons change the cash outlay.

## Next step

[Two-wheeler loan hub](/finance/loans/two-wheeler-loan) and bike EMI calculator.`,
  },
  'guide-debt-planner': {
    excerpt:
      'The debt planner stacks EMIs against income so you see FOIR pressure — it does not negotiate with collectors.',
    content: `## How to use it

List each EMI (home, car, cards). Compare total EMI to take-home pay. High FOIR is why new loans get declined.

## Next step

Use [loan eligibility](/calculators/loan-eligibility) and [prepayment](/calculators/loan-prepayment) after you see the stack.`,
  },
  'guide-construction-cost': {
    excerpt:
      'Construction cost is built-up area × rate band for your city and spec — not a contractor quote.',
    content: `## What to enter

Carpet vs built-up, city, and finish (basic vs premium). Cement, steel, and labour swing the band.

## Next step

Open the [construction cost calculator](/construction/cost-calculator) and city landings if you have a plot.`,
  },
  'guide-solar': {
    excerpt:
      'Solar sizing starts from monthly units and unshaded roof area; the calculator is not a DISCOM approval.',
    content: `## Inputs

Bill units, tariff, roof m². Net metering rules are state-specific.

## Next step

[Solar hub](/solar) and rooftop sizing tools.`,
  },
  'guide-steel': {
    excerpt:
      'Steel quantity follows structural drawings (bars, stirrups, wastage) — a slab thumb-rule is only a start.',
    content: `## BBS vs thumb rule

Use the [steel calculator](/construction/steel-calculator) and [BBS](/construction/bar-bending-schedule) when you have diameters and lengths.

## Next step

Confirm with the structural drawing, not a blog kg/sqft number alone.`,
  },
  'guide-sand': {
    excerpt:
      'Sand volume follows mix ratio (PCC/RCC/plaster) and dry-volume factor — moisture and bulking change site delivery.',
    content: `## Mix and wastage

Cement:sand:aggregate ratios differ for PCC vs plaster. Add wastage. Pit sand vs river sand is a local call.

## Next step

[Sand calculator](/construction/sand-calculator) and the sand topic page.`,
  },
  'guide-toll-cost': {
    excerpt:
      'Toll cost is route + vehicle class + return trip — FASTag balance is separate from the estimate.',
    content: `## How to estimate

Pick highway segments and vehicle class. Peak-hour or return discounts may apply on some plazas.

## Next step

Treat the figure as a trip budget, then check live FASTag / plaza rates.`,
  },
  'guide-tds': {
    excerpt:
      'TDS calculators apply the section rate to the payment — PAN status and thresholds still decide whether TDS is due.',
    content: `## What to check

Section (194C, 194J, etc.), threshold, and whether the deductee provided PAN. The tool does not file your return.

## Next step

Confirm with the current Income-tax TDS chart and your CA.`,
  },
};

export function calculatorGuideCopy(
  slug: string,
  title: string,
): { excerpt: string; content: string } {
  if (GUIDE_COPY[slug]) return GUIDE_COPY[slug];
  return {
    excerpt: `${title}: the inputs that change the result, and what you still confirm with a lender, contractor, or advisor in India.`,
    content: `## ${title}

This page explains the calculator inputs, typical Indian gotchas (fees, GST, wastage, tenure caps), and why the number on screen is a plan — not a contract.

## Using the tool

Change one variable at a time (rate, tenure, or quantity) so you see which knob moves EMI or material cost the most.

## Bottom line

Save the result, then verify with an official quote, drawing, or sanction letter.`,
  };
}

const AI_CATEGORY: Record<string, { title: string; description: string; intro: string }> = {
  'customer-support': {
    title: 'Customer support AI tools',
    description:
      'Helpdesk bots, ticket classifiers, and live-chat copilots — compare pricing, languages, and CRM integrations.',
    intro:
      'Support tools are useful when they sit on your existing tickets (Zendesk, Freshdesk, email). Check Indian language coverage, data residency, and whether the bot can hand off to a human without looping.',
  },
  'code-generation': {
    title: 'Code generation AI tools',
    description:
      'IDE copilots and repo-aware assistants — compare context length, languages, and on-prem vs cloud.',
    intro:
      'Code tools differ on repo indexing, self-hosting, and whether output is allowed in your licence policy. Trial on a private repo before you buy seats.',
  },
  tutoring: {
    title: 'Tutoring and learning AI tools',
    description:
      'Study copilots and exam practice tools — check syllabus fit, citations, and what they will not invent.',
    intro:
      'For Indian exams, prefer tools that cite a source or let you paste the syllabus. They are practice partners, not guaranteed rank boosters.',
  },
  productivity: {
    title: 'Productivity AI tools',
    description:
      'Writing, meeting notes, and task copilots — compare workspace integrations and admin controls.',
    intro:
      'Productivity suites win on Google/Microsoft/Slack fit and admin audit logs. A flashy chat UI without export is a trap.',
  },
  automation: {
    title: 'Automation AI tools',
    description:
      'Workflow and agent tools that connect apps — compare triggers, approvals, and failure handling.',
    intro:
      'Automation is only safe with human approval on payments and emails. Check run logs and what happens when an API fails.',
  },
  compare: {
    title: 'Compare AI tools side by side',
    description:
      'Pick two or more tools and compare pricing model, features, and integrations on one table.',
    intro:
      'Add slugs to compare. Scores and “best” labels are not substitutes for a security review or a paid trial on your data.',
  },
  search: {
    title: 'Search the AI tools directory',
    description:
      'Filter Varnarc’s AI directory by category, pricing model, free plan, and API availability.',
    intro:
      'Use filters to cut marketing pages. Free plan ≠ production-ready; read rate limits and data-use terms.',
  },
  trending: {
    title: 'Trending AI tools on Varnarc',
    description:
      'Tools ranked by recent views and engagement on Varnarc — popularity, not an editorial award.',
    intro:
      'Trending reflects what people click here, not what is safest or cheapest. Cross-check pricing and privacy before you deploy.',
  },
  utilities: {
    title: 'Free AI utilities on Varnarc',
    description:
      'Deterministic helpers for prompts, SEO drafts, JSON, and markdown — they run in your browser session.',
    intro:
      'These utilities do not replace a full product. Do not paste secrets or customer PII into prompt boxes.',
  },
};

export function aiCategoryCopy(slug: string, name: string) {
  if (AI_CATEGORY[slug]) return AI_CATEGORY[slug];
  return {
    title: `${name} AI tools`,
    description: `${name} tools on Varnarc: what they are for, how pricing is listed, and what to verify before you subscribe.`,
    intro: `This ${name.toLowerCase()} list is a directory, not a lab ranking. Open a tool page for pricing model, API notes, and company details. Prefer a trial on non-sensitive data.`,
  };
}

const WEAK_INDIA_BRANDS = new Set([
  'zenvo',
  'genesis',
  'ferrari',
  'lamborghini',
  'bugatti',
  'pagani',
]);

export function isWeakIndiaAutomobile(input: {
  slug: string;
  name?: string | null;
  manufacturerSlug?: string | null;
  manufacturerName?: string | null;
  country?: string | null;
}): boolean {
  const hay =
    `${input.slug} ${input.name ?? ''} ${input.manufacturerSlug ?? ''} ${input.manufacturerName ?? ''}`.toLowerCase();
  if ([...WEAK_INDIA_BRANDS].some((b) => hay.includes(b))) return true;
  const country = input.country?.trim().toLowerCase();
  if (country && country !== 'india' && country !== 'in') return true;
  return false;
}
