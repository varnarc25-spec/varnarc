import { PageHeader } from '@varnarc/ui';
import { HrProfileEditor } from '@/components/hr-record-form';
import { HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string;
  notes: string | null;
};

export default async function HrProfilePage() {
  const result = await apiServerFetch<Employee[]>('/hr/employees');

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Update an employee profile. Pick the person, then save their contact details."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrProfileEditor employees={result.data ?? []} />
      </HrPanel>
    </div>
  );
}
