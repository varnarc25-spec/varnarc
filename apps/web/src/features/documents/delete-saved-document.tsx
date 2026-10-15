'use client';

export function DeleteSavedDocument({ id }: { id: string }) {
  return (
    <button
      type="button"
      className="mt-6 text-sm text-red-800 underline"
      onClick={async () => {
        if (!window.confirm('Delete this saved document?')) return;
        const response = await fetch(`/api/documents/saved/${id}`, { method: 'DELETE' });
        if (response.ok) window.location.href = '/account/documents';
      }}
    >
      Delete saved document
    </button>
  );
}
