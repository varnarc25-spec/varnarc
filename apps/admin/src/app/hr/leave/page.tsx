import { PageHeader } from '@varnarc/ui';
import { LeaveDecision, LeaveForm } from '@/components/hr-forms';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string };
type LeaveRequest = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  employee: { fullName: string; employeeCode: string };
};

function day(value: string) {
  return value.slice(0, 10);
}

export default async function HrLeavePage() {
  const [leaveResult, employeesResult] = await Promise.all([
    apiServerFetch<LeaveRequest[]>('/hr/leave'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);
  const requests = leaveResult.data ?? [];
  const employees = (employeesResult.data ?? []).map((employee) => ({
    id: employee.id,
    fullName: employee.fullName,
    employeeCode: employee.employeeCode,
  }));

  return (
    <div>
      <PageHeader
        title="Leave"
        description="Requests stay pending until you approve or reject them."
      />
      {leaveResult.error ? <p className="mb-4 text-sm text-red-600">{leaveResult.error}</p> : null}
      <div className="mb-8 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
        <LeaveForm employees={employees} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--varnarc-muted)] text-xs text-[var(--varnarc-subtle)]">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--varnarc-subtle)]" colSpan={5}>
                  No leave requests yet.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-t border-[var(--varnarc-border)]">
                  <td className="px-4 py-3">
                    {request.employee.fullName}
                    <div className="text-xs text-[var(--varnarc-subtle)]">
                      {request.employee.employeeCode}
                    </div>
                  </td>
                  <td className="px-4 py-3">{request.leaveType}</td>
                  <td className="px-4 py-3">
                    {day(request.startDate)} – {day(request.endDate)}
                    {request.reason ? (
                      <div className="text-xs text-[var(--varnarc-subtle)]">{request.reason}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{request.status}</td>
                  <td className="px-4 py-3">
                    {request.status === 'PENDING' ? <LeaveDecision id={request.id} /> : null}
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
