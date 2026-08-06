'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo, useEffect, useTransition } from "react";
import { getEntityName } from "@/lib/activity-log";
import Pagination from "@/components/pagination";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-log-detail-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="activity-log-detail-title" className="text-lg font-semibold">Detail Perubahan</h2>
          <button onClick={onClose} aria-label="Tutup" className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
            <div><span className="font-medium">Entity:</span> {ENTITY_LABEL[log.entity] || log.entity}</div>
            <div><span className="font-medium">Aksi:</span> {ACTION_LABEL[log.action] || log.action}</div>
            <div><span className="font-medium">Oleh:</span> {log.user.nama}</div>
            <div><span className="font-medium">Waktu:</span> {formatDate(log.createdAt)}</div>
          </div>

          {log.action === 'CREATE' && after && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Data setelah dibuat:</h3>
              <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
                {visibleEntries(after).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">{FIELD_LABEL[key] || key}:</span>
                    <span className="col-span-2">{formatFieldValue(key, val, sectorMap)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {log.action === 'UPDATE' && before && after && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Field yang berubah:</h3>
              <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                {Object.keys(before).map((key) => (
                  <div key={key} className="border-b border-gray-200 pb-2 last:border-0">
                    <div className="font-medium text-gray-600 mb-1">{FIELD_LABEL[key] || key}</div>
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
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Data sebelum dihapus:</h3>
              <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
                {visibleEntries(before).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">{FIELD_LABEL[key] || key}:</span>
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
  const [isPending, startTransition] = useTransition();

  const sectorMap = useMemo(() => {
    const m: SectorMap = {};
    for (const s of leadingSectors) m[s.id] = s.nama;
    return m;
  }, [leadingSectors]);

  const totalPages = Math.ceil(total / pageSize);

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
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Activity Log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Entity</label>
          <select
            className="border rounded px-3 py-1.5 text-sm"
            value={filters.entity || ''}
            onChange={(e) => setFilter('entity', e.target.value || undefined)}
          >
            <option value="">Semua Entity</option>
            {Object.entries(ENTITY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Aksi</label>
          <select
            className="border rounded px-3 py-1.5 text-sm"
            value={filters.action || ''}
            onChange={(e) => setFilter('action', e.target.value || undefined)}
          >
            <option value="">Semua Aksi</option>
            {Object.entries(ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">User</label>
          <select
            className="border rounded px-3 py-1.5 text-sm"
            value={filters.userId || ''}
            onChange={(e) => setFilter('userId', e.target.value || undefined)}
          >
            <option value="">Semua User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.nama}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Pencarian</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-48"
            placeholder="Cari dalam data..."
            defaultValue={filters.search || ''}
            onBlur={(e) => setFilter('search', e.target.value || undefined)}
            onKeyDown={(e) => e.key === 'Enter' && setFilter('search', (e.target as HTMLInputElement).value || undefined)}
          />
        </div>
        {(filters.entity || filters.action || filters.userId || filters.search) && (
          <button onClick={resetFilters} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100">
            Reset Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`overflow-x-auto border rounded-lg transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Waktu</th>
              <th className="text-left p-3 font-medium text-gray-600">Entity</th>
              <th className="text-left p-3 font-medium text-gray-600">Nama</th>
              <th className="text-left p-3 font-medium text-gray-600">Aksi</th>
              <th className="text-left p-3 font-medium text-gray-600">Oleh</th>
              <th className="text-left p-3 font-medium text-gray-600">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                <td className="p-3">{ENTITY_LABEL[log.entity] || log.entity}</td>
                <td className="p-3 font-medium">{getEntityName(log.changes)}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ACTION_BADGE[log.action] || ''}`}>
                    {ACTION_LABEL[log.action] || log.action}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{log.user.nama}</td>
                <td className="p-3">
                  {log.changes && Object.keys(log.changes).length > 0 ? (
                    <button onClick={() => setDetail(log)} className="text-blue-600 hover:underline text-xs">
                      Lihat Perubahan
                    </button>
                  ) : (
                    <span className="text-gray-300 text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Tidak ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + Info */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{total} data</span>
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
