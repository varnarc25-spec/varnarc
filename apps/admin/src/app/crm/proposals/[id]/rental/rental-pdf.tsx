'use client';

import { useState } from 'react';
import type { jsPDF } from 'jspdf';
import {
  formatProposalDate,
  formatProposalInr,
  type LaptopRentalInvoiceView,
  type LaptopRentalServiceView,
} from '@varnarc/validation';

export function RentalPdfButtons({
  service,
  invoice,
}: {
  service: LaptopRentalServiceView;
  invoice?: LaptopRentalInvoiceView;
}) {
  const [error, setError] = useState<string | null>(null);
  const agreement = service.agreement;
  if (!agreement) return null;

  async function download(kind: 'agreement' | 'invoice') {
    const current = service.agreement;
    if (!current) return;
    setError(null);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      if (kind === 'agreement') drawAgreement(pdf, service);
      else if (invoice) drawInvoice(pdf, service, invoice);
      const name = kind === 'agreement' ? current.agreementNumber : invoice?.invoiceNumber;
      pdf.save(`${name ?? 'rental'}.pdf`);
    } catch {
      setError('Could not create the PDF.');
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      {invoice ? (
        <button type="button" className="underline" onClick={() => void download('invoice')}>
          PDF
        </button>
      ) : (
        <button type="button" className="underline" onClick={() => void download('agreement')}>
          Agreement PDF
        </button>
      )}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </span>
  );
}

function drawAgreement(pdf: jsPDF, service: LaptopRentalServiceView) {
  const agreement = service.agreement;
  if (!agreement) return;
  const proposal = service.proposal;
  let y = writeHeader(pdf, 'LAPTOP RENTAL AGREEMENT', agreement.agreementNumber);
  y = line(pdf, y, `Customer: ${proposal.customerCompanyName}`);
  y = line(pdf, y, `Prepared from proposal ${proposal.proposalNumber}`);
  y = line(pdf, y, `Purchase order: ${agreement.poNumber || '—'}`);
  y = line(
    pdf,
    y,
    `Term: ${formatProposalDate(agreement.startDate)} to ${formatProposalDate(agreement.endDate)}`,
  );
  y = line(pdf, y, `Delivery: ${proposal.deliveryLocation}`);
  y = line(pdf, y, `Monthly rental including GST: ${money(proposal.monthlyTotal)}`);
  y = line(pdf, y, `Security deposit: ${money(proposal.depositTotal)}`);
  y = line(pdf, y, `Support response: ${agreement.slaHours} hours`);
  y += 4;
  y = line(pdf, y, 'Laptops', true);
  for (const unit of agreement.units) {
    y = line(
      pdf,
      y,
      [
        unit.assetTag,
        unit.serialNumber,
        unit.brand,
        unit.model,
        unit.processor,
        unit.ram,
        unit.storage,
        unit.display,
        unit.operatingSystem,
      ]
        .filter(Boolean)
        .join('  '),
    );
  }
  y += 6;
  y = line(pdf, y, `For customer: ${agreement.customerSignatoryName || '________________'}`);
  y = line(pdf, y, `Designation: ${agreement.customerSignatoryDesignation || '________________'}`);
  y = line(
    pdf,
    y,
    `Signed: ${agreement.customerSignedOn ? formatProposalDate(agreement.customerSignedOn) : '________________'}`,
  );
  y += 4;
  y = line(
    pdf,
    y,
    `For ${proposal.issuerName}: ${agreement.issuerSignatoryName || '________________'}`,
  );
  y = line(pdf, y, `Designation: ${agreement.issuerSignatoryDesignation || '________________'}`);
  line(
    pdf,
    y,
    `Signed: ${agreement.issuerSignedOn ? formatProposalDate(agreement.issuerSignedOn) : '________________'}`,
  );
}

function drawInvoice(
  pdf: jsPDF,
  service: LaptopRentalServiceView,
  invoice: LaptopRentalInvoiceView,
) {
  const proposal = service.proposal;
  let y = writeHeader(
    pdf,
    invoice.kind === 'CHARGE' ? 'CHARGE INVOICE' : 'RENTAL INVOICE',
    invoice.invoiceNumber,
  );
  y = line(pdf, y, proposal.issuerName);
  if (proposal.issuerGstin) y = line(pdf, y, `GSTIN: ${proposal.issuerGstin}`);
  y = line(pdf, y, `Bill to: ${proposal.customerCompanyName}`);
  y = line(pdf, y, invoice.kind === 'CHARGE' ? 'Charges' : `Period: ${invoice.period}`);
  y += 4;
  y = line(pdf, y, `Amount before GST: ${money(invoice.rentalAmount)}`);
  y = line(pdf, y, `GST: ${money(invoice.gstAmount)}`);
  y = line(pdf, y, `Total: ${money(invoice.totalAmount)}`, true);
  y = line(pdf, y, `Status: ${invoice.status}`);
  if (invoice.issuedOn) line(pdf, y, `Issued: ${formatProposalDate(invoice.issuedOn)}`);
}

function writeHeader(pdf: jsPDF, title: string, number: string) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(title, 14, 18);
  pdf.setFontSize(11);
  pdf.text(number, 14, 26);
  return 34;
}

function line(pdf: jsPDF, y: number, text: string, bold = false) {
  if (y > 280) {
    pdf.addPage();
    y = 18;
  }
  pdf.setFont('helvetica', bold ? 'bold' : 'normal');
  pdf.setFontSize(10);
  const lines = pdf.splitTextToSize(text.replaceAll('₹', 'Rs. '), 180) as string[];
  pdf.text(lines, 14, y);
  return y + lines.length * 5 + 1;
}

function money(amount: number) {
  return formatProposalInr(amount).replaceAll('₹', 'Rs. ');
}
