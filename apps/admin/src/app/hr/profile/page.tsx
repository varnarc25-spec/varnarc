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
  dateOfBirth: string | null;
  pan: string | null;
  bankAccountNo: string | null;
  ifscCode: string | null;
  taxRegime: string;
  joinedOn: string | null;
  salary: {
    basic: string | number;
    hra: string | number;
    specialAllowance: string | number;
    leaveTravelAllowance: string | number;
    professionalTax: string | number;
    providentFund: string | number;
  } | null;
};

export default async function HrProfilePage() {
  const result = await apiServerFetch<Employee[]>('/hr/employees');

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Update an employee profile, including the monthly salary used on payslips."
      />
      {result.error ? <p className="mb-4 text-sm text-red-600">{result.error}</p> : null}
      <HrPanel>
        <HrProfileEditor employees={result.data ?? []} />
      </HrPanel>
    </div>
  );
}
