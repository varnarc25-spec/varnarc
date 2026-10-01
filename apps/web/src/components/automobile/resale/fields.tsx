export const resaleInputClass =
  'mt-1 w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-[#0b1f3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] disabled:bg-slate-50 sm:text-sm';

export const resaleLabelClass = 'block text-sm font-medium text-slate-800';

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

export function FieldHint({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-1 text-xs leading-relaxed text-slate-500">
      {children}
    </p>
  );
}
