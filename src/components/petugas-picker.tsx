'use client';

import { useId, useMemo, useRef, useState, useEffect, useTransition } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, X, UserPlus, Loader2 } from 'lucide-react';
import type { SearchableOption } from '@/components/searchable-select';
import Pagination from '@/components/pagination';
import { createPetugas } from '@/app/actions/petugas';
import { KATEGORI_PETUGAS_OPTIONS, KATEGORI_PETUGAS_LABEL } from '@/lib/constants/kategori-petugas';
import type { KategoriPetugas } from '@prisma/client';

const PAGE_SIZE = 10;

type PetugasPickerProps = {
  label: string; // "Petugas Protokol" / "Petugas Liputan"
  options: SearchableOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  /**IDs petugas yang sudah dipilih di picker lain (Protokol <-> Liputan).
   * Item tersebut tetap muncul, namun diberi badge peringatan
   */
  warnIds?: string[];
  /** Teks tooltip / keterangan badge peringatan */
  warnLabel?: string;
  /** Dipanggil setelah petugas ba berhasil dibuat: { id, label, sublabel }.
   * Parent wajib menambahkan item ini ke options agar langsung bisa dipilih */
  onPetugasCreated?: (newOption: SearchableOption & { kategori: KategoriPetugas }) => void;
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
  warnIds = [],
  warnLabel = 'Sudah dipilih di peran lain',
  onPetugasCreated,
}: PetugasPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  // --- Quick-add petugas baru ---
  const [qaOpen, setQaOpen] = useState(false);
  const [qaForm, setQaForm] = useState<{ nama: string; jabatan: string; nip: string; kategori: KategoriPetugas; statusAktif: boolean }>({
    nama: '', jabatan: '', nip: '', kategori: 'PROTOKOL', statusAktif: true
  });
  const [qaError, setQaError] = useState('');
  const [qaWarning, setQaWarning] = useState('');
  const [qaPending, startQaTransition] = useTransition();
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

  const openQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultKategori: KategoriPetugas = label.toLowerCase().includes('liputan') ? 'LIPUTAN' : 'PROTOKOL';
    setQaForm({ nama: query.trim(), jabatan: '', nip: '', kategori: defaultKategori, statusAktif: true });
    setQaError('');
    setQaWarning('');
    setQaOpen(true);
  };

  const submitQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.nativeEvent as Event).stopImmediatePropagation();
    if (!qaForm.nama.trim()) { setQaError('Nama wajib diisi.'); return; }
    startQaTransition(async () => {
      const res = await createPetugas({
        nama: qaForm.nama.trim(),
        jabatan: qaForm.jabatan.trim() || undefined,
        nip: qaForm.nip.trim() || undefined,
        statusAktif: qaForm.statusAktif,
        kategori: qaForm.kategori,
      });
      if (!res.ok) { setQaError(res.error || 'Gagal memuat petugas.'); return; }
      // Buat SearchableOption dari data form (id belum diketahui -> pakai revalidasi dari server)
      // Server action sudah revalidatePath('/worksheet') -> options di parent akan refresh
      const newOpt: SearchableOption & { kategori: KategoriPetugas } = {
        id: res.id!,
        label: qaForm.nama.trim(),
        sublabel: qaForm.statusAktif
          ? (qaForm.jabatan.trim() || undefined)
          : (qaForm.jabatan.trim() ? `${qaForm.jabatan.trim()} (Nonaktif)` : 'Nonaktif'),
        kategori: qaForm.kategori,
      };
      onPetugasCreated?.(newOpt);
      onChange([...selected, res.id!]);
      if (res.warning) {
        setQaWarning(res.warning);
      } else {
        setQaOpen(false);
      }
    });
  };

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
    const base = !q
      ? options
      : options.filter(
        (o) => o.label.toLowerCase().includes(q) || (o.sublabel || '').toLowerCase().includes(q),
      );

    // Urutkan yang sudah dicentang (by name) naik ke atas, sisanya (by name) di bawah
    return [...base].sort((a, b) => {
      const aChecked = selected.includes(a.id);
      const bChecked = selected.includes(b.id);
      if (aChecked !== bChecked) return aChecked ? -1 : 1;
      return a.label.localeCompare(b.label, 'id');
    });
  }, [options, query, selected])

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
                  const isWarn = warnIds.includes(o.id);
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
                      {isWarn && (
                        <span
                          title={warnLabel}
                          className="ml-auto shrink-0 inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full px-2 py-0.5"
                        >
                          ⚠️ Sudah dipilih
                        </span>
                      )}
                      {!isWarn && o.sublabel && (
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
              <div className="flex items-center gap-2">
                {onPetugasCreated && (
                  <button
                    type="button"
                    onClick={openQuickAdd}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-app hover:bg-app text-navy"
                  >
                    <UserPlus size={14} />
                    Tambah Baru
                  </button>
                )}
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
        </div>
      )}
      {/* --- Quick-add petugas baru --- */}
      {qaOpen && typeof document !== 'undefined' && ReactDOM.createPortal (
        <div
          className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[70]"
          onClick={() => !qaPending && setQaOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-app">
              <h3 className="font-display text-base font-semibold text-navy">Tambah Petugas Baru</h3>
              <button type="button" onClick={() => setQaOpen(false)} disabled={qaPending} aria-label="Tutup" className="p-1 rounded-md hover:bg-app disabled:opacity-40">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={submitQuickAdd} className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama <span className="text-red-500">*</span></label>
                <input 
                  autoFocus
                  value={qaForm.nama}
                  onChange={(e) => setQaForm((f) => ({ ...f, nama: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm"
                  placeholder="Nama Petugas"
                  disabled={qaPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan</label>
                <input 
                  value={qaForm.jabatan}
                  onChange={(e) => setQaForm((f) => ({ ...f, jabatan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm"
                  placeholder="Opsional"
                  disabled={qaPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select 
                  value={qaForm.kategori}
                  onChange={(e) => setQaForm((f) => ({ ...f, kategori: e.target.value as KategoriPetugas }))}
                  className="w-full px-3 py-2 rounded-lg border border-app text-sm"
                  disabled={qaPending}
                >
                  {KATEGORI_PETUGAS_OPTIONS.map((k) => (
                    <option key={k} value={k}>{KATEGORI_PETUGAS_LABEL[k]}</option>
                  ))}
                </select>
              </div>
              <label 
                className="flex items-center gap-2 text-sm cursor-pointer pt-1"
              >
                <input 
                  type="checkbox"
                  checked={qaForm.statusAktif}
                  onChange={(e) => setQaForm((f) => ({ ...f, statusAktif: e.target.checked }))}
                  disabled={qaPending}
                  className="rounded border-app text-navy" 
                />
                <span>Status aktif (karyawan saat ini)</span>
              </label>
              {qaError && <p className="text-sm text-red-600">{qaError}</p>}
              {qaWarning && (
                <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                   ⚠️ {qaWarning} 
                   <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => setQaOpen(false)} className="text-xs underline">Tutup</button>
                   </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setQaOpen(false)} disabled={qaPending} className="px-4 py-2 rounded-lg text-sm border border-app hover:bg-app disabled:opacity-40">
                  Batal
                </button>
                <button type='submit' disabled={qaPending} className='btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60'>
                  {qaPending && <Loader2 size={14} className='animate-spin' />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
