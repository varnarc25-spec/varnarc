import { Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';
import { CompanyProfileForm } from '@/components/settings/company-profile-form';
import { SettingsNav } from '@/components/settings/settings-nav';

export default async function CompanyProfilePage() {
  const result = await apiServerFetch<Record<string, unknown>>('/settings/company');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Company profile"
        description="Legal name and registration details used on payslips, laptop rental proposals, and anywhere else the company is named."
      />
      <SettingsNav active="/settings/company" />
      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <CompanyProfileForm initial={result.data ?? { country: 'India' }} />
      )}
    </div>
  );
}
