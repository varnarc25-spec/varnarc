import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';
import { apiServerFetch } from '@/lib/api';
import { CategoryManager } from './category-manager';

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  parentId: string | null;
};

export default async function DocumentCategoriesPage() {
  const result = await apiServerFetch<Category[]>('/documents/admin/categories');
  return (
    <div>
      <PageHeader
        title="Document categories"
        description="Create, reorder, and show or hide the groups on the public documents hub."
        actions={
          <Link className="text-sm underline" href="/documents">
            Dashboard
          </Link>
        }
      />
      {result.error ? <p className="text-sm text-red-700">{result.error}</p> : null}
      <CategoryManager categories={result.data ?? []} />
    </div>
  );
}
