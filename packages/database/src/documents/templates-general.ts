import type { DocumentBlock, DocumentField } from '@varnarc/validation';
import { field, letterFields, simpleLetter, type SeedTemplate } from './define';
import { publishedSupport } from './templates-employment';

function faq(question: string, answer: string) {
  return { question, answer };
}

const receiptFields = (titleNoun: string): DocumentField[] => [
  field('receiptDate', 'Receipt date', 'date'),
  field('receiptNo', 'Receipt number', 'text'),
  field('receivedFrom', 'Received from', 'text'),
  field('payerName', titleNoun === 'rent' ? 'Tenant name' : 'Payer name', 'text'),
  field('amount', 'Amount', 'currency'),
  field('purpose', 'Purpose', 'text'),
  field('period', 'Period covered', 'text', { required: false, placeholder: 'October 2026' }),
  field('paymentMode', 'Payment mode', 'select', {
    options: [
      { value: 'Bank transfer', label: 'Bank transfer' },
      { value: 'UPI', label: 'UPI' },
      { value: 'Cheque', label: 'Cheque' },
      { value: 'Cash', label: 'Cash' },
    ],
  }),
  field('propertyOrNote', 'Property or note', 'textarea', { required: false }),
];

function receiptBlocks(title: string): DocumentBlock[] {
  return [
    { type: 'heading', level: 1, text: title },
    { type: 'paragraph', text: 'Receipt no. {{receiptNo}}' },
    { type: 'paragraph', text: 'Date: {{receiptDate}}' },
    {
      type: 'table',
      headers: ['Item', 'Details'],
      rows: [
        ['Received from', '{{payerName}}'],
        ['Received by', '{{receivedFrom}}'],
        ['Amount', '{{amount}}'],
        ['Purpose', '{{purpose}}'],
        ['Period', '{{period}}'],
        ['Payment mode', '{{paymentMode}}'],
      ],
    },
    { type: 'paragraph', text: '{{propertyOrNote}}' },
    {
      type: 'paragraph',
      text: 'This receipt records the amount entered above. It does not decide tax, stamp duty, or ownership.',
    },
    { type: 'signature', label: 'Received by', nameField: 'receivedFrom' },
  ];
}

const invoiceFields: DocumentField[] = [
  field('invoiceNo', 'Invoice number', 'text'),
  field('invoiceDate', 'Invoice date', 'date'),
  field('sellerName', 'Seller name', 'text'),
  field('sellerAddress', 'Seller address', 'address'),
  field('buyerName', 'Buyer name', 'text'),
  field('buyerAddress', 'Buyer address', 'address'),
  field('items', 'Line items', 'repeat', {
    maxItems: 20,
    itemFields: [
      field('description', 'Description', 'text'),
      field('quantity', 'Quantity', 'number', { validation: { min: 0 } }),
      field('rate', 'Rate', 'currency'),
    ],
  }),
  field('taxAmount', 'Tax amount', 'currency', {
    required: false,
    helpText: 'Type the tax amount your invoice should show. This form does not choose a GST rate.',
  }),
  field('notes', 'Notes', 'textarea', { required: false }),
];

const invoiceBlocks: DocumentBlock[] = [
  { type: 'heading', level: 1, text: 'Invoice' },
  { type: 'paragraph', text: 'Invoice no. {{invoiceNo}} · Date {{invoiceDate}}' },
  { type: 'paragraph', text: 'From: {{sellerName}}' },
  { type: 'paragraph', text: '{{sellerAddress}}' },
  { type: 'paragraph', text: 'To: {{buyerName}}' },
  { type: 'paragraph', text: '{{buyerAddress}}' },
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
  { type: 'paragraph', text: 'Tax amount: {{taxAmount}}' },
  { type: 'paragraph', text: '{{notes}}' },
  {
    type: 'paragraph',
    text: 'Line amounts are quantity multiplied by the rate you typed. Confirm tax treatment with your accountant before you treat this as a tax invoice.',
  },
];

const checklistFields: DocumentField[] = [
  field('handoverDate', 'Handover date', 'date'),
  field('propertyAddress', 'Property address', 'address'),
  field('landlordName', 'Landlord or owner', 'text'),
  field('tenantName', 'Tenant or occupant', 'text'),
  field('keysHanded', 'Keys handed over', 'checkbox', { required: false }),
  field('metersNoted', 'Meter readings noted', 'checkbox', { required: false }),
  field('appliancesListed', 'Appliances listed', 'checkbox', { required: false }),
  field('notes', 'Condition notes', 'textarea', { required: false }),
];

const checklistBlocks: DocumentBlock[] = [
  { type: 'heading', level: 1, text: 'Property handover checklist' },
  { type: 'paragraph', text: 'Date: {{handoverDate}}' },
  { type: 'paragraph', text: 'Property: {{propertyAddress}}' },
  { type: 'paragraph', text: 'Owner: {{landlordName}}' },
  { type: 'paragraph', text: 'Occupant: {{tenantName}}' },
  {
    type: 'list',
    items: [
      'Keys handed over: {{keysHanded}}',
      'Meter readings noted: {{metersNoted}}',
      'Appliances listed: {{appliancesListed}}',
    ],
  },
  { type: 'paragraph', text: '{{notes}}' },
  {
    type: 'paragraph',
    text: 'Tick only the items you have actually checked. This list is not a society NOC or a possession certificate.',
  },
  { type: 'signature', label: 'Owner', nameField: 'landlordName' },
  { type: 'signature', label: 'Occupant', nameField: 'tenantName' },
];

export const generalTemplates: SeedTemplate[] = [
  simpleLetter({
    slug: 'formal-request-letter',
    name: 'Formal request letter',
    categorySlug: 'formal-letters',
    keyword: 'formal request letter',
    secondary: ['request letter format'],
    summary:
      'Write a formal request with a clear subject, the action you want, and your contact details.',
    about:
      'A formal request letter asks an office or institution for a specific action and gives the facts they need to reply.',
    when: 'Use it when email is not enough and the reader expects a dated letter.',
    info: [
      'What you are asking for',
      'Any reference number you already have',
      'Your contact detail',
    ],
    extraFields: [
      field('requestFor', 'What you are requesting', 'text'),
      field('reference', 'Your reference', 'text', {
        required: false,
        helpText: 'A file number you already have. Do not invent one.',
      }),
      field('details', 'Details', 'textarea'),
    ],
    paragraphs: [
      'I request {{requestFor}}.',
      'Reference, if any: {{reference}}.',
      '{{details}}',
      'Please reply to the address on this letter.',
    ],
    considerations: [
      'State one request. A letter that asks for several unrelated things is harder to answer.',
    ],
    sample: 'Date, recipient, the request in one line, supporting detail, and your name.',
    faqs: [
      faq(
        'Can I use this for a government office?',
        'You can send a request, but this page does not file the application. Use the office’s own form when one exists.',
      ),
      faq(
        'Should I attach documents?',
        'List them in the details box only if you are actually attaching them.',
      ),
    ],
    related: ['permission-letter', 'complaint-letter', 'address-change-request'],
  }),
  simpleLetter({
    slug: 'complaint-letter',
    name: 'Complaint letter',
    categorySlug: 'formal-letters',
    keyword: 'complaint letter format',
    secondary: ['formal complaint letter'],
    summary:
      'Write a complaint that states what happened, when it happened, and what outcome you want.',
    about:
      'A complaint letter tells an organisation what went wrong and what you want them to do next.',
    when: 'Use it after you have the dates and a factual description, and before you escalate further.',
    info: ['What happened', 'When it happened', 'The outcome you want'],
    extraFields: [
      field('happenedOn', 'Date of the issue', 'date'),
      field('whatHappened', 'What happened', 'textarea'),
      field('outcome', 'Outcome you want', 'text'),
    ],
    paragraphs: [
      'I am writing about an issue on {{happenedOn}}.',
      '{{whatHappened}}',
      'The outcome I am asking for is: {{outcome}}.',
      'Please reply in writing.',
    ],
    considerations: [
      'Stick to facts you can support. Do not accuse a named person of a crime in a template sentence.',
    ],
    sample: 'Date of the issue, a factual paragraph, and one requested outcome.',
    faqs: [
      faq(
        'Is this a legal notice?',
        'No. A legal notice has formal requirements. This is a complaint you send yourself.',
      ),
      faq(
        'Can I name a staff member?',
        'Only if that identification is necessary and accurate. The template does not add allegations for you.',
      ),
    ],
    related: ['formal-request-letter', 'permission-letter'],
  }),
  simpleLetter({
    slug: 'permission-letter',
    name: 'Permission letter',
    categorySlug: 'formal-letters',
    keyword: 'permission letter format',
    secondary: ['letter seeking permission'],
    summary:
      'Ask for permission for a specific activity, with the date and place you have in mind.',
    about:
      'A permission letter asks someone in authority to allow a specific activity on a stated date.',
    when: 'Use it for school, college, office, or family situations where written permission is expected.',
    info: ['Activity', 'Date', 'Place'],
    extraFields: [
      field('activity', 'Activity', 'text'),
      field('onDate', 'Date', 'date'),
      field('place', 'Place', 'text'),
    ],
    paragraphs: [
      'I request permission for {{activity}} on {{onDate}} at {{place}}.',
      'I will follow the conditions you set if you approve this request.',
    ],
    considerations: ['Permission is not granted until the person you wrote to agrees.'],
    sample: 'The activity, date, place, and your name.',
    faqs: [
      faq(
        'Can a parent use this for a school event?',
        'Yes. Put the parent as the sender and the school as the organisation.',
      ),
      faq(
        'Does approval get stored on Varnarc?',
        'Only if you are signed in and choose to save the draft. The school’s approval is their own record.',
      ),
    ],
    related: ['leave-application', 'school-leave-application'],
  }),
  simpleLetter({
    slug: 'authorization-letter',
    name: 'Authorization letter',
    categorySlug: 'formal-letters',
    keyword: 'authorization letter format',
    secondary: ['authorisation letter to collect documents'],
    summary: 'Authorise a named person to collect or submit a document on one stated occasion.',
    about:
      'An authorization letter says you allow a named person to do one task for you, such as collecting a paper you describe.',
    when: 'Use it when an office accepts a representative and has asked for a signed letter.',
    info: ['Representative name', 'The single task', 'The date they will visit'],
    extraFields: [
      field('representative', 'Person you authorise', 'text'),
      field('task', 'Task', 'text', { placeholder: 'Collect my admission acknowledgement' }),
      field('visitDate', 'Visit date', 'date'),
    ],
    paragraphs: [
      'I authorise {{representative}} to {{task}} on {{visitDate}}.',
      'This authorisation is limited to that task and that visit. It is not a general power of attorney.',
    ],
    considerations: [
      'Some offices insist on their own form or on the representative carrying their own photo identity. Follow that instruction.',
      'Do not authorise anyone to collect cash, cheques, or identity cards unless the office told you that is allowed.',
    ],
    sample: 'Your name, the representative, one task, one date, and your signature line.',
    faqs: [
      faq(
        'Is this a power of attorney?',
        'No. A power of attorney is a formal instrument. This letter covers one task.',
      ),
      faq(
        'Should I attach an identity copy?',
        'Only if the office asked for it. Do not upload identity numbers into this form.',
      ),
    ],
    related: ['formal-request-letter', 'address-change-request'],
  }),
  simpleLetter({
    slug: 'invitation-letter',
    name: 'Invitation letter',
    categorySlug: 'formal-letters',
    keyword: 'invitation letter format',
    secondary: ['formal invitation letter'],
    summary: 'Invite someone to an event with the date, time, venue, and how they should reply.',
    about:
      'An invitation letter gives a guest the event name, schedule, and venue so they can decide whether to attend.',
    when: 'Use it for a formal function, interview day, or family event that needs a written invite.',
    info: ['Event name', 'Date and time', 'Venue', 'Reply instruction'],
    extraFields: [
      field('eventName', 'Event', 'text'),
      field('eventWhen', 'Date and time', 'text'),
      field('venue', 'Venue', 'text'),
      field('rsvp', 'How to reply', 'text', { required: false }),
    ],
    paragraphs: [
      'You are invited to {{eventName}}.',
      'When: {{eventWhen}}.',
      'Where: {{venue}}.',
      '{{rsvp}}',
    ],
    signLabel: 'Host',
    considerations: [
      'Send venue access or security rules separately if the building requires them.',
    ],
    sample: 'Event name, when, where, and an optional reply line.',
    faqs: [
      faq(
        'Can I invite more than one person?',
        'Address the letter to one recipient, or type a group name such as “Parents of Class 8” if that is accurate.',
      ),
      faq('Does this reserve a hall?', 'No. It only prints the invitation.'),
    ],
    related: ['permission-letter', 'formal-request-letter'],
  }),
  simpleLetter({
    slug: 'recommendation-letter',
    name: 'Recommendation letter',
    categorySlug: 'formal-letters',
    keyword: 'recommendation letter format',
    secondary: ['reference letter format'],
    summary:
      'Draft a recommendation that names the person, how you know them, and the purpose of the letter.',
    about:
      'A recommendation letter is written by someone who knows the person and is willing to describe that relationship for a stated purpose.',
    when: 'Use it when a college, employer, or landlord asks for a reference and you actually know the person.',
    info: ['Person recommended', 'How long you have known them', 'Purpose of the letter'],
    extraFields: [
      field('personName', 'Person you recommend', 'text'),
      field('relationship', 'How you know them', 'text'),
      field('purpose', 'Purpose', 'text'),
      field('comments', 'Comments you can support', 'textarea'),
    ],
    paragraphs: [
      'I am writing to recommend {{personName}}.',
      'I know them as follows: {{relationship}}.',
      'The purpose of this letter is {{purpose}}.',
      '{{comments}}',
      'I am making only the statements written above.',
    ],
    signLabel: 'Recommender',
    considerations: ['Do not sign a recommendation you cannot stand behind if someone calls you.'],
    sample: 'Recommender, the person’s name, the relationship, the purpose, and comments.',
    faqs: [
      faq(
        'Can the candidate write it for me to sign?',
        'They can prepare a draft. You should change anything you cannot confirm before you sign.',
      ),
      faq(
        'Will this guarantee admission or a job?',
        'No. The reader decides what weight to give the letter.',
      ),
    ],
    related: ['cover-letter', 'internship-certificate'],
  }),
  simpleLetter({
    slug: 'address-change-request',
    name: 'Address change request',
    categorySlug: 'formal-letters',
    keyword: 'address change request letter',
    secondary: ['letter for change of address'],
    summary: 'Ask an organisation to update the postal address it keeps for you.',
    about:
      'An address change request asks a bank, employer, school, or other organisation to replace the postal address on its file.',
    when: 'Send it after you have moved and the organisation does not offer a self-service address update.',
    info: ['New address', 'The date you want it used from'],
    extraFields: [
      field('newAddress', 'New address', 'address'),
      field('effectiveOn', 'Use this address from', 'date'),
    ],
    paragraphs: [
      'Please update the postal address on my records with {{toOrganization}}.',
      'New address: {{newAddress}}.',
      'Please use it from {{effectiveOn}}.',
      'I have not included identity numbers in this letter. Follow the proof your organisation asks for separately.',
    ],
    considerations: [
      'Banks and government IDs often need their own form and a proof of address. This letter does not replace that process.',
    ],
    sample: 'Your name, the organisation, the new address, and the date it should apply.',
    faqs: [
      faq(
        'Will this update Aadhaar or my bank automatically?',
        'No. Each organisation has its own process. This letter is only a request to the recipient you name.',
      ),
      faq(
        'Should I type my account number?',
        'No. Let the organisation match you with the customer information it already holds.',
      ),
    ],
    related: ['kyc-update-request', 'formal-request-letter'],
    tools: publishedSupport.loans,
  }),
  simpleLetter({
    slug: 'rent-receipt',
    name: 'Rent receipt',
    categorySlug: 'rent-records',
    keyword: 'rent receipt generator',
    secondary: ['rent receipt format', 'house rent receipt pdf'],
    summary: 'Create a rent receipt for a month, with landlord, tenant, amount, and payment mode.',
    about:
      'A rent receipt is the landlord’s acknowledgement that a rent amount was received for a period the parties name.',
    when: 'Tenants ask for it when an employer or tax filing needs proof that rent was paid.',
    info: ['Landlord', 'Tenant', 'Amount', 'Period', 'Payment mode'],
    fields: receiptFields('rent').map((item) =>
      item.key === 'purpose' ? { ...item, defaultValue: 'House rent' } : item,
    ),
    blocks: receiptBlocks('Rent receipt'),
    kind: 'RECEIPT',
    paragraphs: [],
    considerations: [
      'The person who received the money should sign the receipt.',
      'This receipt does not calculate house-rent tax exemption. Check the current income-tax rules or ask a tax adviser.',
    ],
    sample: 'Receipt number, date, tenant, landlord, amount, period, and payment mode.',
    faqs: [
      faq(
        'Does a rent receipt register the rental agreement?',
        'No. Registration, if it applies, is a separate step with the state process.',
      ),
      faq(
        'Can I put several months on one receipt?',
        'Type the period in the period field, and make sure the amount matches that whole period.',
      ),
    ],
    related: ['security-deposit-receipt', 'rental-termination-notice'],
    tools: publishedSupport.calc,
  }),
  simpleLetter({
    slug: 'security-deposit-receipt',
    name: 'Security deposit receipt',
    categorySlug: 'rent-records',
    keyword: 'security deposit receipt format',
    secondary: ['rental deposit receipt'],
    summary:
      'Acknowledge a security deposit with the amount, property, and the person who received it.',
    about:
      'A security deposit receipt records that a stated sum was received as a deposit for a property, separate from monthly rent.',
    when: 'Use it when a tenant pays a deposit and wants a signed acknowledgement.',
    info: ['Amount', 'Property note', 'Payer', 'Receiver'],
    fields: receiptFields('deposit'),
    blocks: receiptBlocks('Security deposit receipt'),
    kind: 'RECEIPT',
    paragraphs: [],
    considerations: [
      'Write whether the amount is a deposit, not rent, in the purpose line. Refund rules belong in the rental arrangement, not in guessed clauses here.',
    ],
    sample:
      'Amount, purpose marked as security deposit, property note, and the receiver’s signature.',
    faqs: [
      faq(
        'Does this receipt say when the deposit will be returned?',
        'Only if you type that timing into the note. The template does not pick a refund rule.',
      ),
      faq(
        'Is the deposit the same as rent?',
        'No. Label the purpose clearly so the two are not confused later.',
      ),
    ],
    related: ['rent-receipt', 'property-handover-checklist'],
  }),
  simpleLetter({
    slug: 'property-handover-checklist',
    name: 'Property handover checklist',
    categorySlug: 'property-checklists',
    keyword: 'property handover checklist',
    secondary: ['tenant move out checklist'],
    summary:
      'Tick keys, meters, and appliances when a property is handed over, and add condition notes.',
    about:
      'A handover checklist is a shared note of what was checked when a property changed hands. It is not a possession certificate.',
    when: 'Use it at move-in or move-out when both sides want a simple record of the inspection.',
    info: ['Property address', 'Date', 'Which items were actually checked'],
    fields: checklistFields,
    blocks: checklistBlocks,
    kind: 'CHECKLIST',
    paragraphs: [],
    considerations: [
      'Photograph defects separately if you need evidence. Do not mark an item done if you did not check it.',
    ],
    sample: 'Address, date, yes or no for keys, meters, and appliances, plus a notes box.',
    faqs: [
      faq(
        'Is this a society NOC?',
        'No. A society or authority issues its own no-objection letter.',
      ),
      faq(
        'Do both people need to sign?',
        'The page has two signature lines so each side can sign if they agree with the notes.',
      ),
    ],
    related: ['rent-receipt', 'rental-termination-notice'],
    tools: publishedSupport.construction,
  }),
  simpleLetter({
    slug: 'rental-termination-notice',
    name: 'Rental termination notice',
    categorySlug: 'rent-records',
    keyword: 'rental termination notice',
    secondary: ['tenant vacating letter'],
    summary:
      'Give notice that a tenancy will end on a date you choose, and state who is sending it.',
    about:
      'A rental termination notice tells the other party that the sender wants the tenancy to end on a stated date.',
    when: 'Use it when your rental arrangement requires written notice before vacating or asking a tenant to leave.',
    info: ['Property', 'End date', 'Who is sending the notice'],
    extraFields: [
      field('propertyAddress', 'Property address', 'address'),
      field('endDate', 'Tenancy end date', 'date'),
      field('senderRole', 'You are the', 'select', {
        options: [
          { value: 'Tenant', label: 'Tenant' },
          { value: 'Landlord', label: 'Landlord' },
        ],
      }),
    ],
    paragraphs: [
      'I am the {{senderRole}} of {{propertyAddress}}.',
      'I give notice that I want the tenancy to end on {{endDate}}.',
      'Please confirm the handover steps. This notice does not set penalties, forfeiture, or stamp duty.',
    ],
    requiresReview: true,
    disclaimer:
      'Notice periods and termination rights depend on the agreement and state law. This letter only states the date and role you entered. Have the agreement checked before you rely on a date.',
    considerations: [
      'Read the notice clause in the existing agreement. Do not assume one month is enough.',
    ],
    sample:
      'Role, property, end date, and a request to confirm handover. No penalty clause is added.',
    faqs: [
      faq(
        'Does this evict a tenant?',
        'No. It is a notice draft. Eviction, where it is lawful, follows the legal process, not this download.',
      ),
      faq(
        'Should I mention the deposit?',
        'You can discuss it in handover. This template does not decide who keeps the deposit.',
      ),
    ],
    related: ['rent-receipt', 'property-handover-checklist'],
  }),
  simpleLetter({
    slug: 'bank-account-closure-request',
    name: 'Bank account closure request',
    categorySlug: 'bank-requests',
    keyword: 'bank account closure letter',
    secondary: ['account closure request format'],
    summary:
      'Ask your bank to close an account and tell them where to reach you, without typing the account number.',
    about:
      'An account closure request asks a bank to start its closure process and says how the bank can contact you.',
    when: 'Use it when the bank asks for a written request and you have already moved standing instructions.',
    info: ['Branch or relationship team', 'Contact phone or email', 'The date of the request'],
    extraFields: [
      field('contact', 'Phone or email for the reply', 'text'),
      field('reason', 'Reason', 'textarea', { required: false }),
    ],
    paragraphs: [
      'Please close my account with {{toOrganization}} and confirm once the closure is complete.',
      'Contact me at {{contact}}. Please use the customer details you already hold. I am not writing the account number in this letter.',
      '{{reason}}',
      'I will clear any cheque, card, or auto-debit your branch tells me is still open.',
    ],
    considerations: [
      'Banks usually need their own form and identity check. This letter does not close the account by itself.',
    ],
    sample: 'Bank name, your name, a contact method, and a request to confirm closure.',
    faqs: [
      faq(
        'Why is there no account-number field?',
        'The bank can match you in person or on its form. Keeping the number out of this file reduces risk if a download is misplaced.',
      ),
      faq(
        'Will unused cheques be cancelled?',
        'Only if the bank does that as part of its process. Ask the branch.',
      ),
    ],
    related: ['kyc-update-request', 'loan-foreclosure-request'],
    tools: publishedSupport.loans,
  }),
  simpleLetter({
    slug: 'loan-foreclosure-request',
    name: 'Loan foreclosure request',
    categorySlug: 'loan-requests',
    keyword: 'loan foreclosure letter format',
    secondary: ['loan closure request letter'],
    summary:
      'Ask a lender for the foreclosure figure and the steps to close a loan, without typing the loan number.',
    about:
      'A foreclosure request asks the lender to share the amount required to close a loan and the documents they need.',
    when: 'Send it when you are ready to repay early and want the lender’s own figure, not an estimate from a calculator.',
    info: ['Lender name', 'How they should reply', 'The date of the request'],
    extraFields: [field('contact', 'Phone or email for the reply', 'text')],
    paragraphs: [
      'Please share the amount and steps required to foreclose my loan with {{toOrganization}}.',
      'Reply to {{contact}}. Please use the loan reference you already have on file rather than a number written in this letter.',
      'I will pay only the figure your foreclosure statement shows, after I have read it.',
    ],
    considerations: [
      'Foreclosure charges, if any, are whatever your loan agreement and the lender’s current statement say. This letter does not guess them.',
    ],
    sample: 'Lender, your name, a contact method, and a request for their foreclosure statement.',
    faqs: [
      faq(
        'Does Varnarc know my outstanding balance?',
        'No. Only the lender can issue the payoff figure.',
      ),
      faq(
        'Is foreclosure the same as prepayment of one EMI?',
        'No. Foreclosure means closing the loan. A part-payment is a different request.',
      ),
    ],
    related: ['payment-acknowledgement', 'bank-account-closure-request'],
    tools: publishedSupport.loans,
  }),
  simpleLetter({
    slug: 'kyc-update-request',
    name: 'KYC update request',
    categorySlug: 'bank-requests',
    keyword: 'kyc update request letter',
    secondary: ['bank kyc update letter'],
    summary:
      'Ask a bank or insurer to update KYC details and list what changed, without identity numbers.',
    about:
      'A KYC update request tells an institution which contact detail changed and asks them to use their official update process.',
    when: 'Use it when your phone, email, or postal address on a financial account is out of date.',
    info: ['What changed', 'The new value that is not an identity number'],
    extraFields: [
      field('changeType', 'What should be updated', 'select', {
        options: [
          { value: 'Postal address', label: 'Postal address' },
          { value: 'Mobile number', label: 'Mobile number' },
          { value: 'Email', label: 'Email' },
        ],
      }),
      field('newValue', 'New address, mobile, or email', 'textarea'),
    ],
    paragraphs: [
      'Please update my {{changeType}} on the account you hold for me.',
      'New details: {{newValue}}.',
      'I will complete the KYC form and proof your branch requires. Please do not treat this letter as that proof.',
    ],
    considerations: [
      'Identity documents are shown at the branch or on the official portal. Do not type those numbers here.',
    ],
    sample: 'Institution, the field that changed, the new contact value, and your name.',
    faqs: [
      faq(
        'Can I update Aadhaar from this page?',
        'No. Aadhaar updates happen through UIDAI’s process. This letter is for the bank or insurer you address.',
      ),
      faq(
        'Will the institution accept only this letter?',
        'Often they also need their form. Ask them before you rely on the letter alone.',
      ),
    ],
    related: ['address-change-request', 'bank-account-closure-request'],
    tools: publishedSupport.loans,
  }),
  simpleLetter({
    slug: 'payment-acknowledgement',
    name: 'Payment acknowledgement',
    categorySlug: 'bank-requests',
    keyword: 'payment acknowledgement format',
    secondary: ['payment received letter'],
    summary:
      'Acknowledge that you received a payment, with the amount, date, and purpose you enter.',
    about:
      'A payment acknowledgement tells the payer that a stated amount was received on a stated date for a stated purpose.',
    when: 'Use it when a customer, tenant, or client asks for written confirmation of a payment.',
    info: ['Amount', 'Date', 'Purpose', 'Payer name'],
    fields: receiptFields('payment'),
    blocks: receiptBlocks('Payment acknowledgement'),
    kind: 'RECEIPT',
    paragraphs: [],
    considerations: ['Match the amount to your bank credit or cash record before you sign.'],
    sample: 'Payer, receiver, amount, date, purpose, and payment mode.',
    faqs: [
      faq(
        'Is this a tax invoice?',
        'No. Use the invoice generator when you need line items and a seller-buyer invoice.',
      ),
      faq(
        'Can I record a partial payment?',
        'Yes. Type the amount you actually received and describe the purpose.',
      ),
    ],
    related: ['payment-receipt', 'standard-invoice'],
  }),
  simpleLetter({
    slug: 'standard-invoice',
    name: 'Standard invoice',
    categorySlug: 'billing-documents',
    keyword: 'invoice format',
    secondary: ['invoice generator', 'bill format pdf'],
    summary:
      'Create an invoice with seller, buyer, and line items. Tax is printed only if you enter it.',
    about:
      'A standard invoice lists what was sold, the quantity, the rate, and the tax amount the seller chooses to show.',
    when: 'Use it when a customer needs a bill and you do not yet need a GST tax-invoice review.',
    info: ['Seller and buyer', 'Line items', 'Tax amount if you want one shown'],
    fields: invoiceFields,
    blocks: invoiceBlocks,
    kind: 'INVOICE',
    paragraphs: [],
    considerations: [
      'This page does not decide whether GST applies. The separate GST invoice outline stays in review until it is checked.',
      'Quantity times rate is arithmetic. It is not a tax opinion.',
    ],
    sample: 'Invoice number, date, parties, a table of items, and an optional tax line.',
    faqs: [
      faq(
        'Will the total include GST automatically?',
        'No. A tax line appears only when you type a tax amount.',
      ),
      faq('Can I add more than one item?', 'Yes. The repeating section accepts up to 20 rows.'),
    ],
    related: ['quotation', 'payment-receipt'],
    tools: [{ label: 'GST calculator', href: '/calculators/gst' }],
  }),
  simpleLetter({
    slug: 'quotation',
    name: 'Quotation',
    categorySlug: 'billing-documents',
    keyword: 'quotation format',
    secondary: ['price quotation letter'],
    summary:
      'Send a quotation with line items, a validity date, and the name of the person quoting.',
    about:
      'A quotation tells a customer the price you are willing to offer for described work or goods until a date you set.',
    when: 'Use it before the customer accepts, when they asked for a written price.',
    info: ['Customer', 'Items', 'Quote valid until'],
    extraFields: [
      field('validUntil', 'Quote valid until', 'date'),
      field('items', 'Items', 'repeat', {
        maxItems: 20,
        itemFields: [
          field('description', 'Description', 'text'),
          field('quantity', 'Quantity', 'number'),
          field('rate', 'Rate', 'currency'),
        ],
      }),
      field('notes', 'Notes', 'textarea', { required: false }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Quotation' },
      { type: 'paragraph', text: 'Date: {{letterDate}}' },
      { type: 'paragraph', text: 'From: {{fromName}}' },
      { type: 'paragraph', text: '{{fromAddress}}' },
      { type: 'paragraph', text: 'To: {{toName}}, {{toOrganization}}' },
      { type: 'paragraph', text: 'This quotation is open until {{validUntil}}.' },
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
      { type: 'paragraph', text: '{{notes}}' },
      {
        type: 'paragraph',
        text: 'Prices are the ones typed above. They are not a contract until the customer accepts in writing.',
      },
      { type: 'signature', label: 'Quoted by', nameField: 'fromName' },
    ],
    fields: [
      ...letterFields([
        field('validUntil', 'Quote valid until', 'date'),
        field('items', 'Items', 'repeat', {
          maxItems: 20,
          itemFields: [
            field('description', 'Description', 'text'),
            field('quantity', 'Quantity', 'number'),
            field('rate', 'Rate', 'currency'),
          ],
        }),
        field('notes', 'Notes', 'textarea', { required: false }),
      ]),
    ],
    paragraphs: [],
    kind: 'INVOICE',
    considerations: [
      'If the work needs a site visit, say so in the notes instead of implying the price covers unknown conditions.',
    ],
    sample:
      'Seller, buyer, validity date, item table, and a note that acceptance is still required.',
    faqs: [
      faq(
        'Is a quotation an invoice?',
        'No. Raise an invoice after the work is agreed and billed.',
      ),
      faq(
        'Are rates inclusive of tax?',
        'Only if you say so in the notes. The form does not assume a tax rate.',
      ),
    ],
    related: ['standard-invoice', 'purchase-order', 'contractor-quotation'],
    tools: publishedSupport.construction,
  }),
  simpleLetter({
    slug: 'purchase-order',
    name: 'Purchase order',
    categorySlug: 'billing-documents',
    keyword: 'purchase order format',
    secondary: ['po format'],
    summary:
      'Issue a purchase order that lists items, rates, and the supplier you are ordering from.',
    about:
      'A purchase order is the buyer’s written list of goods or services they want a supplier to provide at the rates shown.',
    when: 'Send it when a supplier asked for a formal order before delivery.',
    info: ['Supplier', 'Items', 'Delivery note'],
    fields: [
      field('orderNo', 'Order number', 'text'),
      field('orderDate', 'Order date', 'date'),
      field('buyerName', 'Buyer', 'text'),
      field('supplierName', 'Supplier', 'text'),
      field('deliverTo', 'Deliver to', 'address'),
      field('items', 'Items', 'repeat', {
        maxItems: 20,
        itemFields: [
          field('description', 'Description', 'text'),
          field('quantity', 'Quantity', 'number'),
          field('rate', 'Rate', 'currency'),
        ],
      }),
      field('notes', 'Delivery notes', 'textarea', { required: false }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Purchase order' },
      { type: 'paragraph', text: 'Order {{orderNo}} · {{orderDate}}' },
      { type: 'paragraph', text: 'Buyer: {{buyerName}}' },
      { type: 'paragraph', text: 'Supplier: {{supplierName}}' },
      { type: 'paragraph', text: 'Deliver to: {{deliverTo}}' },
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
      { type: 'paragraph', text: '{{notes}}' },
      { type: 'signature', label: 'Authorised buyer', nameField: 'buyerName' },
    ],
    paragraphs: [],
    kind: 'INVOICE',
    considerations: [
      'A purchase order is an offer to buy the listed items. It does not add penalties for late delivery unless your own approved terms say so and you attach them.',
    ],
    sample: 'Order number, buyer, supplier, delivery address, and an item table.',
    faqs: [
      faq(
        'Does this create a contract by itself?',
        'It records the order you typed. Whether a contract exists depends on what the supplier accepts.',
      ),
      faq(
        'Can I attach separate terms?',
        'Yes, outside this file. Do not assume hidden terms are included.',
      ),
    ],
    related: ['quotation', 'delivery-challan'],
  }),
  simpleLetter({
    slug: 'delivery-challan',
    name: 'Delivery challan',
    categorySlug: 'billing-documents',
    keyword: 'delivery challan format',
    secondary: ['delivery note format'],
    summary: 'List goods leaving your premises, with quantities and the place they are going.',
    about:
      'A delivery challan lists goods being moved and who is sending and receiving them. It is not an invoice.',
    when: 'Use it when goods move before or without a tax invoice, and your process needs a delivery note.',
    info: ['Challan number', 'Goods', 'Destination'],
    fields: [
      field('challanNo', 'Challan number', 'text'),
      field('challanDate', 'Date', 'date'),
      field('senderName', 'Sender', 'text'),
      field('receiverName', 'Receiver', 'text'),
      field('destination', 'Destination', 'address'),
      field('items', 'Goods', 'repeat', {
        maxItems: 20,
        itemFields: [
          field('description', 'Description', 'text'),
          field('quantity', 'Quantity', 'number'),
        ],
      }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Delivery challan' },
      { type: 'paragraph', text: 'Challan {{challanNo}} · {{challanDate}}' },
      { type: 'paragraph', text: 'From {{senderName}} to {{receiverName}}' },
      { type: 'paragraph', text: 'Destination: {{destination}}' },
      {
        type: 'lineItems',
        field: 'items',
        columns: [
          { header: 'Description', key: 'description' },
          { header: 'Quantity', key: 'quantity' },
        ],
      },
      {
        type: 'paragraph',
        text: 'This challan lists quantities only. It does not state tax or transfer ownership unless your invoice says so.',
      },
      { type: 'signature', label: 'Sender', nameField: 'senderName' },
    ],
    paragraphs: [],
    kind: 'RECEIPT',
    considerations: [
      'If a movement of goods needs an e-way bill or a tax invoice, follow that requirement separately. This sample does not generate those filings.',
    ],
    sample: 'Challan number, parties, destination, and quantities. No price column.',
    faqs: [
      faq(
        'Is a challan a GST invoice?',
        'No. Raise a tax invoice through your billing process when tax law requires one.',
      ),
      faq('Should I include value?', 'This format is a quantity note. Put prices on the invoice.'),
    ],
    related: ['purchase-order', 'standard-invoice'],
  }),
  simpleLetter({
    slug: 'payment-receipt',
    name: 'Payment receipt',
    categorySlug: 'billing-documents',
    keyword: 'payment receipt format',
    secondary: ['cash receipt format'],
    summary:
      'Issue a payment receipt for money received against an invoice or other purpose you name.',
    about:
      'A payment receipt acknowledges money received. It can refer to an invoice number if you already issued one.',
    when: 'Give it to a customer after you receive payment.',
    info: ['Amount', 'Payer', 'Purpose or invoice reference'],
    fields: receiptFields('payment'),
    blocks: receiptBlocks('Payment receipt'),
    kind: 'RECEIPT',
    paragraphs: [],
    considerations: [
      'Write the invoice number in the purpose line if this receipt settles a specific invoice.',
    ],
    sample: 'Receipt number, payer, amount, mode, and purpose.',
    faqs: [
      faq(
        'Can one receipt cover part of an invoice?',
        'Yes. State that in the purpose so the balance is not mistaken for zero.',
      ),
      faq(
        'Does this update my accounts automatically?',
        'No. Enter the receipt in your own books as well.',
      ),
    ],
    related: ['standard-invoice', 'payment-acknowledgement'],
  }),
  simpleLetter({
    slug: 'school-leave-application',
    name: 'School leave application',
    categorySlug: 'school-requests',
    keyword: 'school leave application',
    secondary: ['leave letter for school'],
    summary:
      'Write a parent’s school leave application with the student’s class and the dates of absence.',
    about:
      'A school leave application is a parent or guardian’s request that a student be allowed to miss class on stated dates.',
    when: 'Send it when the school asks for a written leave note.',
    info: ['Student name', 'Class', 'Dates', 'Reason you choose to share'],
    extraFields: [
      field('studentName', 'Student name', 'text'),
      field('className', 'Class', 'text'),
      field('fromDate', 'From', 'date'),
      field('toDate', 'To', 'date'),
      field('reason', 'Reason', 'textarea', { required: false }),
    ],
    paragraphs: [
      'Please grant leave to my child {{studentName}} of {{className}} from {{fromDate}} to {{toDate}}.',
      '{{reason}}',
      'I will ensure pending classwork is completed after they return.',
    ],
    signLabel: 'Parent or guardian',
    considerations: [
      'Some schools want a medical note for sick leave. Attach whatever the school asked for, outside this letter.',
    ],
    sample: 'Parent name, student, class, dates, and an optional reason.',
    faqs: [
      faq(
        'Can a student write this?',
        'The signature line is for a parent or guardian. Follow the school rule if older students may write for themselves.',
      ),
      faq('Does the school have to approve it?', 'No. The letter is a request.'),
    ],
    related: ['leave-application', 'fee-concession-request'],
  }),
  simpleLetter({
    slug: 'fee-concession-request',
    name: 'Fee concession request',
    categorySlug: 'school-requests',
    keyword: 'fee concession application',
    secondary: ['school fee concession letter'],
    summary: 'Ask a school or college for a fee concession and state the reason in your own words.',
    about:
      'A fee concession request asks an institution to consider reducing or deferring fees. The institution decides.',
    when: 'Use it when the school or college invites written requests for concession.',
    info: ['Student name', 'Class or course', 'The concession you are asking for'],
    extraFields: [
      field('studentName', 'Student name', 'text'),
      field('course', 'Class or course', 'text'),
      field('ask', 'Concession requested', 'text'),
      field('reason', 'Reason', 'textarea'),
    ],
    paragraphs: [
      'I request a fee concession for {{studentName}}, enrolled in {{course}}.',
      'The request is: {{ask}}.',
      '{{reason}}',
      'I understand the institution may ask for documents and may decline the request.',
    ],
    considerations: [
      'Do not attach income or identity numbers to this letter. Provide documents only through the channel the institution names.',
    ],
    sample: 'Student, course, the concession asked for, and a short reason.',
    faqs: [
      faq('Will this guarantee a discount?', 'No. Only the institution can grant it.'),
      faq(
        'Should I mention a percentage?',
        'Only if you are asking for a specific figure and you type it in the request line.',
      ),
    ],
    related: ['school-leave-application', 'formal-request-letter'],
  }),
  simpleLetter({
    slug: 'contractor-quotation',
    name: 'Contractor quotation',
    categorySlug: 'contractor-documents',
    keyword: 'contractor quotation format',
    secondary: ['construction quotation format'],
    summary:
      'Quote construction or repair work with line items, a site address, and a validity date.',
    about:
      'A contractor quotation lists proposed work, quantities, and rates for a site, and stays open until the date the contractor sets.',
    when: 'Use it when a homeowner asks for a written price before work starts.',
    info: ['Site address', 'Work items', 'Validity date'],
    fields: [
      field('quoteDate', 'Date', 'date'),
      field('contractorName', 'Contractor', 'text'),
      field('clientName', 'Client', 'text'),
      field('siteAddress', 'Site address', 'address'),
      field('validUntil', 'Valid until', 'date'),
      field('items', 'Work items', 'repeat', {
        maxItems: 20,
        itemFields: [
          field('description', 'Description', 'text'),
          field('quantity', 'Quantity', 'number'),
          field('rate', 'Rate', 'currency'),
        ],
      }),
      field('notes', 'Exclusions or notes', 'textarea', {
        required: false,
        helpText: 'Say what is not included, in your own words.',
      }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Contractor quotation' },
      { type: 'paragraph', text: 'Date: {{quoteDate}} · Valid until {{validUntil}}' },
      { type: 'paragraph', text: 'Contractor: {{contractorName}}' },
      { type: 'paragraph', text: 'Client: {{clientName}}' },
      { type: 'paragraph', text: 'Site: {{siteAddress}}' },
      {
        type: 'lineItems',
        field: 'items',
        columns: [
          { header: 'Work', key: 'description' },
          { header: 'Qty', key: 'quantity' },
          { header: 'Rate', key: 'rate', format: 'currency' },
          { header: 'Amount', product: ['quantity', 'rate'], format: 'currency' },
        ],
      },
      { type: 'paragraph', text: '{{notes}}' },
      {
        type: 'paragraph',
        text: 'This quotation is not a construction contract. Rates cover only the lines above.',
      },
      { type: 'signature', label: 'Contractor', nameField: 'contractorName' },
    ],
    paragraphs: [],
    kind: 'INVOICE',
    considerations: [
      'Measure quantities on site or say in the notes that quantities are provisional. Do not hide extra charges.',
    ],
    sample: 'Contractor, client, site, validity, work table, and exclusions you type.',
    faqs: [
      faq(
        'Does this include material and labour?',
        'Only the descriptions you type. Label each line so the client can see what it covers.',
      ),
      faq(
        'Where can I estimate quantities?',
        'Varnarc construction calculators can help you estimate quantities before you type them here.',
      ),
    ],
    related: ['quotation', 'purchase-order'],
    tools: publishedSupport.construction,
  }),
  simpleLetter({
    slug: 'vehicle-delivery-receipt',
    name: 'Vehicle delivery receipt',
    categorySlug: 'vehicle-records',
    keyword: 'vehicle delivery receipt',
    secondary: ['vehicle handover receipt'],
    summary:
      'Record that a vehicle was handed over, with the registration text you type and the odometer reading.',
    about:
      'A vehicle delivery receipt notes that a described vehicle was handed from one person to another on a date, with the reading they enter.',
    when: 'Use it when a buyer, seller, or workshop wants a simple handover note.',
    info: [
      'Vehicle description',
      'Registration as printed on the papers',
      'Odometer',
      'Both names',
    ],
    fields: [
      field('handoverDate', 'Date', 'date'),
      field('vehicle', 'Vehicle make and model', 'text'),
      field('registrationText', 'Registration number', 'text', {
        helpText:
          'Copy it from the registration certificate. This note does not transfer ownership.',
      }),
      field('odometer', 'Odometer reading', 'text'),
      field('fromPerson', 'Handed over by', 'text'),
      field('toPerson', 'Received by', 'text'),
      field('notes', 'Visible condition notes', 'textarea', { required: false }),
    ],
    blocks: [
      { type: 'heading', level: 1, text: 'Vehicle delivery receipt' },
      { type: 'paragraph', text: 'Date: {{handoverDate}}' },
      { type: 'paragraph', text: 'Vehicle: {{vehicle}}' },
      { type: 'paragraph', text: 'Registration: {{registrationText}}' },
      { type: 'paragraph', text: 'Odometer: {{odometer}}' },
      { type: 'paragraph', text: 'Handed over by {{fromPerson}} to {{toPerson}}.' },
      { type: 'paragraph', text: '{{notes}}' },
      {
        type: 'paragraph',
        text: 'This receipt does not transfer registration. Ownership transfer is completed only through the transport authority process.',
      },
      { type: 'signature', label: 'Handed over by', nameField: 'fromPerson' },
      { type: 'signature', label: 'Received by', nameField: 'toPerson' },
    ],
    paragraphs: [],
    kind: 'RECEIPT',
    requiresReview: true,
    disclaimer:
      'A delivery note is not a sale deed and does not update the registration certificate. Use the transport authority’s process for ownership transfer.',
    considerations: [
      'Write damage you can see. Do not state that the vehicle is legally clear unless you have checked.',
    ],
    sample:
      'Date, vehicle, registration text, odometer, both names, and a warning that ownership is unchanged.',
    faqs: [
      faq(
        'Does this replace Form 29 or Form 30?',
        'No. Those are transport-authority forms. This is only a handover note.',
      ),
      faq(
        'Should I take photographs?',
        'If the condition matters, keep your own photos. This form stores only the text you type when you save it.',
      ),
    ],
    related: ['payment-receipt', 'payment-acknowledgement'],
    tools: publishedSupport.automobile,
  }),
];
