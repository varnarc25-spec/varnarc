import type { ReactNode } from 'react';
import type { LaptopRentalDocument, LaptopRentalRun } from '@varnarc/validation';

function Runs({ parts }: { parts: LaptopRentalRun[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.strong ? (
          <strong key={index}>{part.text}</strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function ProposalSheet({
  document,
  logoDataUrl,
}: {
  document: LaptopRentalDocument;
  logoDataUrl?: string | null;
}) {
  return (
    <article className="mx-auto max-w-[210mm] bg-white px-8 py-10 text-slate-900 shadow-sm sm:px-12">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
              {document.kicker}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{document.headline}</h1>
          </div>
          {logoDataUrl ? (
            <img src={logoDataUrl} alt="" className="h-12 w-auto object-contain" />
          ) : null}
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Prepared for</dt>
            <dd className="mt-1 font-medium">{document.preparedFor}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Prepared by</dt>
            <dd className="mt-1 font-medium">{document.preparedBy}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Date</dt>
            <dd className="mt-1">{document.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Proposal no.</dt>
            <dd className="mt-1">{document.proposalNumber}</dd>
          </div>
        </dl>
      </header>

      <Section number="1" title="Proposal">
        {document.intro.map((paragraph) => (
          <p key={paragraph} className="mt-3 whitespace-pre-line text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </Section>

      <Section number="2" title="Proposed Laptop Specification">
        <Table
          headers={['Specification', 'Details']}
          rows={document.specifications.map((row) => [row.label, row.value])}
          align={['left', 'left']}
        />
        {document.assignedLaptops.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium">Laptops on this proposal</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {document.assignedLaptops.map((laptop) => (
                <li key={laptop}>{laptop}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section number="3" title="Rental Pricing">
        {document.modelRates && document.modelRates.rows.length > 0 ? (
          <Table
            headers={document.modelRates.headers}
            rows={document.modelRates.rows}
            align={document.modelRates.headers.map((_, index) => (index === 0 ? 'left' : 'right'))}
          />
        ) : (
          <Table
            headers={['Rental Plan', 'Rental Per Laptop', 'Quantity', 'Monthly Rental']}
            rows={document.plans.map((plan) => [
              plan.name,
              plan.perLaptop,
              plan.quantity,
              plan.monthly,
            ])}
            align={['left', 'right', 'right', 'right']}
            emphasizeLastColumn
          />
        )}
        <p className="mt-3 text-sm">
          <span className="font-medium">GST:</span> {document.gstNote}
        </p>
        <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6">
          <p className="font-medium">Recommended Plan</p>
          {document.recommended.map((row) => (
            <p key={row.label} className="mt-3">
              {row.amount ? (
                <>
                  {row.label}
                  <br />
                  <strong>{row.amount}</strong>
                </>
              ) : (
                <strong>{row.label}</strong>
              )}
            </p>
          ))}
        </div>
      </Section>

      <Section number="4" title="Security Deposit">
        <p className="mt-3 text-sm leading-6">
          {document.depositIntro ? (
            document.depositIntro
          ) : (
            <>
              A{' '}
              <strong>
                refundable security deposit of {document.depositRows[0]?.value} per laptop
              </strong>{' '}
              is applicable.
            </>
          )}
        </p>
        <Table
          headers={['Description', 'Amount']}
          rows={document.depositRows.map((row) => [row.label, row.value])}
          align={['left', 'right']}
          emphasizeLastRow
        />
        <p className="mt-3 text-sm leading-6">{document.depositNote}</p>
      </Section>

      <Section number="5" title="Services Included">
        <BulletList items={document.services} />
      </Section>

      <Section number="6" title="Support & Replacement">
        {document.support.map((paragraph) => (
          <p key={paragraph} className="mt-3 whitespace-pre-line text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </Section>

      <Section number="7" title="Customer Responsibilities">
        <p className="mt-3 text-sm">{document.responsibilitiesIntro}</p>
        <BulletList items={document.responsibilities} />
      </Section>

      <Section number="8" title="Payment Terms">
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
          {document.paymentTerms.map((parts, index) => (
            <li key={index}>
              <Runs parts={parts} />
            </li>
          ))}
        </ul>
      </Section>

      <Section number="9" title="Return of Equipment">
        <p className="mt-3 text-sm leading-6">{document.returnIntro}</p>
        <p className="mt-3 text-sm">{document.returnInspectLabel}</p>
        <BulletList items={document.returnChecks} />
        <p className="mt-3 text-sm leading-6">{document.wearNote}</p>
      </Section>

      <Section number="10" title="Acceptance">
        {document.acceptance.map((paragraph) => (
          <p key={paragraph} className="mt-3 whitespace-pre-line text-sm leading-6">
            {paragraph}
          </p>
        ))}
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <Signature
            heading={document.signatures.customerHeading}
            name={document.signatures.customerName}
            designation={document.signatures.customerDesignation}
          />
          <Signature
            heading={document.signatures.issuerHeading}
            name={document.signatures.issuerName}
            designation={document.signatures.issuerDesignation}
          />
        </div>
      </Section>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">{document.footer.name}</p>
        {document.footer.addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {document.footer.contact ? <p>{document.footer.contact}</p> : null}
        {document.footer.gstin ? <p>GSTIN: {document.footer.gstin}</p> : null}
      </footer>
    </article>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function Table({
  headers,
  rows,
  align,
  emphasizeLastColumn = false,
  emphasizeLastRow = false,
}: {
  headers: string[];
  rows: string[][];
  align: Array<'left' | 'right'>;
  emphasizeLastColumn?: boolean;
  emphasizeLastRow?: boolean;
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-900 text-left text-white">
            {headers.map((header, index) => (
              <th
                key={header}
                className={`px-3 py-2 font-medium ${align[index] === 'right' ? 'text-right' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.join('|')} className="border-b border-slate-200">
              {row.map((cell, index) => {
                const strong =
                  (emphasizeLastColumn && index === row.length - 1) ||
                  (emphasizeLastRow && rowIndex === rows.length - 1);
                return (
                  <td
                    key={`${cell}-${index}`}
                    className={`px-3 py-2 ${align[index] === 'right' ? 'text-right' : ''} ${strong ? 'font-semibold' : ''}`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Signature({
  heading,
  name,
  designation,
}: {
  heading: string;
  name: string;
  designation: string;
}) {
  return (
    <div className="text-sm">
      <p className="font-semibold">{heading}</p>
      <p className="mt-4">Name: {name || '______________________________'}</p>
      <p className="mt-2">Designation: {designation || '_________________________'}</p>
      <p className="mt-2">Signature: ___________________________</p>
      <p className="mt-2">Date: _______________________________</p>
    </div>
  );
}
