'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FieldError, FieldHint, resaleLabelClass } from './fields';

export type SelectOption = { value: string; label: string; slug?: string };

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyLabel?: string;
};

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Search',
  error,
  hint,
  disabled,
  loading,
  emptyLabel = 'No matches',
}: Props) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const errorId = `${reactId}-error`;
  const hintId = `${reactId}-hint`;
  const selected = options.find((option) => option.value === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function choose(next: string) {
    onChange(next);
    setQuery('');
    setOpen(false);
  }

  const describedBy =
    [error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={reactId} className={resaleLabelClass}>
        {label}
      </label>
      <input
        id={reactId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${reactId}-opt-${active}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        disabled={disabled || loading}
        autoComplete="off"
        placeholder={loading ? 'Loading…' : placeholder}
        className="mt-1 w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-[#0b1f3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] disabled:bg-slate-50 sm:text-sm"
        value={open ? query : (selected?.label ?? '')}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActive((index) => Math.min(filtered.length - 1, index + 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => Math.max(0, index - 1));
          } else if (event.key === 'Enter' && open && filtered[active]) {
            event.preventDefault();
            choose(filtered[active].value);
          } else if (event.key === 'Escape') {
            setOpen(false);
            setQuery('');
          }
        }}
      />
      {open && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtered.length ? (
            filtered.map((option, index) => (
              <li key={option.value} role="presentation">
                <button
                  id={`${reactId}-opt-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={`flex min-h-11 w-full items-center px-3 text-left text-sm ${
                    index === active ? 'bg-slate-100' : ''
                  } ${option.value === value ? 'font-semibold text-[#0b1f3a]' : 'text-slate-700'}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-slate-500">{emptyLabel}</li>
          )}
        </ul>
      ) : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
