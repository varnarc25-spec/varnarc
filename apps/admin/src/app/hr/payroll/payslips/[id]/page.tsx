import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiServerFetch } from '@/lib/api';
import { PayslipActions } from './payslip-actions';

type Payslip = {
  id: string;
  createdAt: string;
  basic: string;
  hra: string;
  specialAllowance: string;
  leaveTravelAllowance: string;
  professionalTax: string;
  providentFund: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  employee: {
    fullName: string;
    employeeCode: string;
    email: string | null;
    jobTitle: string;
    pan: string | null;
    bankAccountNo: string | null;
    ifscCode: string | null;
    joinedOn: string | null;
    department: { name: string } | null;
  };
  payrollRun: {
    period: string;
    companyName: string;
    companyAddress: string;
  };
  company: {
    phone: string | null;
    email: string | null;
    gstin: string | null;
    logoDataUrl: string | null;
  };
  ytd: {
    grossPay: number;
    deductions: number;
    providentFund: number;
  };
};

const BELOW_TWENTY = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(value: number) {
  if (value < 20) return BELOW_TWENTY[value] ?? '';
  const ten = Math.floor(value / 10);
  const one = value % 10;
  return one ? `${TENS[ten]} ${BELOW_TWENTY[one]}` : TENS[ten];
}

function threeDigits(value: number) {
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return [hundred ? `${BELOW_TWENTY[hundred]} Hundred` : '', rest ? twoDigits(rest) : '']
    .filter(Boolean)
    .join(' ');
}

function rupeesInWords(amount: number) {
  const whole = Math.floor(amount + 1e-6);
  const paise = Math.round((amount - whole) * 100);
  const crore = Math.floor(whole / 10_000_000);
  const lakh = Math.floor((whole % 10_000_000) / 100_000);
  const thousand = Math.floor((whole % 100_000) / 1000);
  const rest = whole % 1000;
  const parts = [
    crore ? `${threeDigits(crore)} Crore` : '',
    lakh ? `${threeDigits(lakh)} Lakh` : '',
    thousand ? `${threeDigits(thousand)} Thousand` : '',
    rest ? threeDigits(rest) : '',
  ].filter(Boolean);
  let text = `${parts.join(' ') || 'Zero'} Rupees`;
  if (paise) text += ` and ${twoDigits(paise)} Paise`;
  return `${text} Only`;
}

function inr(value: number) {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function money(value: string | number) {
  return inr(Number(value) || 0);
}

function day(value: string | null) {
  if (!value) return '—';
  const [year, month, date] = value.slice(0, 10).split('-');
  if (!year || !month || !date) return '—';
  return `${date}/${month}/${year}`;
}

function periodTitle(period: string) {
  const [year, month] = period.split('-');
  const label = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `FOR ${label.toUpperCase()}`;
}

function generatedOn(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysInPeriod(period: string) {
  const [yearText, monthText] = period.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) return 30;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function filePart(value: string) {
  const slug = value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|]+/g, '');
  return slug || 'employee';
}

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '');
  return letters.join('') || 'CO';
}

export default async function HrPayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await apiServerFetch<Payslip>(`/hr/payslips/${id}`);
  if (result.status === 404) notFound();
  const slip = result.data;
  if (result.error || !slip) {
    return <p className="text-sm text-red-600">{result.error || 'Payslip not found'}</p>;
  }

  const earnings: Array<[string, number]> = [
    ['Basic Salary', Number(slip.basic) || 0],
    ['House Rent Allowance (HRA)', Number(slip.hra) || 0],
    ['Leave Travel Allowance', Number(slip.leaveTravelAllowance) || 0],
    ['Special Allowance', Number(slip.specialAllowance) || 0],
  ];
  const deductions: Array<[string, number]> = [
    ['Provident Fund (Employee)', Number(slip.providentFund) || 0],
    ['Professional Tax', Number(slip.professionalTax) || 0],
  ];
  const rows = Math.max(earnings.length, deductions.length);
  const gross = Number(slip.grossPay) || 0;
  const deductionTotal = Number(slip.deductions) || 0;
  const net = Number(slip.netPay) || 0;
  const payDays = daysInPeriod(slip.payrollRun.period);
  const contact = [
    slip.company.phone ? `Phone: ${slip.company.phone}` : '',
    slip.company.email ? `Email: ${slip.company.email}` : '',
  ]
    .filter(Boolean)
    .join(' | ');
  const identity: Array<[string, string, string, string]> = [
    ['Employee ID', slip.employee.employeeCode, 'PAN', slip.employee.pan || '—'],
    ['Employee Name', slip.employee.fullName, 'Account no.', slip.employee.bankAccountNo || '—'],
    ['Designation', slip.employee.jobTitle, 'IFSC code', slip.employee.ifscCode || '—'],
    ['Department', slip.employee.department?.name || '—', 'Pay Days', String(payDays)],
    ['Date of Joining', day(slip.employee.joinedOn), 'Paid Days', String(payDays)],
  ];
  const fileName = `payslip-${slip.employee.employeeCode}-${filePart(slip.employee.fullName)}-${slip.payrollRun.period}.pdf`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link className="text-sm text-[var(--varnarc-brand)]" href="/hr/payroll/payslips">
          All payslips
        </Link>
        <PayslipActions
          payslipId={slip.id}
          employeeEmail={slip.employee.email?.trim() || null}
          pdf={{
            fileName,
            companyName: slip.payrollRun.companyName,
            addressLines: slip.payrollRun.companyAddress
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
            contact,
            gstin: slip.company.gstin ?? '',
            logoDataUrl: slip.company.logoDataUrl,
            initials: initials(slip.payrollRun.companyName),
            periodTitle: periodTitle(slip.payrollRun.period),
            identity,
            earnings: earnings.map(([label, value]) => [label, inr(value)]),
            deductions: deductions.map(([label, value]) => [label, inr(value)]),
            gross: inr(gross),
            deductionTotal: inr(deductionTotal),
            net: inr(net),
            words: rupeesInWords(net),
            ytdGross: money(slip.ytd.grossPay),
            ytdDeductions: money(slip.ytd.deductions),
            ytdTaxable: money(slip.ytd.grossPay - slip.ytd.providentFund),
            ytdTax: inr(0),
            generatedOn: generatedOn(slip.createdAt),
          }}
        />
      </div>
      <article
        id="payslip"
        className="mx-auto max-w-[820px] bg-white px-8 py-8 text-[13px] text-slate-900"
      >
        <header className="grid grid-cols-[4.5rem_1fr_4.5rem] items-start gap-3">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center bg-white">
            {slip.company.logoDataUrl ? (
              <img
                src={slip.company.logoDataUrl}
                alt=""
                className="max-h-16 max-w-16 object-contain"
              />
            ) : (
              <span className="text-lg font-semibold tracking-wide">
                {initials(slip.payrollRun.companyName)}
              </span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold uppercase tracking-wide">
              {slip.payrollRun.companyName}
            </h1>
            {slip.payrollRun.companyAddress ? (
              <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">
                {slip.payrollRun.companyAddress}
              </p>
            ) : null}
            {contact ? <p className="text-xs leading-5 text-slate-600">{contact}</p> : null}
            {slip.company.gstin ? (
              <p className="text-xs leading-5 text-slate-600">GSTIN: {slip.company.gstin}</p>
            ) : null}
          </div>
          <div />
        </header>

        <p className="mx-auto mt-5 w-fit border border-slate-500 px-8 py-1 text-sm font-semibold tracking-wide">
          {periodTitle(slip.payrollRun.period)}
        </p>

        <table className="mt-4 w-full border-collapse">
          <tbody>
            {identity.map(([leftLabel, leftValue, rightLabel, rightValue]) => (
              <tr key={leftLabel}>
                <td className="w-[22%] border border-slate-300 px-2 py-1.5 text-slate-600">
                  {leftLabel}
                </td>
                <td className="w-[28%] border border-slate-300 px-2 py-1.5 font-medium">
                  : {leftValue}
                </td>
                <td className="w-[22%] border border-slate-300 px-2 py-1.5 text-slate-600">
                  {rightLabel}
                </td>
                <td className="w-[28%] border border-slate-300 px-2 py-1.5 font-medium">
                  : {rightValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="bg-sky-100">
              <th className="border border-sky-200 px-2 py-1.5 text-left font-semibold">
                EARNINGS
              </th>
              <th className="border border-sky-200 px-2 py-1.5 text-right font-semibold">AMOUNT</th>
              <th className="border border-sky-200 px-2 py-1.5 text-left font-semibold">
                DEDUCTIONS
              </th>
              <th className="border border-sky-200 px-2 py-1.5 text-right font-semibold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, index) => {
              const earning = earnings[index];
              const deduction = deductions[index];
              return (
                <tr key={earning?.[0] ?? deduction?.[0] ?? index}>
                  <td className="border border-slate-200 px-2 py-1.5">{earning?.[0] ?? ''}</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-right">
                    {earning ? inr(earning[1]) : ''}
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5">{deduction?.[0] ?? ''}</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-right">
                    {deduction ? inr(deduction[1]) : ''}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-sky-50 font-semibold">
              <td className="border border-sky-200 px-2 py-1.5">TOTAL EARNINGS</td>
              <td className="border border-sky-200 px-2 py-1.5 text-right">{inr(gross)}</td>
              <td className="border border-sky-200 px-2 py-1.5">TOTAL DEDUCTIONS</td>
              <td className="border border-sky-200 px-2 py-1.5 text-right">
                {inr(deductionTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-4 w-full border-collapse">
          <tbody>
            {[
              ['GROSS SALARY (A)', inr(gross)],
              ['TOTAL DEDUCTIONS (B)', inr(deductionTotal)],
              ['NET SALARY (A - B)', inr(net)],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">{label}</td>
                <td className="border border-slate-300 px-2 py-1.5 text-right font-semibold">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-xs">
          <span className="font-semibold">Amount in Words: </span>
          {rupeesInWords(net)}
        </p>

        <section className="mt-4">
          <p className="border border-sky-200 bg-sky-100 px-2 py-1 text-center text-xs font-semibold tracking-wide">
            YEAR TO DATE
          </p>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="text-center text-xs text-slate-600">
                <td className="w-1/4 border border-slate-300 px-2 py-1.5">YTD GROSS PAY</td>
                <td className="w-1/4 border border-slate-300 px-2 py-1.5">YTD TOTAL DEDUCTIONS</td>
                <td className="w-1/4 border border-slate-300 px-2 py-1.5">YTD TAXABLE PAY</td>
                <td className="w-1/4 border border-slate-300 px-2 py-1.5">YTD INCOME TAX</td>
              </tr>
              <tr className="text-center text-xs font-medium">
                <td className="border border-slate-300 px-2 py-1.5">{money(slip.ytd.grossPay)}</td>
                <td className="border border-slate-300 px-2 py-1.5">
                  {money(slip.ytd.deductions)}
                </td>
                <td className="border border-slate-300 px-2 py-1.5">
                  {money(slip.ytd.grossPay - slip.ytd.providentFund)}
                </td>
                <td className="border border-slate-300 px-2 py-1.5">{inr(0)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="mt-8 flex items-end justify-between text-[11px] text-slate-500">
          <span>This is a computer generated payslip and does not require a signature</span>
          <span>Generated On: {generatedOn(slip.createdAt)}</span>
        </footer>
      </article>
    </div>
  );
}
