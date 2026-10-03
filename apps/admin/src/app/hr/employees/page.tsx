import { PageHeader } from '@varnarc/ui';
import { EmployeeForm, EmployeeStatusButton } from '@/components/hr-forms';
import { apiServerFetch } from '@/lib/api';

type Department = { id: string; name: string };
type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  jobTitle: string;
  status: string;
  department: { name: string } | null;
};

export default async function HrEmployeesPage() {
  const [employeesResult, departmentsResult] = await Promise.all([
    apiServerFetch<Employee[]>('/hr/employees'),
    apiServerFetch<Department[]>('/hr/departments'),
  ]);
  const employees = employeesResult.data ?? [];
  const departments = (departmentsResult.data ?? []).map((department) => ({
    id: department.id,
    name: department.name,
  }));

  return (
    <div>
      <PageHeader
        title="Employees"
        description="People on the team. Codes are assigned automatically."
      />
      {employeesResult.error ? (
        <p className="mb-4 text-sm text-red-600">{employeesResult.error}</p>
      ) : null}
      <div className="mb-8 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
        <EmployeeForm departments={departments} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)] text-xs text-[var(--varnarc-subtle)]">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--varnarc-subtle)]" colSpan={6}>
                  No employees yet.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="border-t border-[var(--varnarc-border)]">
                  <td className="px-4 py-3">{employee.employeeCode}</td>
                  <td className="px-4 py-3">
                    <div>{employee.fullName}</div>
                    {employee.email ? (
                      <div className="text-xs text-[var(--varnarc-subtle)]">{employee.email}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{employee.jobTitle}</td>
                  <td className="px-4 py-3">{employee.department?.name || '—'}</td>
                  <td className="px-4 py-3">{employee.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <EmployeeStatusButton id={employee.id} status={employee.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
