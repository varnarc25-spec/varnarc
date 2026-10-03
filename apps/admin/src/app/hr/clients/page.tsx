import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string };
type Client = { id: string; name: string };
type Assignment = {
  startDate: string;
  endDate: string | null;
  client: { name: string };
  employee: { fullName: string; employeeCode: string };
};

export default async function HrClientsPage() {
  const [clients, employees, assignments] = await Promise.all([
    apiServerFetch<Client[]>('/hr/clients'),
    apiServerFetch<Employee[]>('/hr/employees'),
    apiServerFetch<Assignment[]>('/hr/client-assignments'),
  ]);

  return (
    <div>
      <PageHeader
        title="Assign Client"
        description="Create a client, then assign an employee for a date range."
      />
      {clients.error ? <p className="mb-4 text-sm text-red-600">{clients.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/clients"
          submitLabel="Add client"
          fields={[{ name: 'name', label: 'Client name', required: true }]}
        />
      </HrPanel>
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/client-assignments"
          submitLabel="Assign employee"
          fields={[
            {
              name: 'clientId',
              label: 'Client',
              type: 'select',
              required: true,
              options: (clients.data ?? []).map((client) => ({
                value: client.id,
                label: client.name,
              })),
            },
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
            { name: 'startDate', label: 'Start', type: 'date', required: true },
            { name: 'endDate', label: 'End', type: 'date' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Client', 'Employee', 'Start', 'End']}
        empty="No client assignments yet."
        rows={(assignments.data ?? []).map((row) => [
          row.client.name,
          `${row.employee.fullName} (${row.employee.employeeCode})`,
          row.startDate.slice(0, 10),
          row.endDate ? row.endDate.slice(0, 10) : '—',
        ])}
      />
    </div>
  );
}
