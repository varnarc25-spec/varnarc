import { EMPLOYER_DISCLAIMER, field, simpleLetter, type SeedTemplate } from './define';
import type { DocumentBlock, DocumentField } from '@varnarc/validation';

const calc = [{ label: 'Finance calculators', href: '/calculators' }];
const construction = [{ label: 'Construction calculators', href: '/construction' }];
const automobile = [{ label: 'Automobile tools', href: '/automobile' }];
const loans = [{ label: 'Loan guides', href: '/finance/loans' }];

function faq(question: string, answer: string) {
  return { question, answer };
}

const resumeFields: DocumentField[] = [
  field('fullName', 'Full name', 'text'),
  field('headline', 'Headline', 'text', {
    required: false,
    helpText: 'Example: Accountant with GST experience',
  }),
  field('email', 'Email', 'email'),
  field('phone', 'Phone', 'phone'),
  field('city', 'City', 'text'),
  field('summary', 'Profile summary', 'textarea'),
  field('skills', 'Skills', 'textarea'),
  field('experience', 'Experience', 'repeat', {
    maxItems: 8,
    itemFields: [
      field('role', 'Role', 'text'),
      field('organisation', 'Organisation', 'text'),
      field('dates', 'Dates', 'text'),
      field('details', 'What you did', 'textarea'),
    ],
  }),
  field('education', 'Education', 'repeat', {
    required: false,
    maxItems: 6,
    itemFields: [
      field('qualification', 'Qualification', 'text'),
      field('institution', 'Institution', 'text'),
      field('year', 'Year', 'text', { required: false }),
    ],
  }),
];

const resumeBlocks: DocumentBlock[] = [
  { type: 'heading', level: 1, text: '{{fullName}}' },
  { type: 'paragraph', text: '{{headline}}' },
  { type: 'paragraph', text: '{{city}} · {{phone}} · {{email}}' },
  { type: 'heading', level: 2, text: 'Profile' },
  { type: 'paragraph', text: '{{summary}}' },
  { type: 'heading', level: 2, text: 'Experience' },
  {
    type: 'repeat',
    field: 'experience',
    blocks: [
      { type: 'heading', level: 3, text: '{{item.role}} — {{item.organisation}}' },
      { type: 'paragraph', text: '{{item.dates}}' },
      { type: 'paragraph', text: '{{item.details}}' },
    ],
  },
  { type: 'heading', level: 2, text: 'Education' },
  {
    type: 'repeat',
    field: 'education',
    blocks: [
      { type: 'paragraph', text: '{{item.qualification}}, {{item.institution}} ({{item.year}})' },
    ],
  },
  { type: 'heading', level: 2, text: 'Skills' },
  { type: 'paragraph', text: '{{skills}}' },
];

export const publishedTemplates: SeedTemplate[] = [
  simpleLetter({
    slug: 'resume-cv',
    name: 'Resume',
    categorySlug: 'resumes-and-applications',
    keyword: 'resume format',
    secondary: ['cv format india', 'resume pdf'],
    summary:
      'Build a one-page resume from your roles, education, and skills, then download PDF or Word.',
    about:
      'A resume summarises work you have done so an employer can scan it quickly. This generator prints only the lines you enter.',
    when: 'Use it when you apply for a job, internship, or freelance assignment and need a clean file.',
    info: ['Contact details', 'Recent roles', 'Education', 'Skills'],
    paragraphs: [],
    fields: resumeFields,
    blocks: resumeBlocks,
    kind: 'APPLICATION',
    considerations: ['Keep claims accurate. Employers may ask for proof of the roles you list.'],
    sample: 'Name and contact line, a short profile, then each role with dates and a description.',
    faqs: [
      faq(
        'Does this resume include a photo or Aadhaar number?',
        'No. Add a photo only if the employer asks, and keep identity numbers off the resume.',
      ),
      faq(
        'Can I download it without an account?',
        'Yes. Free templates can be previewed and downloaded without registration.',
      ),
    ],
    related: ['cover-letter', 'joining-letter'],
    tools: calc,
  }),
  simpleLetter({
    slug: 'cover-letter',
    name: 'Cover letter',
    categorySlug: 'resumes-and-applications',
    keyword: 'cover letter format',
    secondary: ['job application letter'],
    summary:
      'Write a short cover letter that names the role, your fit, and how you can be contacted.',
    about:
      'A cover letter sits with a resume. It tells the reader which role you want and why you are writing.',
    when: 'Send it when an application asks for a letter in addition to a resume.',
    info: ['Role you want', 'Employer name', 'One or two reasons you fit'],
    extraFields: [
      field('role', 'Role applied for', 'text'),
      field('fit', 'Why you fit', 'textarea'),
    ],
    paragraphs: [
      'I am applying for the {{role}} position at {{toOrganization}}.',
      '{{fit}}',
      'My resume is attached. I would be glad to answer questions about my experience.',
    ],
    considerations: ['Match the role title to the advertisement so the letter is easy to file.'],
    sample: 'Date, recipient, the role name, a short fit paragraph, and your signature.',
    faqs: [
      faq(
        'Should a cover letter repeat the whole resume?',
        'No. Point to the resume and add only the context that the resume does not show.',
      ),
      faq('Can I change the greeting?', 'Yes. The preview uses the recipient name you type.'),
    ],
    related: ['resume-cv', 'recommendation-letter'],
  }),
  simpleLetter({
    slug: 'resignation-letter',
    name: 'Resignation letter',
    categorySlug: 'employment-letters',
    keyword: 'resignation letter format',
    secondary: ['resignation letter pdf', 'resignation letter with notice period'],
    summary: 'Prepare a resignation letter with your role, notice period, and last working day.',
    about:
      'A resignation letter tells your employer that you are leaving and states the last day you expect to work.',
    when: 'Use it when your workplace expects a written resignation rather than only a verbal notice.',
    info: ['Your designation', 'Notice period', 'Last working day'],
    extraFields: [
      field('designation', 'Your designation', 'text'),
      field('noticePeriod', 'Notice period', 'text', { placeholder: '30 days' }),
      field('lastWorkingDay', 'Last working day', 'date'),
      field('reason', 'Optional reason', 'textarea', { required: false }),
    ],
    paragraphs: [
      'Please accept this letter as notice of my resignation from the position of {{designation}}.',
      'I will work through a notice period of {{noticePeriod}}. My last working day will be {{lastWorkingDay}}.',
      '{{reason}}',
      'I will complete the handover your team asks for. Please confirm the exit formalities.',
    ],
    considerations: [
      'Check the notice clause in your appointment letter before you commit to a last day.',
      'This letter does not calculate gratuity, leave encashment, or other dues.',
    ],
    sample:
      'Subject line, designation, notice length, last working day, and a request to confirm the exit process.',
    faqs: [
      faq(
        'Is this resignation letter legally binding by itself?',
        'It records what you are telling your employer. Your contract and local employment rules still decide notice and dues.',
      ),
      faq(
        'Can I leave the reason blank?',
        'Yes. The reason line is omitted when you leave it empty.',
      ),
    ],
    related: ['relieving-letter', 'experience-certificate', 'leave-application'],
    tools: calc,
  }),
  simpleLetter({
    slug: 'experience-certificate',
    name: 'Experience certificate',
    categorySlug: 'employment-certificates',
    keyword: 'experience letter format',
    secondary: ['experience certificate pdf'],
    summary: 'Draft an experience certificate with the employee name, role, and dates of service.',
    about:
      'An experience certificate is a letter an employer issues to confirm that a person worked in a role between two dates.',
    when: 'Employers prepare it when an employee asks for proof of service for a new job or a visa file.',
    info: ['Employee name', 'Designation', 'Date of joining', 'Date of leaving'],
    extraFields: [
      field('employeeName', 'Employee name', 'text'),
      field('designation', 'Designation', 'text'),
      field('joinedOn', 'Date of joining', 'date'),
      field('leftOn', 'Date of leaving', 'date'),
    ],
    paragraphs: [
      'This is to record that {{employeeName}} worked with {{toOrganization}} as {{designation}}.',
      'The employment dates entered for this sample are {{joinedOn}} to {{leftOn}}.',
      'The organisation should issue the final letter on its letterhead only after matching these dates to its records.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: ['Do not present a sample download as a certificate issued by an employer.'],
    sample:
      'Employee name, designation, joining date, leaving date, and a signature line for the employer.',
    faqs: [
      faq(
        'Will Varnarc sign this certificate?',
        'No. The signature line is a placeholder for the organisation that actually employed the person.',
      ),
      faq(
        'Does this include salary?',
        'No. Use the salary certificate sample if the employer also needs to state pay.',
      ),
    ],
    related: ['relieving-letter', 'salary-certificate', 'resignation-letter'],
  }),
  simpleLetter({
    slug: 'relieving-letter',
    name: 'Relieving letter',
    categorySlug: 'employment-certificates',
    keyword: 'relieving letter format',
    secondary: ['relieving letter pdf'],
    summary:
      'Draft a relieving letter that records the employee name, role, and the date duties ended.',
    about:
      'A relieving letter says the employer has released the employee from duties on a stated date. It is separate from an experience certificate.',
    when: 'Employers issue it after resignation formalities, when a new employer asks for a relieving letter.',
    info: ['Employee name', 'Designation', 'Relieving date'],
    extraFields: [
      field('employeeName', 'Employee name', 'text'),
      field('designation', 'Designation', 'text'),
      field('relievedOn', 'Relieved on', 'date'),
    ],
    paragraphs: [
      'This sample records that {{employeeName}}, who worked as {{designation}}, was relieved from duties on {{relievedOn}}.',
      'Issue the final letter only if your exit checklist is complete and the date matches your attendance records.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: [
      'A relieving letter should not invent pending dues or clearances that have not been checked.',
    ],
    sample: 'Employee name, designation, relieving date, and an authorised signature line.',
    faqs: [
      faq(
        'Is a relieving letter the same as an experience letter?',
        'No. Relieving confirms release from duties. Experience confirms the period and role.',
      ),
      faq(
        'Can an employee generate the official copy?',
        'The employee can prepare a draft. The employer issues the copy that other companies will rely on.',
      ),
    ],
    related: ['experience-certificate', 'resignation-letter'],
  }),
  simpleLetter({
    slug: 'salary-certificate',
    name: 'Salary certificate',
    categorySlug: 'employment-certificates',
    keyword: 'salary certificate format',
    secondary: ['salary certificate pdf'],
    summary:
      'Draft a salary certificate with the employee, designation, and monthly gross pay you enter.',
    about:
      'A salary certificate is an employer letter that states a person’s designation and the monthly gross pay figure the employer confirms.',
    when: 'Banks, landlords, and visa desks sometimes ask an employer for a salary certificate.',
    info: ['Employee name', 'Designation', 'Monthly gross pay', 'The month the figure applies to'],
    extraFields: [
      field('employeeName', 'Employee name', 'text'),
      field('designation', 'Designation', 'text'),
      field('monthlyGross', 'Monthly gross pay', 'currency'),
      field('payMonth', 'Pay month', 'text', { placeholder: 'October 2026' }),
    ],
    paragraphs: [
      'This sample states that {{employeeName}} is employed as {{designation}}.',
      'The monthly gross pay entered for {{payMonth}} is {{monthlyGross}}. The employer must check payroll before issuing this on letterhead.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: [
      'Do not add PF, tax, or net-pay breakup unless payroll has produced those figures.',
    ],
    sample:
      'Employee, designation, a single monthly gross figure, the month it refers to, and a signature line.',
    faqs: [
      faq(
        'Does this calculate income tax?',
        'No. It prints the gross amount you type. Tax certificates come from payroll or the income-tax filing system.',
      ),
      faq(
        'Should I put my bank account number here?',
        'No. A salary certificate does not need the account number.',
      ),
    ],
    related: ['experience-certificate', 'offer-letter'],
    tools: calc,
  }),
  simpleLetter({
    slug: 'offer-letter',
    name: 'Offer letter',
    categorySlug: 'employment-certificates',
    keyword: 'offer letter format',
    secondary: ['job offer letter'],
    summary:
      'Draft an offer letter with the role, start date, and monthly gross pay you intend to offer.',
    about:
      'An offer letter tells a candidate the role, start date, and pay an organisation is willing to offer, subject to its own checks.',
    when: 'Use the draft when a hiring manager wants a written offer before an appointment letter.',
    info: ['Candidate name', 'Role', 'Start date', 'Monthly gross pay', 'Work location'],
    extraFields: [
      field('candidateName', 'Candidate name', 'text'),
      field('role', 'Role', 'text'),
      field('startDate', 'Start date', 'date'),
      field('monthlyGross', 'Monthly gross pay', 'currency'),
      field('workLocation', 'Work location', 'text'),
    ],
    paragraphs: [
      'We are pleased to offer {{candidateName}} the position of {{role}} at {{toOrganization}}.',
      'The proposed start date is {{startDate}}. The monthly gross pay entered in this draft is {{monthlyGross}}. The work location is {{workLocation}}.',
      'This draft is subject to the checks and appointment process your organisation actually uses. It does not add bonus, bond, or probation terms you have not typed.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: [
      'Add probation, bonus, or bond terms only after your HR policy is written into the letter.',
    ],
    sample:
      'Candidate, role, start date, gross pay, location, and a note that other terms are not implied.',
    faqs: [
      faq(
        'Does the offer include a bond?',
        'Only if you write that term yourself. This template does not insert a service bond.',
      ),
      faq(
        'Is an offer the same as an appointment letter?',
        'No. An appointment letter is issued when employment actually starts.',
      ),
    ],
    related: ['appointment-letter', 'joining-letter'],
  }),
  simpleLetter({
    slug: 'appointment-letter',
    name: 'Appointment letter',
    categorySlug: 'employment-certificates',
    keyword: 'appointment letter format',
    secondary: ['joining appointment letter'],
    summary: 'Draft an appointment letter with the employee, role, start date, and workplace.',
    about:
      'An appointment letter confirms that an organisation has appointed a person to a role from a stated date.',
    when: 'HR prepares it when a candidate joins and needs a document naming the role and start date.',
    info: ['Employee name', 'Role', 'Start date', 'Workplace'],
    extraFields: [
      field('employeeName', 'Employee name', 'text'),
      field('role', 'Role', 'text'),
      field('startDate', 'Start date', 'date'),
      field('workplace', 'Workplace', 'text'),
    ],
    paragraphs: [
      '{{toOrganization}} appoints {{employeeName}} as {{role}} with effect from {{startDate}}.',
      'The workplace entered for this draft is {{workplace}}. Attach your standard terms instead of relying on this sample alone.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: [
      'Company policy, probation, and benefits should come from your approved HR text, not from guessed clauses.',
    ],
    sample: 'Employer, employee, role, start date, workplace, and a signature line.',
    faqs: [
      faq(
        'Can this replace an employment contract?',
        'No. It is a short appointment record. A contract needs terms your lawyer or HR has approved.',
      ),
      faq(
        'Who signs it?',
        'An authorised person at the employer. The line on the page is only a placeholder.',
      ),
    ],
    related: ['offer-letter', 'joining-letter'],
  }),
  simpleLetter({
    slug: 'internship-certificate',
    name: 'Internship certificate',
    categorySlug: 'employment-certificates',
    keyword: 'internship certificate format',
    secondary: ['internship completion certificate'],
    summary: 'Draft an internship certificate with the intern name, team, and internship dates.',
    about:
      'An internship certificate records that a person interned with an organisation between two dates.',
    when: 'Organisations prepare it when an intern needs proof for college or a job application.',
    info: ['Intern name', 'Team or project', 'Start date', 'End date'],
    extraFields: [
      field('internName', 'Intern name', 'text'),
      field('team', 'Team or project', 'text'),
      field('startedOn', 'Start date', 'date'),
      field('endedOn', 'End date', 'date'),
    ],
    paragraphs: [
      'This sample records that {{internName}} interned with {{toOrganization}} on {{team}} from {{startedOn}} to {{endedOn}}.',
      'Describe performance only if a supervisor has actually reviewed the work. This draft does not award a grade.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Supervisor',
    considerations: [
      'College formats differ. Check the format your institution asked for before issuing the letter.',
    ],
    sample: 'Intern name, team, start date, end date, and a supervisor signature line.',
    faqs: [
      faq(
        'Does this include a stipend figure?',
        'No. Add a stipend only if finance has confirmed the amount and you type it into a revised draft.',
      ),
      faq(
        'Is this a college bonafide certificate?',
        'No. Colleges issue bonafide certificates about enrolment. This sample is about an internship.',
      ),
    ],
    related: ['experience-certificate', 'recommendation-letter'],
  }),
  simpleLetter({
    slug: 'joining-letter',
    name: 'Joining letter',
    categorySlug: 'employment-letters',
    keyword: 'joining letter format',
    secondary: ['joining report letter'],
    summary: 'Write a joining letter that confirms you reported for work on a given date and role.',
    about:
      'A joining letter is the employee’s note that they reported for duty in a role on a particular date.',
    when: 'Submit it on your first day if HR asks for a written joining report.',
    info: ['Role', 'Date you joined', 'Reporting manager'],
    extraFields: [
      field('role', 'Role', 'text'),
      field('joinedOn', 'Date of joining', 'date'),
      field('managerName', 'Reporting manager', 'text'),
    ],
    paragraphs: [
      'I confirm that I joined {{toOrganization}} as {{role}} on {{joinedOn}}.',
      'I am reporting to {{managerName}}. Please let me know if any joining form is still pending.',
    ],
    considerations: ['Use the date HR recorded, not a date you hope will be regularised later.'],
    sample: 'Employee name, organisation, role, joining date, and reporting manager.',
    faqs: [
      faq(
        'Is a joining letter written by the employee?',
        'Yes. The employer’s appointment letter is a different document.',
      ),
      faq(
        'Do I need to mention salary?',
        'Not in this letter. Salary belongs in the offer or payroll records.',
      ),
    ],
    related: ['appointment-letter', 'offer-letter'],
  }),
  simpleLetter({
    slug: 'leave-application',
    name: 'Leave application',
    categorySlug: 'employment-letters',
    keyword: 'leave application for office',
    secondary: ['office leave letter'],
    summary:
      'Write an office leave application with the dates, leave type, and who will cover your work.',
    about:
      'A leave application asks a manager for time away from work and states the dates and the reason you choose to share.',
    when: 'Send it before casual leave, sick leave, or earned leave if your office wants a written request.',
    info: ['Leave type', 'From date', 'To date', 'Backup colleague if you have one'],
    extraFields: [
      field('leaveType', 'Leave type', 'select', {
        options: [
          { value: 'Casual leave', label: 'Casual leave' },
          { value: 'Sick leave', label: 'Sick leave' },
          { value: 'Earned leave', label: 'Earned leave' },
          { value: 'Unpaid leave', label: 'Unpaid leave' },
        ],
      }),
      field('fromDate', 'From', 'date'),
      field('toDate', 'To', 'date'),
      field('backup', 'Colleague covering the work', 'text', { required: false }),
      field('reason', 'Reason', 'textarea', { required: false }),
    ],
    paragraphs: [
      'Please grant me {{leaveType}} from {{fromDate}} to {{toDate}}.',
      '{{reason}}',
      '{{backup}}',
      'I will share any handover notes you need before I am away.',
    ],
    considerations: [
      'Leave balance and medical-certificate rules come from your office policy, which this form does not know.',
    ],
    sample: 'Leave type, start date, end date, optional reason, and optional cover person.',
    faqs: [
      faq(
        'Will this check my leave balance?',
        'No. Your HR system is the record of balance. This letter only states the request.',
      ),
      faq('Can I apply for a single day?', 'Yes. Use the same date in both date fields.'),
    ],
    related: ['work-from-home-request', 'school-leave-application'],
  }),
  simpleLetter({
    slug: 'work-from-home-request',
    name: 'Work-from-home request',
    categorySlug: 'employment-letters',
    keyword: 'work from home request letter',
    secondary: ['wfh application'],
    summary: 'Ask to work from home for specific dates and say how you will stay reachable.',
    about:
      'A work-from-home request asks a manager for permission to work away from the office on named dates.',
    when: 'Use it when remote work is allowed only with approval.',
    info: ['Dates', 'Reason you want to share', 'How you can be reached'],
    extraFields: [
      field('fromDate', 'From', 'date'),
      field('toDate', 'To', 'date'),
      field('arrangement', 'Arrangement', 'select', {
        options: [
          { value: 'Full days away from office', label: 'Full days away from office' },
          { value: 'Part of each day in office', label: 'Part of each day in office' },
        ],
      }),
      field('reachMe', 'How to reach you', 'text', {
        helpText: 'Phone or work email only. Do not add passwords.',
      }),
      field('reason', 'Reason', 'textarea', { required: false }),
    ],
    paragraphs: [
      'I request permission to work from home from {{fromDate}} to {{toDate}}.',
      'The arrangement I am asking for is: {{arrangement}}.',
      'You can reach me at {{reachMe}}.',
      '{{reason}}',
    ],
    considerations: ['Your manager can refuse. This letter does not change office policy.'],
    sample: 'Dates, whether the days are fully remote, a contact method, and an optional reason.',
    faqs: [
      faq(
        'Does approval happen automatically?',
        'No. The letter is a request. Approval is your manager’s decision.',
      ),
      faq(
        'Should I include my home address?',
        'Only if your office requires it. The contact line can be a phone number or work email.',
      ),
    ],
    related: ['leave-application', 'permission-letter'],
  }),
  simpleLetter({
    slug: 'promotion-letter',
    name: 'Promotion letter',
    categorySlug: 'employment-certificates',
    keyword: 'promotion letter format',
    secondary: ['employee promotion letter'],
    summary: 'Draft a promotion letter with the employee, new role, and the date the role starts.',
    about:
      'A promotion letter tells an employee the new role and the date it takes effect. Pay changes belong in the figure you type, not in an assumed increment.',
    when: 'HR uses it after a promotion has been approved internally.',
    info: ['Employee name', 'New role', 'Effective date', 'New monthly gross if it is changing'],
    extraFields: [
      field('employeeName', 'Employee name', 'text'),
      field('newRole', 'New role', 'text'),
      field('effectiveOn', 'Effective date', 'date'),
      field('newGross', 'New monthly gross pay', 'currency', {
        required: false,
        helpText: 'Leave blank if pay is unchanged or not final.',
      }),
    ],
    paragraphs: [
      '{{toOrganization}} is promoting {{employeeName}} to {{newRole}} with effect from {{effectiveOn}}.',
      'New monthly gross pay, if entered: {{newGross}}.',
      'Other benefits stay as already approved by the organisation. This draft does not invent new allowances.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: ['Do not announce a pay change until payroll has confirmed the number.'],
    sample: 'Employee, new role, effective date, and an optional new gross figure.',
    faqs: [
      faq('What if pay is not changing?', 'Leave the pay field empty. That sentence is omitted.'),
      faq(
        'Does this change the appointment letter?',
        'Only the points you write here. Unstated terms stay whatever your existing records say.',
      ),
    ],
    related: ['increment-letter', 'appointment-letter'],
  }),
  simpleLetter({
    slug: 'increment-letter',
    name: 'Increment letter',
    categorySlug: 'employment-certificates',
    keyword: 'increment letter format',
    secondary: ['salary increment letter'],
    summary: 'Draft an increment letter with the revised monthly gross pay and the date it starts.',
    about:
      'An increment letter tells an employee the revised monthly gross pay and the date the revision starts.',
    when: 'Use it after a pay revision has been approved and the new figure is final.',
    info: ['Employee name', 'Revised monthly gross', 'Effective date'],
    extraFields: [
      field('employeeName', 'Employee name', 'text'),
      field('revisedGross', 'Revised monthly gross', 'currency'),
      field('effectiveOn', 'Effective date', 'date'),
    ],
    paragraphs: [
      'The monthly gross pay of {{employeeName}} will be {{revisedGross}} from {{effectiveOn}}.',
      'This draft states only the gross figure you entered. It does not split the amount into allowances or tax.',
    ],
    kind: 'CERTIFICATE',
    requiresReview: true,
    disclaimer: EMPLOYER_DISCLAIMER,
    signLabel: 'Authorised signatory',
    considerations: ['Payroll should match this figure before the letter is handed over.'],
    sample: 'Employee name, one revised gross amount, effective date, and a signature line.',
    faqs: [
      faq(
        'Should I show the old salary as well?',
        'Only if you want to. This template prints the new gross figure so the letter stays short.',
      ),
      faq('Is the amount annual or monthly?', 'Monthly gross, in rupees, as labelled on the form.'),
    ],
    related: ['promotion-letter', 'salary-certificate'],
    tools: calc,
  }),
];

export const publishedSupport = { calc, construction, automobile, loans };
