'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { STATUS_KEGIATAN_BADGE_CLASS, STATUS_KEGIATAN_LABEL, type StatusKegiatanValue } from '@/lib/constants/status-kegiatan';

type KalenderEvent = {
  id: string;
  namaKegiatan: string;
  tanggal: Date;
  waktu: string | null;
  statusKegiatan: StatusKegiatanValue;
};

const POPOVER_W = 288;
const POPOVER_MAX_H = 320;
const GAP = 6;
const VIEWPORT_PAD = 8;

// Key harus sama persis dengan server (kalender/page.tsx) agar data-open-tanggal cocok.
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Hanya menangani interaktivitas popover agenda per hari.
 * Grid kalender tetap di-render server (children). Klik pada trigger
 * (data-open-tanggal) dibuka lewat event delegation, lalu popover muncul
 * di dekat sel dan di-clamp agar tidak keluar viewport.
 */
export default function KalenderClient({
  events,
  children,
}: {
  events: KalenderEvent[];
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

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

  // Delegasi klik di container: trigger mana pun yang diklik → buka popover hari itu.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trigger = target.closest<HTMLElement>('[data-open-tanggal]');
      if (!trigger) return;
      const key = trigger.dataset.openTanggal;
      if (!key) return;

      const r = trigger.getBoundingClientRect();
      let left = r.left;
      if (left + POPOVER_W > window.innerWidth - VIEWPORT_PAD) {
        left = window.innerWidth - VIEWPORT_PAD - POPOVER_W;
      }
      if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;
      let top = r.bottom + GAP;
      if (top + POPOVER_MAX_H > window.innerHeight - VIEWPORT_PAD) {
        top = Math.max(VIEWPORT_PAD, window.innerHeight - VIEWPORT_PAD - POPOVER_MAX_H);
      }

      setPos({ left, top });
      setOpenKey(key);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, []);

  // Tutup: klik di luar, Escape. Klik trigger lain dibiarkan agar delegation menangani perpindahan.
  useEffect(() => {
    if (!openKey) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (popoverRef.current?.contains(t)) return;
      if (t.closest('[data-open-tanggal]')) return;
      setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openKey]);

  const list = openKey ? (byTanggal.get(openKey) ?? []) : [];
  const sorted = [...list].sort((a, b) => {
    const wa = a.waktu ?? '';
    const wb = b.waktu ?? '';
    if (wa !== wb) return wa < wb ? -1 : 1;
    return a.namaKegiatan.localeCompare(b.namaKegiatan);
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
          ref={popoverRef}
          role="dialog"
          aria-label={`Agenda ${headerLabel}`}
          className="fixed z-50 w-[288px] bg-white rounded-xl border border-app shadow-lg"
          style={{ left: pos?.left, top: pos?.top }}
        >
          <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-app">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy leading-tight">{headerLabel}</p>
              <p className="text-xs text-muted mt-0.5">{sorted.length} kegiatan</p>
            </div>
            <button
              type="button"
              onClick={() => setOpenKey(null)}
              aria-label="Tutup"
              className="p-1 -mr-1 rounded-md hover:bg-app text-muted"
            >
              <X size={14} />
            </button>
          </div>
          <ul className="max-h-[320px] overflow-y-auto p-1.5 space-y-0.5">
            {sorted.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted">Tidak ada kegiatan.</li>
            ) : (
              sorted.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/worksheet/${k.id}`}
                    className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-app"
                  >
                    {k.waktu && (
                      <span className="font-mono text-xs text-muted pt-0.5 whitespace-nowrap">{k.waktu}</span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate">{k.namaKegiatan}</span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-0.5 ${STATUS_KEGIATAN_BADGE_CLASS[k.statusKegiatan]}`}
                      >
                        {STATUS_KEGIATAN_LABEL[k.statusKegiatan]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
