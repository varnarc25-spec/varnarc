import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string };
type ExitRow = {
  id: string;
  lastWorkingDay: string;
  reason: string;
  status: string;
  employee: { fullName: string; employeeCode: string };
};

export default async function HrExitsPage() {
  const [exits, employees] = await Promise.all([
    apiServerFetch<ExitRow[]>('/hr/exits'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);
  const rows = exits.data ?? [];

  return (
    <div>
      <PageHeader
        title="Exit Management"
        description="Start an exit and move it through to completed."
      />
      {exits.error ? <p className="mb-4 text-sm text-red-600">{exits.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/exits"
          submitLabel="Start exit"
          fields={[
            {
              name: 'employeeId',
              label: 'Employee',
              type: 'select',
              required: true,
              options: (employees.data ?? []).map((employee) => ({
                value: employee.id,
                label: `${employee.fullName} (${employee.employeeCode})`,
              })),
            },
            { name: 'lastWorkingDay', label: 'Last working day', type: 'date', required: true },
            { name: 'reason', label: 'Reason', required: true },
            { name: 'notes', label: 'Notes' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Employee', 'Last day', 'Reason', 'Status', '']}
        empty="No exits yet."
        rows={rows.map((row) => [
          `${row.employee.fullName} (${row.employee.employeeCode})`,
          row.lastWorkingDay.slice(0, 10),
          row.reason,
          row.status,
          row.status === 'COMPLETED' ? null : (
            <HrStatusButton
              key={row.id}
              path={`/api/admin/hr/exits/${row.id}`}
              status={row.status === 'INITIATED' ? 'IN_PROGRESS' : 'COMPLETED'}
              label={row.status === 'INITIATED' ? 'Mark in progress' : 'Complete'}
            />
          ),
        ])}
      />
    </div>
  );
}
