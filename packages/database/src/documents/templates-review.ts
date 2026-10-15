import type { DocumentBlock, DocumentField } from '@varnarc/validation';
import {
  GUIDANCE_DISCLAIMER,
  LEGAL_DISCLAIMER,
  field,
  simpleLetter,
  type SeedTemplate,
} from './define';

function faq(question: string, answer: string) {
  return { question, answer };
}

const outlineNote =
  'The lines below repeat only what was typed into the form. They do not add duties, penalties, or jurisdiction rules.';

function outline(
  title: string,
  rows: Array<[string, string]>,
  signers: Array<{ label: string; nameField: string }>,
): DocumentBlock[] {
  return [
    { type: 'heading', level: 1, text: title },
    { type: 'paragraph', text: outlineNote },
    {
      type: 'table',
      headers: ['Item', 'As entered'],
      rows,
    },
    { type: 'paragraph', text: '{{otherTerms}}' },
    ...signers.map((signer) => ({
      type: 'signature' as const,
      label: signer.label,
      nameField: signer.nameField,
    })),
  ];
}

const partyFields = (left: string, right: string): DocumentField[] => [
  field('letterDate', 'Date', 'date'),
  field('city', 'City', 'text'),
  field('partyOne', left, 'text'),
  field('partyTwo', right, 'text'),
  field('otherTerms', 'Terms the parties write themselves', 'textarea', {
    required: false,
    helpText: 'Leave blank if a lawyer will draft the operative terms.',
  }),
];

export const reviewTemplates: SeedTemplate[] = [
  simpleLetter({
    slug: 'rental-agreement',
    name: 'Rental agreement outline',
    categorySlug: 'rent-records',
    keyword: 'rental agreement format',
    secondary: ['rent agreement sample'],
    summary:
      'Collect the commercial points of a residential rental so a lawyer can draft the actual agreement.',
    about:
      'This outline records the city, parties, property, rent, deposit, dates, and notice period you type. It is not a state-specific registered agreement.',
    when: 'Use it to prepare for a conversation with a lawyer or the other party. Do not treat the download as a registrable deed.',
    info: ['State and city', 'Landlord and tenant', 'Rent, deposit, start date, duration, notice'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'AGREEMENT',
    disclaimer: LEGAL_DISCLAIMER,
    fields: [
      field('stateName', 'State', 'text'),
      field('city', 'City', 'text'),
      field('landlordName', 'Landlord name', 'text'),
      field('tenantName', 'Tenant name', 'text'),
      field('propertyAddress', 'Property address', 'address'),
      field('monthlyRent', 'Monthly rent', 'currency'),
      field('securityDeposit', 'Security deposit', 'currency'),
      field('startDate', 'Start date', 'date'),
      field('duration', 'Duration', 'text', { placeholder: '11 months' }),
      field('noticePeriod', 'Notice period', 'text'),
      field('maintenance', 'Maintenance', 'select', {
        options: [
          { value: 'Landlord', label: 'Landlord' },
          { value: 'Tenant', label: 'Tenant' },
          { value: 'Shared as written below', label: 'Shared as written below' },
        ],
      }),
      field('otherTerms', 'Other terms the parties write', 'textarea', { required: false }),
    ],
    blocks: outline(
      'Residential rental outline',
      [
        ['State', '{{stateName}}'],
        ['City', '{{city}}'],
        ['Landlord', '{{landlordName}}'],
        ['Tenant', '{{tenantName}}'],
        ['Property', '{{propertyAddress}}'],
        ['Monthly rent', '{{monthlyRent}}'],
        ['Security deposit', '{{securityDeposit}}'],
        ['Start date', '{{startDate}}'],
        ['Duration', '{{duration}}'],
        ['Notice period', '{{noticePeriod}}'],
        ['Maintenance', '{{maintenance}}'],
      ],
      [
        { label: 'Landlord', nameField: 'landlordName' },
        { label: 'Tenant', nameField: 'tenantName' },
      ],
    ),
    paragraphs: [],
    considerations: [
      'Stamp duty and registration differ by state. This page does not state a fee or a registration rule.',
      'Do not add lock-in penalties unless a lawyer has written them for your facts.',
    ],
    sample:
      'A two-column list of the commercial points, a blank for terms the parties write, and two signature lines.',
    faqs: [
      faq(
        'Is this valid in every Indian state?',
        'No. The outline is not a state form. Registration and stamp requirements have to be checked locally.',
      ),
      faq(
        'Why is it not on the public generator yet?',
        'It stays in review until someone verifies the wording. Admins can preview it.',
      ),
    ],
    related: ['rent-receipt', 'security-deposit-receipt'],
  }),
  simpleLetter({
    slug: 'gst-invoice',
    name: 'GST invoice outline',
    categorySlug: 'billing-documents',
    keyword: 'gst invoice format',
    secondary: ['gst bill format'],
    summary:
      'Lay out a tax invoice with GSTIN and line items you enter. Tax treatment still needs a professional check.',
    about:
      'This outline places seller, buyer, GSTIN, and line items on one page. It does not decide the correct GST rate or whether you must issue a tax invoice.',
    when: 'Use the draft only after your accountant confirms that a tax invoice is appropriate.',
    info: ['Seller GSTIN', 'Buyer name', 'Line items', 'Tax amount you calculated elsewhere'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'INVOICE',
    disclaimer:
      'Confirm GST registration, HSN, place of supply, and tax rate with a tax professional. This outline does not file a return.',
    fields: [
      field('invoiceNo', 'Invoice number', 'text'),
      field('invoiceDate', 'Invoice date', 'date'),
      field('sellerName', 'Seller', 'text'),
      field('sellerGstin', 'Seller GSTIN', 'text'),
      field('buyerName', 'Buyer', 'text'),
      field('items', 'Items', 'repeat', {
        maxItems: 20,
        itemFields: [
          field('description', 'Description', 'text'),
          field('quantity', 'Quantity', 'number'),
          field('rate', 'Rate', 'currency'),
        ],
      }),
      field('taxAmount', 'Tax amount', 'currency'),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'GST invoice outline' },
      { type: 'paragraph', text: 'No. {{invoiceNo}} · {{invoiceDate}}' },
      { type: 'paragraph', text: 'Seller: {{sellerName}}' },
      { type: 'paragraph', text: 'GSTIN: {{sellerGstin}}' },
      { type: 'paragraph', text: 'Buyer: {{buyerName}}' },
      {
        type: 'lineItems',
        field: 'items',
        columns: [
          { header: 'Description', key: 'description' },
          { header: 'Qty', key: 'quantity' },
          { header: 'Rate', key: 'rate', format: 'currency' },
          { header: 'Amount', product: ['quantity', 'rate'], format: 'currency' },
        ],
      },
      { type: 'paragraph', text: 'Tax amount entered: {{taxAmount}}' },
      {
        type: 'paragraph',
        text: 'HSN, place of supply, and the split of tax are not invented here.',
      },
    ],
    paragraphs: [],
    considerations: [
      'Do not copy this layout onto a government portal. File returns in the GST system.',
    ],
    sample: 'Invoice number, seller GSTIN, buyer, item table, and one tax amount.',
    faqs: [
      faq(
        'Does this choose 5, 12, or 18 percent?',
        'No. You type the tax amount after you know the correct treatment.',
      ),
      faq(
        'Is the published standard invoice a GST invoice?',
        'No. The standard invoice does not ask for a GSTIN.',
      ),
    ],
    related: ['standard-invoice', 'quotation'],
  }),
  simpleLetter({
    slug: 'affidavit-draft',
    name: 'Affidavit outline',
    categorySlug: 'legal-drafts',
    keyword: 'affidavit draft',
    secondary: ['self declaration format'],
    summary:
      'Write the statement you intend to swear, for a notary or lawyer to put into the proper form.',
    about:
      'An affidavit is a sworn statement. This page only captures the statement you type so a notary or lawyer can format it. Varnarc does not notarise it.',
    when: 'Use it before you visit a notary, not as the paper you file.',
    info: ['Your name', 'The statement in your own words'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'AGREEMENT',
    disclaimer: LEGAL_DISCLAIMER,
    fields: [
      field('deponentName', 'Your name', 'text'),
      field('city', 'City', 'text'),
      field('statement', 'Statement you will swear', 'textarea'),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Affidavit outline' },
      { type: 'paragraph', text: 'Deponent: {{deponentName}}' },
      { type: 'paragraph', text: 'City: {{city}}' },
      { type: 'paragraph', text: '{{statement}}' },
      {
        type: 'paragraph',
        text: 'This download is not notarised, stamped, or witnessed. A notary or other authorised person must complete any formal affidavit.',
      },
      { type: 'signature', label: 'Deponent', nameField: 'deponentName' },
    ],
    paragraphs: [],
    considerations: [
      'Do not copy a court heading or a seal. Those come from the authority that administers the oath.',
    ],
    sample: 'Name, city, the statement you wrote, and a note that notarisation is still required.',
    faqs: [
      faq(
        'Will this be accepted in court?',
        'Not as a finished affidavit. The court or notary process still has to be followed.',
      ),
      faq('Can I invent facts to fill the box?', 'No. Write only what you can truthfully state.'),
    ],
    related: ['authorization-letter', 'formal-request-letter'],
  }),
  simpleLetter({
    slug: 'power-of-attorney-sample',
    name: 'Power of attorney outline',
    categorySlug: 'legal-drafts',
    keyword: 'power of attorney format',
    secondary: ['poa sample india'],
    summary:
      'List who would appoint whom, and for which task, before a lawyer drafts a power of attorney.',
    about:
      'A power of attorney is a formal authority. This outline names the people and the task. It does not grant that authority.',
    when: 'Use it to brief a lawyer. Execution, stamping, and registration are outside this page.',
    info: ['Principal', 'Agent', 'The task', 'City'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'AGREEMENT',
    disclaimer: LEGAL_DISCLAIMER,
    fields: partyFields('Principal', 'Person who would be appointed'),
    blocks: outline(
      'Power of attorney outline',
      [
        ['Date', '{{letterDate}}'],
        ['City', '{{city}}'],
        ['Principal', '{{partyOne}}'],
        ['Proposed agent', '{{partyTwo}}'],
      ],
      [{ label: 'Principal', nameField: 'partyOne' }],
    ),
    paragraphs: [],
    considerations: [
      'Many powers of attorney must be stamped and registered. This sample does not say which ones, because that depends on the act and the state.',
    ],
    sample:
      'Principal, proposed agent, date, city, and a box for the task a lawyer will convert into operative language.',
    faqs: [
      faq('Can someone act on this download?', 'No. It is not an executed power of attorney.'),
      faq(
        'Is a simple authorization letter enough instead?',
        'Sometimes an office accepts a one-task authorization letter. Ask that office. It is a different published template.',
      ),
    ],
    related: ['authorization-letter', 'formal-request-letter'],
  }),
  simpleLetter({
    slug: 'non-disclosure-agreement',
    name: 'Non-disclosure outline',
    categorySlug: 'legal-drafts',
    keyword: 'non disclosure agreement format',
    secondary: ['nda sample'],
    summary: 'Record who would share information and the purpose, before counsel writes an NDA.',
    about:
      'This outline names the parties and the purpose of a discussion. It does not define confidential information or penalties.',
    when: 'Use it as a briefing note. Sign an NDA only after a lawyer has written one for the deal.',
    info: ['Both party names', 'Purpose of the discussion'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'AGREEMENT',
    disclaimer: LEGAL_DISCLAIMER,
    fields: [
      ...partyFields('First party', 'Second party'),
      field('purpose', 'Purpose of the discussion', 'textarea'),
    ],
    blocks: outline(
      'Non-disclosure outline',
      [
        ['Date', '{{letterDate}}'],
        ['City', '{{city}}'],
        ['First party', '{{partyOne}}'],
        ['Second party', '{{partyTwo}}'],
        ['Purpose', '{{purpose}}'],
      ],
      [
        { label: 'First party', nameField: 'partyOne' },
        { label: 'Second party', nameField: 'partyTwo' },
      ],
    ),
    paragraphs: [],
    considerations: [
      'Do not assume a two-year term or a penalty. Those are legal choices this template refuses to invent.',
    ],
    sample: 'Two names, a purpose, and space for terms counsel will add.',
    faqs: [
      faq(
        'Is a mutual NDA included?',
        'The outline does not choose mutual or one-way. Counsel should decide that.',
      ),
      faq(
        'Can I download it while it is in review?',
        'The public site shows it only after publication. Admins can preview the draft.',
      ),
    ],
    related: ['quotation', 'formal-request-letter'],
  }),
  simpleLetter({
    slug: 'legal-notice-draft',
    name: 'Legal notice outline',
    categorySlug: 'legal-drafts',
    keyword: 'legal notice draft',
    secondary: ['legal notice format'],
    summary: 'Organise the facts and the demand you want a lawyer to consider for a notice.',
    about:
      'A legal notice is an advocate’s formal communication. This page stores the facts and the ask so you can brief a lawyer. It is not itself a notice.',
    when: 'Use it before you instruct an advocate. Do not send the download as if it were advocate letterhead.',
    info: ['Your name', 'The other party', 'Facts', 'What you want'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'LETTER',
    disclaimer: LEGAL_DISCLAIMER,
    fields: [
      field('senderName', 'Your name', 'text'),
      field('otherParty', 'Other party', 'text'),
      field('facts', 'Facts', 'textarea'),
      field('demand', 'What you want', 'textarea'),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Notes for a lawyer — not a legal notice' },
      { type: 'paragraph', text: 'From: {{senderName}}' },
      { type: 'paragraph', text: 'Other party: {{otherParty}}' },
      { type: 'paragraph', text: 'Facts: {{facts}}' },
      { type: 'paragraph', text: 'Ask: {{demand}}' },
      {
        type: 'paragraph',
        text: 'Do not put this document on advocate letterhead. An advocate must decide whether a notice should be sent and what it should say.',
      },
    ],
    paragraphs: [],
    considerations: [
      'Sending a homemade “legal notice” can hurt your position. Use this only as a briefing note.',
    ],
    sample: 'Two names, a facts box, an ask, and a warning that it is not a notice.',
    faqs: [
      faq('Will Varnarc send this to the other party?', 'No. Nothing is served from this website.'),
      faq(
        'Can I add a deadline of 15 days?',
        'Only if your lawyer tells you to put a deadline in the facts or ask. The template does not insert one.',
      ),
    ],
    related: ['complaint-letter', 'formal-request-letter'],
  }),
  simpleLetter({
    slug: 'income-certificate-guidance',
    name: 'Income certificate guidance',
    categorySlug: 'certificate-guidance',
    keyword: 'income certificate application',
    secondary: ['income certificate documents'],
    summary:
      'See how to prepare for an income certificate application without creating a fake certificate.',
    about:
      'An income certificate is issued by a government authority. This page lists questions to ask that authority. It does not produce a certificate.',
    when: 'Read it before you visit your state revenue office or citizen portal.',
    info: [
      'Your state, so you remember which government to ask',
      'A note of questions you still have',
    ],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'GUIDANCE',
    disclaimer: GUIDANCE_DISCLAIMER,
    fields: [
      field('applicantName', 'Your name', 'text'),
      field('stateName', 'Your state', 'text'),
      field('questions', 'Questions to ask the office', 'textarea', { required: false }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Income certificate — preparation notes' },
      { type: 'paragraph', text: 'Name: {{applicantName}}' },
      { type: 'paragraph', text: 'State to confirm requirements in: {{stateName}}' },
      {
        type: 'list',
        items: [
          'Ask which office or portal currently accepts the application.',
          'Ask which proofs of income and address that office wants to see.',
          'Ask the fee only at that office. This page does not publish a fee.',
          'Do not download a certificate design. The authority issues the certificate.',
        ],
      },
      { type: 'paragraph', text: '{{questions}}' },
    ],
    paragraphs: [],
    considerations: [
      'State portals differ. A link is omitted here because there is no single national application URL that covers every state.',
    ],
    sample: 'A preparation list and a space for your own questions. No certificate layout.',
    faqs: [
      faq(
        'Can I download an income certificate from Varnarc?',
        'No. Only the government authority can issue it.',
      ),
      faq(
        'Which website should I use?',
        'Use the citizen portal your state government publishes. Do not follow an unofficial replica.',
      ),
    ],
    related: ['formal-request-letter', 'address-change-request'],
  }),
  simpleLetter({
    slug: 'pan-correction-guidance',
    name: 'PAN correction guidance',
    categorySlug: 'identity-guidance',
    keyword: 'pan correction',
    secondary: ['pan card correction procedure'],
    summary:
      'Prepare for a PAN correction using the income-tax portal, without typing your PAN on this page.',
    about:
      'PAN corrections are made through the official income-tax process. This note tells you what to take with you and does not collect the number.',
    when: 'Read it when your PAN record has a name, date, or photo that needs correction.',
    info: ['Nothing secret', 'A reminder of which detail looks wrong'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'GUIDANCE',
    disclaimer: GUIDANCE_DISCLAIMER,
    officialSourceUrl: 'https://www.incometax.gov.in',
    fields: [
      field('applicantName', 'Your name', 'text'),
      field('whatToFix', 'What needs correction', 'select', {
        options: [
          { value: 'Name', label: 'Name' },
          { value: 'Date of birth', label: 'Date of birth' },
          { value: 'Photo or signature', label: 'Photo or signature' },
          { value: 'Other detail on the PAN record', label: 'Other detail on the PAN record' },
        ],
      }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'PAN correction — preparation notes' },
      {
        type: 'paragraph',
        text: '{{applicantName}} wants to ask about a correction to: {{whatToFix}}.',
      },
      {
        type: 'list',
        items: [
          'Start at the Income Tax Department portal linked from this page.',
          'Keep the acknowledgement the portal gives you.',
          'Do not type the PAN into Varnarc.',
        ],
      },
    ],
    paragraphs: [],
    considerations: [
      'Fees and processing times change. Read them on the portal on the day you apply.',
    ],
    sample: 'Your name, the kind of correction, and a pointer to incometax.gov.in. No PAN field.',
    faqs: [
      faq(
        'Where is the official process?',
        'The Income Tax Department site at https://www.incometax.gov.in is the source linked here.',
      ),
      faq(
        'Will this letter correct the PAN?',
        'No. The portal or the authorised centre does that.',
      ),
    ],
    related: ['address-change-request', 'kyc-update-request'],
  }),
  simpleLetter({
    slug: 'aadhaar-update-guidance',
    name: 'Aadhaar update guidance',
    categorySlug: 'identity-guidance',
    keyword: 'aadhaar update',
    secondary: ['aadhaar address update'],
    summary:
      'Prepare for an Aadhaar update on UIDAI’s site without entering the Aadhaar number here.',
    about:
      'Aadhaar demographic updates are handled by UIDAI. This page points you there and refuses to collect the number or to draw a card.',
    when: 'Read it before you update address, name, or other demographics UIDAI allows online or at a centre.',
    info: ['Which detail you want to ask UIDAI about'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'GUIDANCE',
    disclaimer: GUIDANCE_DISCLAIMER,
    officialSourceUrl: 'https://uidai.gov.in',
    fields: [
      field('updateKind', 'What you need to ask UIDAI about', 'select', {
        options: [
          { value: 'Address', label: 'Address' },
          { value: 'Name', label: 'Name' },
          { value: 'Date of birth', label: 'Date of birth' },
          { value: 'Mobile or email', label: 'Mobile or email' },
        ],
      }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Aadhaar update — preparation notes' },
      { type: 'paragraph', text: 'Topic to check on the UIDAI website: {{updateKind}}.' },
      {
        type: 'list',
        items: [
          'Use only https://uidai.gov.in or a centre UIDAI lists.',
          'Do not enter the Aadhaar number on Varnarc.',
          'Ignore any site that offers to print an Aadhaar card for you.',
        ],
      },
    ],
    paragraphs: [],
    considerations: [
      'UIDAI decides which updates can be done online and which documents it wants. Those rules change.',
    ],
    sample: 'A topic and a link to UIDAI. There is no card layout.',
    faqs: [
      faq(
        'Can I download an Aadhaar card here?',
        'No. Varnarc does not reproduce Aadhaar cards, seals, or QR codes.',
      ),
      faq('Which site is official?', 'UIDAI’s site is https://uidai.gov.in.'),
    ],
    related: ['address-change-request', 'kyc-update-request'],
  }),
  simpleLetter({
    slug: 'passport-application-guidance',
    name: 'Passport application guidance',
    categorySlug: 'identity-guidance',
    keyword: 'passport application',
    secondary: ['passport application documents'],
    summary:
      'Prepare for a passport application on the official passport portal, without storing identity numbers.',
    about:
      'Passports are issued through the official passport system. This note lists what to check there. It does not book an appointment.',
    when: 'Read it before a fresh application or a re-issue.',
    info: ['Whether this is a fresh application or a re-issue'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'GUIDANCE',
    disclaimer: GUIDANCE_DISCLAIMER,
    officialSourceUrl: 'https://www.passportindia.gov.in',
    fields: [
      field('applicationKind', 'What you are planning', 'select', {
        options: [
          { value: 'Fresh application', label: 'Fresh application' },
          { value: 'Re-issue', label: 'Re-issue' },
        ],
      }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Passport application — preparation notes' },
      { type: 'paragraph', text: 'Plan: {{applicationKind}}.' },
      {
        type: 'list',
        items: [
          'Create the application only on the official passport portal.',
          'Read the document list shown for your case on that portal.',
          'Pay only the fee displayed there. This page does not quote a fee.',
        ],
      },
    ],
    paragraphs: [],
    considerations: [
      'Police verification and appointment rules are described on the official portal and can change.',
    ],
    sample:
      'Fresh or re-issue, plus a pointer to passportindia.gov.in. No application form replica.',
    faqs: [
      faq(
        'Where do I apply?',
        'The Passport Seva site at https://www.passportindia.gov.in is the official source linked here.',
      ),
      faq(
        'Can this page book the appointment?',
        'No. Book the appointment only on the official passport portal after you read the current instructions.',
      ),
    ],
    related: ['formal-request-letter', 'address-change-request'],
  }),
  simpleLetter({
    slug: 'construction-agreement',
    name: 'Construction agreement outline',
    categorySlug: 'contractor-documents',
    keyword: 'construction agreement format',
    secondary: ['contractor agreement sample'],
    summary:
      'List the site, price, and scope you have already agreed in principle, for a lawyer to turn into a contract.',
    about:
      'This outline records a site, a contract price, and a scope description. It is not a construction contract and it does not set delay damages.',
    when: 'Use it before work starts, as a briefing paper alongside a contractor quotation.',
    info: ['Site', 'Owner', 'Contractor', 'Price', 'Scope in your words'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'AGREEMENT',
    disclaimer: LEGAL_DISCLAIMER,
    fields: [
      field('ownerName', 'Owner', 'text'),
      field('contractorName', 'Contractor', 'text'),
      field('siteAddress', 'Site address', 'address'),
      field('contractPrice', 'Contract price', 'currency'),
      field('scope', 'Scope the parties describe', 'textarea'),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Construction agreement outline' },
      { type: 'paragraph', text: outlineNote },
      { type: 'paragraph', text: 'Owner: {{ownerName}}' },
      { type: 'paragraph', text: 'Contractor: {{contractorName}}' },
      { type: 'paragraph', text: 'Site: {{siteAddress}}' },
      { type: 'paragraph', text: 'Price entered: {{contractPrice}}' },
      { type: 'paragraph', text: 'Scope: {{scope}}' },
      {
        type: 'paragraph',
        text: 'Delay damages, retention, and defect liability are not included. Add them only through counsel.',
      },
      { type: 'signature', label: 'Owner', nameField: 'ownerName' },
      { type: 'signature', label: 'Contractor', nameField: 'contractorName' },
    ],
    paragraphs: [],
    considerations: [
      'Use construction calculators to estimate quantities, then type only the scope you are actually pricing.',
    ],
    sample:
      'Owner, contractor, site, one price, a scope paragraph, and a warning about missing legal terms.',
    faqs: [
      faq('Does the price include materials?', 'Only if the scope you typed says so.'),
      faq(
        'Is this enough to start demolition?',
        'No. Get a proper contract and the permissions the local authority requires.',
      ),
    ],
    related: ['contractor-quotation', 'quotation'],
    tools: [{ label: 'Construction calculators', href: '/construction' }],
  }),
  simpleLetter({
    slug: 'vehicle-sale-agreement',
    name: 'Vehicle sale outline',
    categorySlug: 'vehicle-records',
    keyword: 'vehicle sale agreement format',
    secondary: ['vehicle sale deed sample'],
    summary:
      'Note the buyer, seller, vehicle, and price before ownership is transferred through the transport authority.',
    about:
      'This outline records a proposed vehicle sale. It does not transfer the registration certificate or replace the authority’s forms.',
    when: 'Use it as a discussion draft, then complete transfer on the official transport portal.',
    info: ['Buyer', 'Seller', 'Vehicle', 'Price', 'Registration text'],
    status: 'REVIEW_REQUIRED',
    requiresReview: true,
    kind: 'AGREEMENT',
    disclaimer:
      'Ownership changes only when the transport authority records it. This outline is not a Form 29, Form 30, or a registration certificate.',
    officialSourceUrl: 'https://parivahan.gov.in',
    fields: [
      field('sellerName', 'Seller', 'text'),
      field('buyerName', 'Buyer', 'text'),
      field('vehicle', 'Make and model', 'text'),
      field('registrationText', 'Registration number', 'text'),
      field('price', 'Price', 'currency'),
      field('otherTerms', 'Other points the parties write', 'textarea', { required: false }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Vehicle sale outline' },
      { type: 'paragraph', text: outlineNote },
      { type: 'paragraph', text: 'Seller: {{sellerName}}' },
      { type: 'paragraph', text: 'Buyer: {{buyerName}}' },
      { type: 'paragraph', text: 'Vehicle: {{vehicle}}' },
      { type: 'paragraph', text: 'Registration: {{registrationText}}' },
      { type: 'paragraph', text: 'Price entered: {{price}}' },
      { type: 'paragraph', text: '{{otherTerms}}' },
      {
        type: 'paragraph',
        text: 'Complete the transfer on the Parivahan portal or at the registering authority. This file does not update government records.',
      },
      { type: 'signature', label: 'Seller', nameField: 'sellerName' },
      { type: 'signature', label: 'Buyer', nameField: 'buyerName' },
    ],
    paragraphs: [],
    considerations: [
      'Check hypothecation and pending challans with the authority. This form cannot see them.',
    ],
    sample: 'Buyer, seller, vehicle, registration text, price, and a pointer to Parivahan.',
    faqs: [
      faq(
        'Does the buyer become the owner when this is signed?',
        'No. The registering authority has to record the transfer.',
      ),
      faq('Where is the official portal?', 'Parivahan is at https://parivahan.gov.in.'),
    ],
    related: ['vehicle-delivery-receipt', 'payment-receipt'],
    tools: [{ label: 'Automobile tools', href: '/automobile' }],
  }),
];
