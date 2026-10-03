import { PageHeader } from '@varnarc/ui';
import { HrRecordForm, HrStatusButton } from '@/components/hr-record-form';
import { HrDataTable, HrPanel } from '@/components/hr-table';
import { apiServerFetch } from '@/lib/api';

type Employee = { id: string; fullName: string; employeeCode: string };
type RequestRow = {
  id: string;
  requestType: string;
  subject: string;
  status: string;
  employee: { fullName: string };
};

export default async function HrEssRequestsPage() {
  const [requests, employees] = await Promise.all([
    apiServerFetch<RequestRow[]>('/hr/ess-requests'),
    apiServerFetch<Employee[]>('/hr/employees'),
  ]);

  return (
    <div>
      <PageHeader
        title="ESS Requests"
        description="Self-service requests from employees. Approve or reject each one."
      />
      {requests.error ? <p className="mb-4 text-sm text-red-600">{requests.error}</p> : null}
      <HrPanel>
        <HrRecordForm
          action="/api/admin/hr/ess-requests"
          submitLabel="Add request"
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
            {
              name: 'requestType',
              label: 'Type',
              type: 'select',
              required: true,
              options: [
                { value: 'LEAVE', label: 'Leave' },
                { value: 'ATTENDANCE', label: 'Attendance' },
                { value: 'DOCUMENT', label: 'Document' },
                { value: 'OTHER', label: 'Other' },
              ],
            },
            { name: 'subject', label: 'Subject', required: true },
            { name: 'details', label: 'Details' },
          ]}
        />
      </HrPanel>
      <HrDataTable
        columns={['Employee', 'Type', 'Subject', 'Status', '']}
        empty="No requests yet."
        rows={(requests.data ?? []).map((row) => [
          row.employee.fullName,
          row.requestType,
          row.subject,
          row.status,
          row.status === 'OPEN' ? (
            <span key={row.id} className="flex gap-3">
              <HrStatusButton
                path={`/api/admin/hr/ess-requests/${row.id}`}
                status="APPROVED"
                label="Approve"
              />
              <HrStatusButton
                path={`/api/admin/hr/ess-requests/${row.id}`}
                status="REJECTED"
                label="Reject"
              />
            </span>
          ) : null,
        ])}
      />
    </div>
  );
}
