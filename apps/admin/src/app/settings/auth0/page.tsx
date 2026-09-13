import { Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';
import { SettingsNav } from '@/components/settings/settings-nav';
import {
  Auth0SettingsForm,
  type Auth0SettingsView,
} from '@/components/settings/auth0-settings-form';

export default async function Auth0SettingsPage() {
  const result = await apiServerFetch<Auth0SettingsView>('/settings/auth0');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Auth0"
        description="Public-site login credentials. Stored in the settings database; environment variables are a fallback."
      />
      <SettingsNav active="/settings/auth0" />
      {result.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Auth0SettingsForm initial={result.data ?? { enabled: true, activeSource: 'none' }} />
      )}
    </div>
  );
}
