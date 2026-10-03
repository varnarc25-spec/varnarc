import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string };
type Account = {
  id: string;
  email: string;
  status: string;
  employee: { fullName: string; employeeCode: string };
};

export default async function HrAccountsPage() {
  const [accounts, employees] = await Promise.all([
    apiServerFetch<Account[]>('/hr/accounts'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);

  return (
    <div>
      <PageHeader
        title="User Accounts"
        description="Portal logins tied to an employee. One account per person."
      />
      {accounts.error ? <p className="mb-4 text-sm text-red-600">{accounts.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/accounts"
          submitLabel="Create account"
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
            { name: 'email', label: 'Login email', type: 'email', required: true },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Employee', 'Email', 'Status', '']}
        empty="No portal accounts yet."
        rows={(accounts.data ?? []).map((row) => [
          `${row.employee.fullName} (${row.employee.employeeCode})`,
          row.email,
          row.status,
          <HrStatusButton
            key={row.id}
            path={`/api/admin/hr/accounts/${row.id}`}
            status={row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'}
            label={row.status === 'ACTIVE' ? 'Disable' : 'Enable'}
          />,
        ])}
      />
    </div>
  );
}
