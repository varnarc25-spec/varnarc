import { PageHeader } from '@varnarc/ui';
import { DepartmentForm } from '@/components/hr-forms';
import { apiServerFetch } from '@/lib/api';

type Department = {
  id: string;
  name: string;
  code: string | null;
  _count: { employees: number };
};

export default async function HrDepartmentsPage() {
  const result = await apiServerFetch<Department[]>('/hr/departments');
  const departments = result.data ?? [];

  return (
    <div>
      <PageHeader title="Departments" description="Teams used when adding employees." />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <div className="mb-8 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
        <DepartmentForm />
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)] text-xs text-[var(--varnarc-subtle)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Employees</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--varnarc-subtle)]" colSpan={3}>
                  No departments yet.
                </td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department.id} className="border-t border-[var(--varnarc-border)]">
                  <td className="px-4 py-3">{department.name}</td>
                  <td className="px-4 py-3">{department.code || '—'}</td>
                  <td className="px-4 py-3">{department._count.employees}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
