'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { getEntityName } from "@/lib/activity-log";
import Pagination from "@/components/pagination";
import { KATEGORI_PETUGAS_LABEL, type KategoriPetugasValue } from "@/lib/constants/kategori-petugas";

// -- Label Maps --

const ENTITY_LABEL: Record<string, string> = {
    KEGIATAN: 'Kegiatan',
    DOKUMEN: 'Dokumen',
    PETUGAS: 'Petugas',
    LEADING_SECTOR: 'Leading Sector',
    USER: 'User',
};

const ACTION_LABEL: Record<string, string> = {
    CREATE: 'Membuat',
    UPDATE: 'Mengubah',
    DELETE: 'Menghapus',
};

const ACTION_BADGE: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
};

const FIELD_LABEL: Record<string, string> = {
  namaKegiatan: 'Nama Kegiatan',
  tanggal: 'Tanggal',
  waktu: 'Waktu',
  tempat: 'Tempat',
  pejabat: 'Pejabat',
  leadingSectorId: 'Leading Sector',
  statusSambutan: 'Status Sambutan',
  statusKegiatan: 'Status Kegiatan',
  statusPublikasi: 'Status Publikasi',
  jenisPenugasan: 'Jenis Penugasan',
  linkUpload: 'Link Upload',
  catatan: 'Catatan',
  perihalSurat: 'Perihal Surat',
  nomorSurat: 'Nomor Surat',
  dresscode: 'Dresscode',
  allCrewProtokol: 'Semua Crew Protokol',
  allCrewLiputan: 'Semua Crew Liputan',
  picNama: 'Nama PIC',
  picNoHp: 'No. HP PIC',
  nama: 'Nama',
  kategori: 'Kategori',
  jabatan: 'Jabatan',
  noHp: 'No. HP',
  statusAktif: 'Status Aktif',
  username: 'Username',
  role: 'Role',
  password: 'Password',
  status: 'Status',
  link: 'Link',
};

// ── Types ──

type LogItem = {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  userId: string;
  user: { id: string; nama: string };
  changes: Record<string, unknown> | null;
  createdAt: string;
};

type Props = {
  logs: LogItem[];
  total: number;
  page: number;
  pageSize: number;
  filters: { entity?: string; action?: string; userId?: string; search?: string };
  users: { id: string; nama: string }[];
  leadingSectors: { id: string; nama: string }[];
};

// ── Helpers ──

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  });
}

// Key metadata (id/timestamps) tidak relevan untuk user — filter dari tampilan.
const META_KEYS = new Set(['id', 'createdAt', 'updatedAt']);

type SectorMap = Record<string, string>;

// Formatter generic untuk nilai snapshot. Menyelesaikan relasi (leadingSector,
// petugas) menjadi nama yang bisa dibaca — backward compatible untuk log lama
// (leadingSectorId string polos) maupun log baru (objek/array {id, nama}).
function formatFieldValue(key: string, val: unknown, sectorMap: SectorMap): string {
  if (val === null || val === undefined) return '-';

  // FK relasi yang disimpan sebagai string polos (log lama) → lookup nama.
  if (key === 'leadingSectorId') {
    if (typeof val === 'string') return sectorMap[val] ?? val;
    if (typeof val === 'object' && val !== null && 'nama' in val) {
      return String((val as { nama: string }).nama);
    }
    return String(val);
  }

  // Enum kategori petugas (PROTOKOL/LIPUTAN) -> label UI. Key 'kategori' juga dipakai leading sector (nilai 9 opsi teks bebas) - fallback ke nilai mentah.
  if (key === 'kategori' && typeof val === 'string') {
    return KATEGORI_PETUGAS_LABEL[val as KategoriPetugasValue] ?? val;
  }

  // Objek relasi yang sudah di-enrich {id, nama} → tampilkan nama.
  if (typeof val === 'object' && !Array.isArray(val) && 'nama' in val) {
    return String((val as { nama: string }).nama);
  }

  // Array relasi [{id, nama}] (petugas) → gabung nama.
  if (Array.isArray(val)) {
    return val
      .map((v) => (typeof v === 'object' && v !== null && 'nama' in v ? String((v as { nama: string }).nama) : String(v)))
      .join(', ');
  }

  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ── Detail Modal ──

function DetailModal({ log, onClose, sectorMap }: { log: LogItem; onClose: () => void; sectorMap: SectorMap }) {
  const changes = log.changes;
  const before = changes?.before as Record<string, unknown> | undefined;
  const after = changes?.after as Record<string, unknown> | undefined;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const visibleEntries = (obj: Record<string, unknown>) =>
    Object.entries(obj).filter(([key]) => !META_KEYS.has(key));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-log-detail-title"
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-app shrink-0">
          <h2 id="activity-log-detail-title" className="font-display font-semibold text-navy">Detail Perubahan</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1 -mr-1 rounded-md hover:bg-app text-muted">
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm text-muted">
            <div><span className="font-medium">Entity:</span> {ENTITY_LABEL[log.entity] || log.entity}</div>
            <div><span className="font-medium">Aksi:</span> {ACTION_LABEL[log.action] || log.action}</div>
            <div><span className="font-medium">Oleh:</span> {log.user.nama}</div>
            <div><span className="font-medium">Waktu:</span> {formatDate(log.createdAt)}</div>
          </div>

          {log.action === 'CREATE' && after && (
            <div>
              <h3 className="font-semibold text-sm text-navy mb-2">Data setelah dibuat:</h3>
              <div className="bg-app rounded p-3 space-y-1 text-sm">
                {visibleEntries(after).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span className="text-muted">{FIELD_LABEL[key] || key}:</span>
                    <span className="col-span-2">{formatFieldValue(key, val, sectorMap)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {log.action === 'UPDATE' && before && after && (
            <div>
              <h3 className="font-semibold text-sm text-navy mb-2">Field yang berubah:</h3>
              <div className="bg-app rounded p-3 space-y-2 text-sm">
                {Object.keys(before).map((key) => (
                  <div key={key} className="border-b border-app pb-2 last:border-0">
                    <div className="font-medium text-navy mb-1">{FIELD_LABEL[key] || key}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-1.5 rounded"><span className="text-red-500 text-xs">Before:</span> {formatFieldValue(key, before[key], sectorMap)}</div>
                      <div className="bg-green-50 p-1.5 rounded"><span className="text-green-600 text-xs">After:</span> {formatFieldValue(key, after[key], sectorMap)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {log.action === 'DELETE' && before && (
            <div>
              <h3 className="font-semibold text-sm text-navy mb-2">Data sebelum dihapus:</h3>
              <div className="bg-app rounded p-3 space-y-1 text-sm">
                {visibleEntries(before).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span className="text-muted">{FIELD_LABEL[key] || key}:</span>
                    <span className="col-span-2">{formatFieldValue(key, val, sectorMap)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function ActivityLogClient({ logs, total, page, pageSize, filters, users, leadingSectors }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [detail, setDetail] = useState<LogItem | null>(null);
  const [, startTransition] = useTransition();

  const sectorMap = useMemo(() => {
    const m: SectorMap = {};
    for (const s of leadingSectors) m[s.id] = s.nama;
    return m;
  }, [leadingSectors]);

  const totalPages = Math.ceil(total / pageSize);
  const pageStart =  total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, total);

  const setFilter = useCallback((key: string, value: string | undefined) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set(key, value); } else { params.delete(key); }
      params.set('page', '1');
      router.push(`/activity-log?${params.toString()}`);
    });
  }, [router, searchParams]);

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push('/activity-log');
    });
  }, [router]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold text-navy">Activity Log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select 
          className="px-3 py-2 rounded-lg border border-app text-sm"
          value={filters.entity || ''}
          onChange={(e) => setFilter('entity', e.target.value || undefined)}
        >
          <option value="">Semua Entity</option>
          {Object.entries(ENTITY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className="px-3 py-2 rounded-lg border border-app text-sm"
          value={filters.action || ''}
          onChange={(e) => setFilter('action', e.target.value || undefined)}
        >
          <option value="">Semua Aksi</option>
          {Object.entries(ACTION_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className="px-3 py-2 rounded-lg border border-app text-sm"
          value={filters.userId || ''}
          onChange={(e) => setFilter('userId', e.target.value || undefined)}
        >
          <option value="">Semua User</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.nama}</option>
          ))}
        </select>
        <input className="px-3 py-2 rounded-lg border border-app text-sm w-full sm:w-56"
          placeholder="Cari dalam data..."
          defaultValue={filters.search || ''}
          onBlur={(e) => setFilter('search', e.target.value || undefined)}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('search', (e.target as HTMLInputElement).value || undefined)}
        />
        {(filters.entity || filters.action || filters.userId || filters.search) && (
          <button onClick={resetFilters} className="px-3 py-2 rounded-lg border border-app text-sm hover:bg-app">
            Reset Filter
          </button>
        )}
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-app overflow-hidden transition-opacity">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-app text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 p-3 font-medium">Waktu</th>
                <th className="px-4 p-3 font-medium">Entity</th>
                <th className="px-4 p-3 font-medium">Nama</th>
                <th className="px-4 p-3 font-medium">Aksi</th>
                <th className="px-4 p-3 font-medium">Oleh</th>
                <th className="px-4 p-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-app hover:bg-slate-50">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">{ENTITY_LABEL[log.entity] || log.entity}</td>
                  <td className="px-4 py-3 font-medium">{getEntityName(log.changes)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ACTION_BADGE[log.action] || ''}`}>
                      {ACTION_LABEL[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{log.user.nama}</td>
                  <td className="px-4 py-3">
                    {log.changes && Object.keys(log.changes).length >0 ? (
                      <button onClick={() => setDetail(log)} className="text-navy hover:underline text-xs font-medium">
                        Lihat Perubahan
                      </button>
                    ) : (
                      <span className="text-muted text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">Tidak ada log yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="lg:hidden space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl border border-app p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-navy whitespace-nowrap">{formatDate(log.createdAt)}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${ACTION_BADGE[log.action] || ''}`}>
                    {ACTION_LABEL[log.action] || log.action}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-medium text-navy truncate">{getEntityName(log.changes)}</span>
                  <span className="text-muted">({ENTITY_LABEL[log.entity] || log.entity})</span>
                </div>
                <div className="mt-1 text-xs text-muted">Oleh: {log.user.nama}</div>
              </div>
              {log.changes && Object.keys(log.changes).length > 0 && (
                <button
                  onClick={() => setDetail(log)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-navy bg-amber-50 rounded-lg hover:bg-amber-100 whitespace-nowrap"
                >
                  Detail
                </button>
              )}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="bg-white rounded-2xl border border-app p-10 text-center text-muted">
            Tidak ada log yang cocok.
          </div>
        )}
      </div>

      {/* Pagination + Info */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Menampilkan {pageStart}-{pageEnd} dari {total} log</span>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(p));
              router.push(`/activity-log?${params.toString()}`);
            }}
          />
        </div>
      )}

      {/* Detail Modal */}
      {detail && <DetailModal log={detail} onClose={() => setDetail(null)} sectorMap={sectorMap} />}
    </div>
  );
}
