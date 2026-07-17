'use client';

import { useState, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

export type SearchableOption = { id: string; label: string; sublabel?: string };

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
}: {
  options: SearchableOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = options.find((o) => o.id === value) || null;

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setQuery('');
    setOpen(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const select = (opt: SearchableOption | null) => {
    onChange(opt ? opt.id : null);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={open ? query : selected?.label || ''}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={selected ? selected.label : placeholder}
          className="w-full px-3 py-2 rounded-lg border border-app text-sm pr-8"
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-app rounded-lg shadow-lg">
          <button
            type="button"
            onMouseDown={() => select(null)}
            className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-app"
          >
            (Tidak dipilih)
          </button>
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">Tidak ditemukan.</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={() => select(opt)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-app ${
                  opt.id === value ? 'bg-app font-medium' : ''
                }`}
              >
                {opt.label}
                {opt.sublabel && <span className="text-muted"> · {opt.sublabel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}