'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { X, ExternalLink, ChevronDown } from 'lucide-react';
import {
  STATUS_KEGIATAN_BADGE_CLASS,
  STATUS_KEGIATAN_LABEL,
  type StatusKegiatanValue,
} from '@/lib/constants/status-kegiatan';
import { JENIS_PENUGASAN_LABEL, type JenisPenugasanValue } from '@/lib/constants/status-penugasan';
import { STATUS_PUBLIKASI_LABEL, type StatusPublikasiValue } from '@/lib/constants/status-publikasi';
import type { JenisDokumenValue, StatusDokumenValue } from '@/lib/constants/status-dokumen';

type KalenderDokumen = {
  jenis: JenisDokumenValue;
  status: StatusDokumenValue;
  link: string | null;
  catatan: string | null;
};

// Harus match persis shape select di server (kalender/page.tsx) - termasuk
// leadingSector nested, bukan flat.
type KalenderEvent = {
  id: string;
  namaKegiatan: string;
  tanggal: Date;
  waktu: string | null;
  statusKegiatan: StatusKegiatanValue;
  tempat: string;
  pejabat: string;
  perihalSurat: string | null;
  nomorSurat: string | null;
  dresscode: string | null;
  picNama: string | null;
  picNoHp: string | null;
  leadingSector: { nama: string } | null;
  jenisPenugasan: JenisPenugasanValue;
  statusPublikasi: StatusPublikasiValue;
  dokumen: KalenderDokumen[];
  createdAt: Date;
};

// Key harus sama persis dengan server (kalender/page.tsx) agar data-open-tanggal cocok.
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// --- Item Kegiatan (accordion detail) ---
function KegiatanItem({
  k,
  expanded,
  onToggle,
}: {
  k: KalenderEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-app overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-app"
      >
        {k.waktu && (
          <span className="font-mono text-xs text-muted pt-0.5 whitespace-nowrap">{k.waktu}</span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium truncate">{k.namaKegiatan}</span>
          <span
            className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-1 ${STATUS_KEGIATAN_BADGE_CLASS[k.statusKegiatan]}`}
          >
            {STATUS_KEGIATAN_LABEL[k.statusKegiatan]}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-muted mt-1 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-app">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted text-xs">Tempat</dt>
              <dd className="font-medium">{k.tempat}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Pejabat</dt>
              <dd className="font-medium">{k.pejabat}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Perihal Surat</dt>
              <dd className="font-medium">{k.perihalSurat || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Nomor Surat</dt>
              <dd className="font-medium">{k.nomorSurat || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Dresscode</dt>
              <dd className="font-medium">{k.dresscode || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">No. HP PIC (LS)</dt>
              <dd className="font-medium">{k.picNoHp || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Leading Sector (LS)</dt>
              <dd className="font-medium">{k.leadingSector?.nama ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">PIC (LS)</dt>
              <dd className="font-medium">{k.picNama || '-'}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Jenis Penugasan</dt>
              <dd className="font-medium">{JENIS_PENUGASAN_LABEL[k.jenisPenugasan]}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Status Publikasi</dt>
              <dd className="font-medium">{STATUS_PUBLIKASI_LABEL[k.statusPublikasi]}</dd>
            </div>
          </dl>

          <div className="flex justify-end pt-1 border-t border-app">
            <Link
              href={`/worksheet/${k.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-app text-navy hover:bg-slate-200 transition-colors"
            >
              Lihat Detail <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function KalenderClient({
  events,
  children,
}: {
  events: KalenderEvent[];
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const byTanggal = useMemo(() => {
    const m = new Map<string, KalenderEvent[]>();
    for (const k of events) {
      const key = dateKey(k.tanggal);
      const arr = m.get(key) ?? [];
      arr.push(k);
      m.set(key, arr);
    }
    return m;
  }, [events]);

  // Delegasi klik: trigger (data-open-tanggal) -> buka modal hari itu.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trigger = target.closest<HTMLElement>('[data-open-tanggal]');
      if (!trigger) return;
      const key = trigger.dataset.openTanggal;
      if (!key) return;
      setOpenKey(key);
      setExpandedId(null);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, []);

  // Tutup: Escape. Klik backdrop ditangani onClick pada wrapper modal.
  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openKey]);

  // Lock page scroll while modal is open. Lock html AND body — di browser
  // desktop viewport yang discroll adalah documentElement, body saja tidak cukup.
  useEffect(() => {
    if (!openKey) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [openKey]);

  const list = openKey ? (byTanggal.get(openKey) ?? []) : [];
  const sorted = [...list].sort((a, b) => {
    const wa = a.waktu ?? '';
    const wb = b.waktu ?? '';
    const aHasWaktu = wa !== '';
    const bHasWaktu = wb !== '';
    // Data dengan waktu di atas, tanpa waktu di bawah
    if (aHasWaktu !== bHasWaktu) return aHasWaktu ? -1 : 1;
    // Keduanya punya waktu: urut ASC
    if (wa !== wb) return wa < wb ? -1 : 1;
    // Tie-break: createdAt ASC (data lama di atas) - konsisten dengan worksheet
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const headerDate = openKey
    ? new Date(Number(openKey.split('-')[0]), Number(openKey.split('-')[1]), Number(openKey.split('-')[2]))
    : null;
  const headerLabel = headerDate
    ? headerDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div ref={containerRef}>
      {children}
      {openKey && headerDate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setOpenKey(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="kalender-agenda-title"
        >
          <div
            className="bg-white w-full sm:max-w-[760px] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-app shrink-0">
              <div className="min-w-0">
                <h2 id="kalender-agenda-title" className="text-sm font-semibold text-navy leading-tight">
                  {headerLabel}
                </h2>
                <p className="text-xs text-muted mt-0.5">{sorted.length} kegiatan</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenKey(null)}
                aria-label="Tutup"
                className="p-1 -mr-1 rounded-md hover:bg-app text-muted shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body scrollable */}
            <div className="overflow-y-auto p-3 space-y-2">
              {sorted.length === 0 ? (
                <p className="px-2 py-6 text-sm text-muted text-center">Tidak ada kegiatan.</p>
              ) : (
                sorted.map((k) => (
                  <KegiatanItem
                    key={k.id}
                    k={k}
                    expanded={expandedId === k.id}
                    onToggle={() => setExpandedId((cur) => (cur === k.id ? null : k.id))}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
