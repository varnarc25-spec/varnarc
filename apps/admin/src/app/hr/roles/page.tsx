import { PageHeader } from '@varnarc/ui';
import { HrRecordForm } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string };
type Role = {
  id: string;
  name: string;
  description: string | null;
  assignments: { employee: { fullName: string; employeeCode: string } }[];
};

export default async function HrRolesPage() {
  const [roles, employees] = await Promise.all([
    apiServerFetch<Role[]>('/hr/roles'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);
  const roleRows = roles.data ?? [];

  return (
    <div>
      <PageHeader
        title="Roles"
        description="HR roles such as manager or recruiter, assigned to employees."
      />
      {roles.error ? <p className="mb-4 text-sm text-red-600">{roles.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/roles"
          submitLabel="Add role"
          fields={[
            { name: 'name', label: 'Role name', required: true },
            { name: 'description', label: 'Description' },
          ]}
        />
      </HrPanel>
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/roles/assign"
          submitLabel="Assign role"
          fields={[
            {
              name: 'roleId',
              label: 'Role',
              type: 'select',
              required: true,
              options: roleRows.map((role) => ({ value: role.id, label: role.name })),
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
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Role', 'Description', 'People']}
        empty="No HR roles yet."
        rows={roleRows.map((role) => [
          role.name,
          role.description || '—',
          role.assignments.map((link) => link.employee.fullName).join(', ') || '—',
        ])}
      />
    </div>
  );
}
