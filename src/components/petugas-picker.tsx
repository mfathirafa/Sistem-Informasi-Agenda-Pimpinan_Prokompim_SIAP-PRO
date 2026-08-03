'use client';

import { useId, useMemo, useRef, useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { SearchableOption } from '@/components/searchable-select';
import Pagination from '@/components/pagination';

const PAGE_SIZE = 10;

type PetugasPickerProps = {
  label: string; // "Petugas Protokol" / "Petugas Liputan"
  options: SearchableOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

/** Wrap bagian teks yang cocok dengan query. Styling Tailwind, bukan <mark> bawaan. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let idx = lower.indexOf(needle);
  let key = 0;
  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <span key={key++} className="bg-yellow-200 rounded-sm">
        {text.slice(idx, idx + needle.length)}
      </span>,
    );
    cursor = idx + needle.length;
    idx = lower.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export default function PetugasPicker({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}: PetugasPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const fieldRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const openPicker = () => {
    if (disabled) return;
    setQuery('');
    setPage(1);
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
    fieldRef.current?.focus();
  };

  const remove = (id: string) => onChange(selected.filter((x) => x !== id));

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  // Capture-phase + stopPropagation agar saat picker terbuka, Escape hanya menutup
  // picker, bukan ikut menutup modal induk (kegiatan modal) yang juga punya handler.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        fieldRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.sublabel || '').toLowerCase().includes(q),
    );
  }, [options, query]);

  // Pagination mengikuti hasil filter (search). Page di-reset ke 1 saat query berubah.
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  // Pindah halaman → list kembali ke atas + fokus kembali ke kolom search.
  // Keyword search tetap bertahan (query tidak disentuh saat ganti halaman).
  useEffect(() => {
    listRef.current?.scrollTo(0, 0);
    searchInputRef.current?.focus();
  }, [safePage]);

  const selectedOptions = selected
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is SearchableOption => Boolean(o));

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>

      {/* ---- Field: seluruh area klik ---- */}
      <div
        ref={fieldRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm text-left cursor-pointer overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-navy'}
          ${open ? 'border-navy ring-2 ring-navy/20' : 'border-app'}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/20`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-muted truncate">Pilih petugas…</span>
        ) : (
          <>
            {selectedOptions.slice(0, 2).map((o) => (
              <span
                key={o.id}
                className="inline-flex items-center gap-1 bg-app border border-app rounded-full pl-2.5 pr-1 py-0.5 min-w-0"
              >
                <span className="text-sm truncate max-w-[140px]" title={o.label}>
                  {o.label}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(o.id);
                  }}
                  aria-label={`Hapus ${o.label}`}
                  className="p-0.5 rounded-full text-muted hover:text-red-600 hover:bg-red-50 shrink-0 disabled:opacity-30"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedOptions.length > 2 && (
              <span className="bg-navy text-white rounded-full text-xs px-2 py-0.5 shrink-0">
                +{selectedOptions.length - 2}
              </span>
            )}
          </>
        )}
        <ChevronDown size={14} className="ml-auto shrink-0 text-muted" />
      </div>

      {/* ---- Picker modal ---- */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]"
          onClick={closePicker}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-app shrink-0">
              <h3 id={titleId} className="font-display text-lg font-semibold text-navy">
                {label}
              </h3>
              <button type="button" onClick={closePicker} aria-label="Tutup" className="p-1 rounded-md hover:bg-app">
                <X size={18} />
              </button>
            </div>

            {/* Search — sticky */}
            {options.length > 0 && (
              <div className="px-5 py-3 border-b border-app shrink-0">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    autoFocus
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Cari nama / jabatan…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-app text-sm"
                  />
                </div>
              </div>
            )}

            {/* Daftar — satu-satunya area scroll */}
            <div ref={listRef} className="max-h-[40vh] overflow-y-auto px-3 py-2 grow">
              {options.length === 0 ? (
                <p className="text-muted text-sm text-center py-8">Belum ada petugas aktif.</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted text-sm text-center py-8">
                  Tidak ada petugas yang cocok dengan &quot;{query.trim()}&quot;.
                </p>
              ) : (
                pageItems.map((o) => {
                  const isSelected = selected.includes(o.id);
                  return (
                    <label
                      key={o.id}
                      className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer rounded-lg hover:bg-app ${
                        isSelected ? 'bg-navy/[0.06]' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(o.id)}
                        className="rounded border-app text-navy"
                      />
                      <span className="font-medium truncate">
                        <Highlighted text={o.label} query={query} />
                      </span>
                      {o.sublabel && (
                        <span className="text-xs text-muted ml-auto truncate shrink-0 max-w-[45%]">
                          <Highlighted text={o.sublabel} query={query} />
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Pagination — di bawah list: bar info dulu, lalu kontrol halaman */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-app shrink-0 space-y-2.5">
                <p className="text-xs text-muted" aria-live="polite">
                  Menampilkan {pageStart}–{pageEnd} dari {filtered.length}{' '}
                  {query.trim() ? 'hasil' : 'petugas'}
                </p>
                <div className="flex justify-end">
                  <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </div>
            )}

            {/* Footer — sticky, counter + Selesai */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-app shrink-0">
              <span className="text-xs text-muted" aria-live="polite">
                {selected.length} dipilih
              </span>
              <button
                type="button"
                onClick={closePicker}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
