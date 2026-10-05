import { PageHeader } from '@varnarc/ui';
import { EmployeeDirectory, type EditableEmployee } from '@/components/hr-forms';
import { apiServerFetch } from '@/lib/api';

type Department = { id: string; name: string };
type SalaryRow = {
  employeeId: string;
  basic: string | number;
  hra: string | number;
  specialAllowance: string | number;
  leaveTravelAllowance: string | number;
  professionalTax: string | number;
  providentFund: string | number;
};

export default async function HrEmployeesPage() {
  const [employeesResult, departmentsResult, salariesResult] = await Promise.all([
    apiServerFetch<EditableEmployee[]>('/hr/employees'),
    apiServerFetch<Department[]>('/hr/departments'),
    apiServerFetch<SalaryRow[]>('/hr/salaries'),
  ]);
  const salaryByEmployee = new Map(
    (salariesResult.data ?? []).map((row) => [
      row.employeeId,
      {
        basic: row.basic,
        hra: row.hra,
        specialAllowance: row.specialAllowance,
        leaveTravelAllowance: row.leaveTravelAllowance,
        professionalTax: row.professionalTax,
        providentFund: row.providentFund,
      },
    ]),
  );
  const employees = (employeesResult.data ?? []).map((employee) => ({
    ...employee,
    salary: employee.salary ?? salaryByEmployee.get(employee.id) ?? null,
    salaryHikes: employee.salaryHikes ?? [],
  }));
  const departments = (departmentsResult.data ?? []).map((department) => ({
    id: department.id,
    name: department.name,
  }));

  return (
    <div>
      <PageHeader
        title="Employees"
        description="People on the team, including the monthly salary used on payslips. Codes are assigned automatically."
      />
      {employeesResult.error ? (
        <p className="mb-4 text-sm text-red-600">{employeesResult.error}</p>
      ) : null}
      <EmployeeDirectory employees={employees} departments={departments} />
    </div>
  );
}
