'use client';

export function PayslipPrintButton() {
  return (
    <button
      type="button"
      className="rounded-md bg-[var(--varnarc-brand)] px-4 py-2 text-sm font-medium text-white"
      onClick={() => window.print()}
    >
      Print payslip
    </button>
  );
}
