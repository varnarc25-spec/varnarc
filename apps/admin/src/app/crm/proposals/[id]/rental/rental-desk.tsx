'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  formatProposalDate,
  formatProposalInr,
  LAPTOP_RENTAL_AGREEMENT_LABELS,
  LAPTOP_RENTAL_CASE_KIND_LABELS,
  LAPTOP_RENTAL_CASE_KINDS,
  LAPTOP_RENTAL_CASE_STATUS_LABELS,
  LAPTOP_RENTAL_CHARGE_KIND_LABELS,
  LAPTOP_RENTAL_CHARGE_KINDS,
  LAPTOP_RENTAL_CHARGE_SETTLEMENTS,
  LAPTOP_RENTAL_INVOICE_LABELS,
  LAPTOP_RENTAL_UNIT_LABELS,
  type LaptopRentalCaseKind,
  type LaptopRentalChargeKind,
  type LaptopRentalServiceView,
} from '@varnarc/validation';
import { RentalPdfButtons } from './rental-pdf';

const inputClass =
  'w-full rounded-md border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] px-3 py-2 text-sm';

export function RentalDesk({ service }: { service: LaptopRentalServiceView }) {
  const agreement = service.agreement;
  return (
    <div className="space-y-8">
      <Terms service={service} />
      {agreement ? (
        <AgreementDesk service={service} agreement={agreement} />
      ) : (
        <StartRental
          proposalId={service.proposal.id}
          accepted={service.proposal.status === 'ACCEPTED'}
        />
      )}
    </div>
  );
}

function Terms({ service }: { service: LaptopRentalServiceView }) {
  const proposal = service.proposal;
  return (
    <section className="rounded-lg border border-[var(--varnarc-border)] p-4 text-sm">
      <h2 className="font-medium">Contracted terms</h2>
      <p className="mt-2 text-[var(--varnarc-subtle)]">
        {proposal.customerCompanyName} · {proposal.quantity} laptops · {proposal.commitmentMonths}{' '}
        months · {formatProposalInr(proposal.commitmentRate)} per laptop ·{' '}
        {formatProposalInr(proposal.monthlyTotal)} per month including GST · deposit{' '}
        {formatProposalInr(proposal.depositTotal)} · deliver to {proposal.deliveryLocation}
      </p>
    </section>
  );
}

function StartRental({ proposalId, accepted }: { proposalId: string; accepted: boolean }) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!accepted) {
    return <p className="text-sm">Accept the proposal before starting the rental.</p>;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-proposals/${proposalId}/agreement`, {
        startDate: String(form.get('startDate')),
        poNumber: String(form.get('poNumber') ?? ''),
        slaHours: Number(form.get('slaHours')),
        customerSignatoryName: String(form.get('customerSignatoryName') ?? ''),
        customerSignatoryDesignation: String(form.get('customerSignatoryDesignation') ?? ''),
        customerSignedOn: String(form.get('customerSignedOn') ?? ''),
        issuerSignatoryName: String(form.get('issuerSignatoryName') ?? ''),
        issuerSignatoryDesignation: String(form.get('issuerSignatoryDesignation') ?? ''),
        issuerSignedOn: String(form.get('issuerSignedOn') ?? ''),
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start the rental.');
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="grid gap-4 rounded-lg border border-[var(--varnarc-border)] p-4 sm:grid-cols-2"
    >
      <h2 className="sm:col-span-2 font-medium">Start rental</h2>
      {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
      <label className="text-sm">
        Start date
        <input
          className={`${inputClass} mt-1`}
          type="date"
          name="startDate"
          required
          defaultValue={today}
        />
      </label>
      <label className="text-sm">
        Purchase order
        <input className={`${inputClass} mt-1`} name="poNumber" />
      </label>
      <label className="text-sm">
        Support SLA (hours)
        <input
          className={`${inputClass} mt-1`}
          type="number"
          name="slaHours"
          min={1}
          defaultValue={48}
          required
        />
      </label>
      <label className="text-sm">
        Customer signatory
        <input className={`${inputClass} mt-1`} name="customerSignatoryName" />
      </label>
      <label className="text-sm">
        Customer designation
        <input className={`${inputClass} mt-1`} name="customerSignatoryDesignation" />
      </label>
      <label className="text-sm">
        Customer signed on
        <input className={`${inputClass} mt-1`} type="date" name="customerSignedOn" />
      </label>
      <label className="text-sm">
        Our signatory
        <input className={`${inputClass} mt-1`} name="issuerSignatoryName" />
      </label>
      <label className="text-sm">
        Our designation
        <input className={`${inputClass} mt-1`} name="issuerSignatoryDesignation" />
      </label>
      <label className="text-sm">
        We signed on
        <input className={`${inputClass} mt-1`} type="date" name="issuerSignedOn" />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Starting…' : 'Start rental'}
        </button>
      </div>
    </form>
  );
}

function AgreementDesk({
  service,
  agreement,
}: {
  service: LaptopRentalServiceView;
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
}) {
  const locked = agreement.status === 'CLOSED' || agreement.status === 'CANCELLED';
  return (
    <>
      <SignatureForm
        agreement={agreement}
        locked={locked}
        issuerName={service.proposal.issuerName}
        service={service}
      />
      <Units
        agreement={agreement}
        quantity={service.proposal.quantity}
        spec={{
          brand: service.proposal.brand,
          model: '',
          processor: service.proposal.processor,
          ram: service.proposal.ram,
          storage: service.proposal.storage,
          display: service.proposal.display,
          operatingSystem: service.proposal.operatingSystem,
        }}
        locked={locked}
      />
      <Deposit agreement={agreement} locked={locked} />
      <Invoices service={service} agreement={agreement} locked={locked} />
      <Cases agreement={agreement} locked={locked} />
      <Charges agreement={agreement} locked={locked} />
      <Finish agreement={agreement} locked={locked} />
    </>
  );
}

function SignatureForm({
  agreement,
  locked,
  issuerName,
  service,
}: {
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  locked: boolean;
  issuerName: string;
  service: LaptopRentalServiceView;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}`, {
        poNumber: String(form.get('poNumber') ?? ''),
        slaHours: Number(form.get('slaHours')),
        customerSignatoryName: String(form.get('customerSignatoryName') ?? ''),
        customerSignatoryDesignation: String(form.get('customerSignatoryDesignation') ?? ''),
        customerSignedOn: String(form.get('customerSignedOn') ?? ''),
        issuerSignatoryName: String(form.get('issuerSignatoryName') ?? ''),
        issuerSignatoryDesignation: String(form.get('issuerSignatoryDesignation') ?? ''),
        issuerSignedOn: String(form.get('issuerSignedOn') ?? ''),
      });
      router.refresh();
      setPending(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the agreement.');
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="grid gap-4 rounded-lg border border-[var(--varnarc-border)] p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">
          {agreement.agreementNumber} · {LAPTOP_RENTAL_AGREEMENT_LABELS[agreement.status]}
        </h2>
        <RentalPdfButtons service={service} />
      </div>
      <p className="sm:col-span-2 text-sm text-[var(--varnarc-subtle)]">
        {formatProposalDate(agreement.startDate)} to {formatProposalDate(agreement.endDate)}.
        Billing starts after both parties have a signed date. Support cases are due{' '}
        {agreement.slaHours} hours after they are reported.
      </p>
      {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
      <label className="text-sm">
        Purchase order
        <input
          className={`${inputClass} mt-1`}
          name="poNumber"
          defaultValue={agreement.poNumber ?? ''}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        Support SLA (hours)
        <input
          className={`${inputClass} mt-1`}
          type="number"
          name="slaHours"
          min={1}
          defaultValue={agreement.slaHours}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        Customer signatory
        <input
          className={`${inputClass} mt-1`}
          name="customerSignatoryName"
          defaultValue={agreement.customerSignatoryName ?? ''}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        Customer designation
        <input
          className={`${inputClass} mt-1`}
          name="customerSignatoryDesignation"
          defaultValue={agreement.customerSignatoryDesignation ?? ''}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        Customer signed on
        <input
          className={`${inputClass} mt-1`}
          type="date"
          name="customerSignedOn"
          defaultValue={agreement.customerSignedOn ?? ''}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        Our signatory ({issuerName})
        <input
          className={`${inputClass} mt-1`}
          name="issuerSignatoryName"
          defaultValue={agreement.issuerSignatoryName ?? ''}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        Our designation
        <input
          className={`${inputClass} mt-1`}
          name="issuerSignatoryDesignation"
          defaultValue={agreement.issuerSignatoryDesignation ?? ''}
          disabled={locked}
        />
      </label>
      <label className="text-sm">
        We signed on
        <input
          className={`${inputClass} mt-1`}
          type="date"
          name="issuerSignedOn"
          defaultValue={agreement.issuerSignedOn ?? ''}
          disabled={locked}
        />
      </label>
      {locked ? null : (
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save agreement'}
          </button>
        </div>
      )}
    </form>
  );
}

type LaptopSpec = {
  brand: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;
  display: string;
  operatingSystem: string;
};

function Units({
  agreement,
  quantity,
  spec,
  locked,
}: {
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  quantity: number;
  spec: LaptopSpec;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const contracted = agreement.units.filter((unit) => !unit.replacesUnitId).length;

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/units`, laptopPayload(form));
      event.currentTarget.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add the laptop.');
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-medium">
        Laptops ({contracted} of {quantity} tagged)
      </h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)] text-xs">
            <tr>
              {['Laptop', 'Details', 'Status', 'Delivered', 'Picked up', ''].map((column) => (
                <th key={column} className="px-3 py-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agreement.units.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-[var(--varnarc-subtle)]" colSpan={6}>
                  No laptops tagged yet.
                </td>
              </tr>
            ) : (
              agreement.units.map((unit) => (
                <UnitRow key={unit.id} agreementId={agreement.id} unit={unit} locked={locked} />
              ))
            )}
          </tbody>
        </table>
      </div>
      {locked ? null : (
        <form
          onSubmit={(event) => void add(event)}
          className="space-y-3 rounded-lg border border-[var(--varnarc-border)] p-4"
        >
          <h3 className="text-sm font-medium">Add laptop details</h3>
          <LaptopFields
            values={{
              assetTag: '',
              serialNumber: '',
              brand: spec.brand,
              model: spec.model,
              processor: spec.processor,
              ram: spec.ram,
              storage: spec.storage,
              display: spec.display,
              operatingSystem: spec.operatingSystem,
            }}
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--varnarc-brand)] px-4 text-sm font-medium text-white"
          >
            Add laptop
          </button>
        </form>
      )}
    </section>
  );
}

function UnitRow({
  agreementId,
  unit,
  locked,
}: {
  agreementId: string;
  unit: NonNullable<LaptopRentalServiceView['agreement']>['units'][number];
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  async function act(path: string, body?: unknown, method = 'POST') {
    setError(null);
    try {
      await send(
        `/api/admin/crm/rental-agreements/${agreementId}/units/${unit.id}${path}`,
        body,
        method,
      );
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the laptop.');
    }
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(
        `/api/admin/crm/rental-agreements/${agreementId}/units/${unit.id}`,
        laptopPayload(form),
        'PUT',
      );
      setEditing(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the laptop details.');
    }
  }

  return (
    <tr className="border-t border-[var(--varnarc-border)]">
      <td className="px-3 py-2">
        <div className="font-medium">{unit.assetTag}</div>
        <div className="text-[var(--varnarc-subtle)]">{unit.serialNumber}</div>
      </td>
      <td className="px-3 py-2">
        {editing ? (
          <form onSubmit={(event) => void saveDetails(event)} className="grid min-w-80 gap-2">
            <LaptopFields values={unit} />
            <div className="flex gap-3">
              <button type="submit" className="text-sm underline">
                Save details
              </button>
              <button type="button" className="text-sm underline" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div>{[unit.brand, unit.model].filter(Boolean).join(' ')}</div>
            <div className="text-[var(--varnarc-subtle)]">
              {[unit.processor, unit.ram, unit.storage, unit.display, unit.operatingSystem]
                .filter(Boolean)
                .join(' · ') || 'No specification yet'}
            </div>
            {locked ? null : (
              <button
                type="button"
                className="mt-1 text-sm underline"
                onClick={() => setEditing(true)}
              >
                Edit details
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-3 py-2">{LAPTOP_RENTAL_UNIT_LABELS[unit.status]}</td>
      <td className="px-3 py-2">{unit.deliveredOn ? formatProposalDate(unit.deliveredOn) : '—'}</td>
      <td className="px-3 py-2">{unit.pickedUpOn ? formatProposalDate(unit.pickedUpOn) : '—'}</td>
      <td className="px-3 py-2">
        {locked ? null : unit.status === 'READY' ? (
          <span className="flex flex-wrap gap-2">
            <DateAction
              label="Deliver"
              onAct={(on) => act('/deliver', { on })}
              defaultValue={today}
            />
            <button
              type="button"
              className="text-sm underline"
              onClick={() => void act('', undefined, 'DELETE')}
            >
              Remove
            </button>
          </span>
        ) : unit.status === 'DELIVERED' || unit.status === 'IN_REPAIR' ? (
          <DateAction label="Pick up" onAct={(on) => act('/pickup', { on })} defaultValue={today} />
        ) : null}
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </td>
    </tr>
  );
}

function LaptopFields({
  values,
}: {
  values: {
    assetTag: string;
    serialNumber: string;
    brand: string;
    model: string | null;
    processor: string | null;
    ram: string | null;
    storage: string | null;
    display: string | null;
    operatingSystem: string | null;
  };
}) {
  const fields: Array<{
    name: keyof LaptopSpec | 'assetTag' | 'serialNumber';
    label: string;
    required?: boolean;
  }> = [
    { name: 'assetTag', label: 'Asset tag', required: true },
    { name: 'serialNumber', label: 'Serial number', required: true },
    { name: 'brand', label: 'Brand' },
    { name: 'model', label: 'Model' },
    { name: 'processor', label: 'Processor' },
    { name: 'ram', label: 'RAM' },
    { name: 'storage', label: 'Storage' },
    { name: 'display', label: 'Display' },
    { name: 'operatingSystem', label: 'Operating system' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className="text-sm">
          {field.label}
          <input
            className={inputClass}
            name={field.name}
            required={field.required}
            defaultValue={values[field.name] ?? ''}
          />
        </label>
      ))}
    </div>
  );
}

function laptopPayload(form: FormData) {
  return {
    assetTag: String(form.get('assetTag') ?? ''),
    serialNumber: String(form.get('serialNumber') ?? ''),
    brand: String(form.get('brand') ?? ''),
    model: String(form.get('model') ?? ''),
    processor: String(form.get('processor') ?? ''),
    ram: String(form.get('ram') ?? ''),
    storage: String(form.get('storage') ?? ''),
    display: String(form.get('display') ?? ''),
    operatingSystem: String(form.get('operatingSystem') ?? ''),
  };
}

function DateAction({
  label,
  onAct,
  defaultValue,
}: {
  label: string;
  onAct: (on: string) => Promise<void>;
  defaultValue: string;
}) {
  const [on, setOn] = useState(defaultValue);
  return (
    <span className="inline-flex items-center gap-2">
      <input
        className="rounded-md border border-[var(--varnarc-border)] px-2 py-1 text-sm"
        type="date"
        value={on}
        onChange={(event) => setOn(event.target.value)}
      />
      <button type="button" className="text-sm underline" onClick={() => void onAct(on)}>
        {label}
      </button>
    </span>
  );
}

function Deposit({
  agreement,
  locked,
}: {
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  async function save(kind: 'receive' | 'refund', event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/deposit/${kind}`, {
        amount: Number(form.get('amount')),
        on: String(form.get('on')),
        notes: String(form.get('notes') ?? ''),
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the deposit.');
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-[var(--varnarc-border)] p-4 text-sm">
      <h2 className="font-medium">Security deposit</h2>
      <p>
        Expected {formatProposalInr(agreement.depositExpected)}. Received{' '}
        {formatProposalInr(agreement.depositReceived)}
        {agreement.depositReceivedOn
          ? ` on ${formatProposalDate(agreement.depositReceivedOn)}`
          : ''}
        . Deducted {formatProposalInr(agreement.depositWithheld)}. Available to refund{' '}
        {formatProposalInr(agreement.depositRefundable)}. Refunded{' '}
        {formatProposalInr(agreement.depositRefunded)}
        {agreement.depositRefundedOn
          ? ` on ${formatProposalDate(agreement.depositRefundedOn)}`
          : ''}
        .
      </p>
      {error ? <p className="text-red-600">{error}</p> : null}
      {locked ? null : (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            onSubmit={(event) => void save('receive', event)}
            className="grid gap-2 sm:grid-cols-3"
          >
            <input
              className={inputClass}
              name="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="Received"
              required
              defaultValue={agreement.depositReceived || agreement.depositExpected}
            />
            <input
              className={inputClass}
              name="on"
              type="date"
              required
              defaultValue={agreement.depositReceivedOn ?? today}
            />
            <button
              className="h-10 rounded-md border border-[var(--varnarc-border)] text-sm font-medium"
              type="submit"
            >
              Record receipt
            </button>
          </form>
          <form
            onSubmit={(event) => void save('refund', event)}
            className="grid gap-2 sm:grid-cols-3"
          >
            <input
              className={inputClass}
              name="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="Refund"
              required
              defaultValue={agreement.depositRefundable}
            />
            <input
              className={inputClass}
              name="on"
              type="date"
              required
              defaultValue={agreement.depositRefundedOn ?? today}
            />
            <button
              className="h-10 rounded-md border border-[var(--varnarc-border)] text-sm font-medium"
              type="submit"
            >
              Record refund
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function Invoices({
  service,
  agreement,
  locked,
}: {
  service: LaptopRentalServiceView;
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function generate() {
    setError(null);
    try {
      const result = await send(
        `/api/admin/crm/rental-agreements/${agreement.id}/invoices/generate`,
        {},
      );
      const created =
        typeof result === 'object' && result && 'created' in result ? Number(result.created) : 0;
      setNotice(
        created > 0
          ? `Created ${created} invoice${created === 1 ? '' : 's'}.`
          : 'Invoices for this term are already created.',
      );
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create invoices.');
    }
  }

  async function status(invoiceId: string, next: 'ISSUED' | 'PAID' | 'VOID') {
    setError(null);
    try {
      await send(
        `/api/admin/crm/rental-agreements/${agreement.id}/invoices/${invoiceId}`,
        { status: next },
        'PUT',
      );
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the invoice.');
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">Invoices</h2>
        {locked ? null : (
          <button type="button" className="text-sm underline" onClick={() => void generate()}>
            Create monthly invoices
          </button>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm">{notice}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)] text-xs">
            <tr>
              {['Invoice', 'Period', 'Before GST', 'GST', 'Total', 'Status', ''].map((column) => (
                <th key={column} className="px-3 py-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agreement.invoices.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-[var(--varnarc-subtle)]" colSpan={7}>
                  No invoices yet.
                </td>
              </tr>
            ) : (
              agreement.invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-[var(--varnarc-border)]">
                  <td className="px-3 py-2">{invoice.invoiceNumber}</td>
                  <td className="px-3 py-2">
                    {invoice.kind === 'CHARGE' ? 'Charges' : invoice.period}
                  </td>
                  <td className="px-3 py-2">{formatProposalInr(invoice.rentalAmount)}</td>
                  <td className="px-3 py-2">{formatProposalInr(invoice.gstAmount)}</td>
                  <td className="px-3 py-2">{formatProposalInr(invoice.totalAmount)}</td>
                  <td className="px-3 py-2">{LAPTOP_RENTAL_INVOICE_LABELS[invoice.status]}</td>
                  <td className="px-3 py-2">
                    <span className="flex flex-wrap gap-2">
                      <RentalPdfButtons service={service} invoice={invoice} />
                      {locked ? null : invoice.status === 'DRAFT' ? (
                        <>
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void status(invoice.id, 'ISSUED')}
                          >
                            Issue
                          </button>
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void status(invoice.id, 'VOID')}
                          >
                            Void
                          </button>
                        </>
                      ) : invoice.status === 'ISSUED' ? (
                        <>
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void status(invoice.id, 'PAID')}
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void status(invoice.id, 'VOID')}
                          >
                            Void
                          </button>
                        </>
                      ) : null}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cases({
  agreement,
  locked,
}: {
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const live = agreement.units.filter(
    (unit) => unit.status === 'DELIVERED' || unit.status === 'IN_REPAIR',
  );

  async function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/cases`, {
        unitId: String(form.get('unitId')),
        kind: String(form.get('kind')),
        summary: String(form.get('summary')),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open the case.');
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium">Support</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {agreement.cases.map((item) => (
        <CaseRow key={item.id} agreementId={agreement.id} item={item} locked={locked} />
      ))}
      {agreement.cases.length === 0 ? (
        <p className="text-sm text-[var(--varnarc-subtle)]">No support cases.</p>
      ) : null}
      {locked || live.length === 0 ? null : (
        <form
          onSubmit={(event) => void open(event)}
          className="grid gap-3 rounded-lg border border-[var(--varnarc-border)] p-4"
        >
          <select className={inputClass} name="unitId" required>
            {live.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.assetTag}
              </option>
            ))}
          </select>
          <select className={inputClass} name="kind" required>
            {LAPTOP_RENTAL_CASE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {LAPTOP_RENTAL_CASE_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
          <textarea
            className={inputClass}
            name="summary"
            rows={2}
            placeholder="What failed"
            required
          />
          <button
            type="submit"
            className="h-10 rounded-md border border-[var(--varnarc-border)] text-sm font-medium"
          >
            Open case
          </button>
        </form>
      )}
    </section>
  );
}

function CaseRow({
  agreementId,
  item,
  locked,
}: {
  agreementId: string;
  item: NonNullable<LaptopRentalServiceView['agreement']>['cases'][number];
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function resolve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreementId}/cases/${item.id}/resolve`, {
        resolution: String(form.get('resolution')),
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resolve the case.');
    }
  }

  async function replace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreementId}/cases/${item.id}/replace`, {
        assetTag: String(form.get('assetTag')),
        serialNumber: String(form.get('serialNumber')),
        resolution: String(form.get('resolution')),
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not replace the laptop.');
    }
  }

  return (
    <article className="rounded-lg border border-[var(--varnarc-border)] p-4 text-sm">
      <p className="font-medium">
        {item.assetTag} · {LAPTOP_RENTAL_CASE_KIND_LABELS[item.kind as LaptopRentalCaseKind]} ·{' '}
        {LAPTOP_RENTAL_CASE_STATUS_LABELS[item.status]}
        {item.overdue ? ' · overdue' : ''}
      </p>
      <p className="mt-1">{item.summary}</p>
      <p className="mt-1 text-[var(--varnarc-subtle)]">
        Due {new Date(item.dueAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
      {item.resolution ? <p className="mt-1">Resolution: {item.resolution}</p> : null}
      {error ? <p className="mt-2 text-red-600">{error}</p> : null}
      {locked || item.status === 'RESOLVED' ? null : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <form onSubmit={(event) => void resolve(event)} className="space-y-2">
            <textarea
              className={inputClass}
              name="resolution"
              rows={2}
              placeholder="How it was repaired"
              required
            />
            <button type="submit" className="text-sm underline">
              Mark resolved
            </button>
          </form>
          <form onSubmit={(event) => void replace(event)} className="space-y-2">
            <input
              className={inputClass}
              name="assetTag"
              placeholder="Replacement asset tag"
              required
            />
            <input
              className={inputClass}
              name="serialNumber"
              placeholder="Replacement serial"
              required
            />
            <textarea
              className={inputClass}
              name="resolution"
              rows={2}
              placeholder="Why it was replaced"
              required
            />
            <button type="submit" className="text-sm underline">
              Replace laptop
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function Charges({
  agreement,
  locked,
}: {
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/charges`, {
        unitId: String(form.get('unitId') ?? '') || null,
        kind: String(form.get('kind')),
        settlement: String(form.get('settlement')),
        amount: Number(form.get('amount')),
        description: String(form.get('description')),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add the charge.');
    }
  }

  async function waive(chargeId: string) {
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/charges/${chargeId}/waive`, {});
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not waive the charge.');
    }
  }

  async function bill() {
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/charges/bill`, {});
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not invoice the charges.');
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">Damage, loss and theft</h2>
        {locked ? null : (
          <button type="button" className="text-sm underline" onClick={() => void bill()}>
            Invoice open charges
          </button>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {agreement.charges.map((charge) => (
        <p key={charge.id} className="text-sm">
          {LAPTOP_RENTAL_CHARGE_KIND_LABELS[charge.kind]} · {charge.assetTag ?? 'No laptop'} ·{' '}
          {formatProposalInr(charge.amount)} ·{' '}
          {charge.settlement === 'DEPOSIT' ? 'Deducted from deposit' : 'Invoice'} ·{' '}
          {charge.status.toLowerCase()}
          {charge.description ? ` · ${charge.description}` : ''}
          {!locked && charge.status === 'OPEN' ? (
            <button type="button" className="ml-2 underline" onClick={() => void waive(charge.id)}>
              Waive
            </button>
          ) : null}
        </p>
      ))}
      {locked ? null : (
        <form
          onSubmit={(event) => void add(event)}
          className="grid gap-3 rounded-lg border border-[var(--varnarc-border)] p-4 sm:grid-cols-2"
        >
          <select className={inputClass} name="unitId">
            <option value="">No specific laptop</option>
            {agreement.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.assetTag}
              </option>
            ))}
          </select>
          <select className={inputClass} name="kind">
            {LAPTOP_RENTAL_CHARGE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {LAPTOP_RENTAL_CHARGE_KIND_LABELS[kind as LaptopRentalChargeKind]}
              </option>
            ))}
          </select>
          <select className={inputClass} name="settlement">
            {LAPTOP_RENTAL_CHARGE_SETTLEMENTS.map((settlement) => (
              <option key={settlement} value={settlement}>
                {settlement === 'DEPOSIT' ? 'Deduct from deposit' : 'Invoice separately'}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            name="amount"
            type="number"
            min={0.01}
            step="0.01"
            placeholder="Amount before GST"
            required
          />
          <textarea
            className={`${inputClass} sm:col-span-2`}
            name="description"
            rows={2}
            placeholder="What happened"
            required
          />
          <button
            type="submit"
            className="h-10 rounded-md border border-[var(--varnarc-border)] text-sm font-medium"
          >
            Add charge
          </button>
        </form>
      )}
    </section>
  );
}

function Finish({
  agreement,
  locked,
}: {
  agreement: NonNullable<LaptopRentalServiceView['agreement']>;
  locked: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function run(path: 'close' | 'cancel') {
    setError(null);
    try {
      await send(`/api/admin/crm/rental-agreements/${agreement.id}/${path}`, {});
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the rental.');
    }
  }

  if (locked) return null;
  return (
    <section className="space-y-2 text-sm">
      <h2 className="font-medium">Finish</h2>
      {agreement.closeBlockers.map((blocker) => (
        <p key={blocker}>{blocker}</p>
      ))}
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="flex gap-4">
        <button
          type="button"
          className="underline"
          disabled={!agreement.canClose}
          onClick={() => void run('close')}
        >
          Close rental
        </button>
        <button type="button" className="underline" onClick={() => void run('cancel')}>
          Cancel before delivery
        </button>
      </div>
    </section>
  );
}

async function send(path: string, body?: unknown, method = 'POST') {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string; details?: unknown };
  };
  if (!res.ok) throw new Error(errorMessage(json.error));
  return json.data;
}

function errorMessage(error: { message?: string; details?: unknown } | undefined) {
  if (Array.isArray(error?.details)) {
    const lines = error.details
      .map((issue) => {
        if (!issue || typeof issue !== 'object' || !('message' in issue)) return '';
        return String((issue as { message?: string }).message ?? '');
      })
      .filter(Boolean);
    if (lines.length > 0) return lines.join(' ');
  }
  return error?.message || 'Request failed';
}
