import Link from 'next/link';
import { PageHeader } from '@varnarc/ui';

const sections = [
  { href: '/hr/documents/browse', label: 'Browse Documents' },
  { href: '/hr/documents/folders', label: 'Document Folders' },
  { href: '/hr/documents/types', label: 'Document Types' },
];

export default function HrDocumentsPage() {
  return (
    <div>
      <PageHeader
        title="Documents"
        description="Folders, types, and the files linked to employees."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-[var(--varnarc-border)] p-4 font-medium text-[var(--varnarc-brand)]"
          >
            {section.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
