'use client';

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useTransition } from "react";
import { Download, FileDown, Settings2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { STATUS_KEGIATAN_LABEL, STATUS_KEGIATAN_CELL_CLASS } from "@/lib/constants/status-kegiatan";
import { formatTanggal } from '@/lib/format';
import { JENIS_PENUGASAN_LABEL, type JenisPenugasanValue } from "@/lib/constants/status-penugasan";
import { STATUS_PUBLIKASI_LABEL, type StatusPublikasiValue } from "@/lib/constants/status-publikasi";
import type { StatusKegiatan } from "@prisma/client";

type KegiatanItem = {
    id: string;
    namaKegiatan: string;
    tanggal: string;
    waktu: string | null;
    tempat: string;
    pejabat: string;
    perihalSurat: string | null;
    nomorSurat: string | null;
    dresscode: string | null;
    picNama: string | null;
    picNoHp: string | null;
    leadingSectorNama: string;
    statusSambutan: string;
    statusKegiatan: StatusKegiatan;
    petugasProtokolNama: string[];
    petugasLiputanNama: string[];
    allCrewProtokol: boolean;
    allCrewLiputan: boolean;
    jenisPenugasan: JenisPenugasanValue;
    statusPublikasi: StatusPublikasiValue;
};

/** ALL CREW: seluruh anggota kategori bertugas, nama terpilih = Penanggung Jawab.
 * Non-ALL CREW tetap menampilkan daftar lengkap (laporan adalah report).
 */
function crewLabel(allCrew: boolean, names: string[]): string {
    if (!allCrew) return names.join(', ') || '-';
    const pj = names.join(', ') || '-';
    return pj === '-' ? 'Semua crew' : `Semua crew (PJ: ${pj})`;
}

// Urutan array = urutan kolom tabel/laporan - jadi header & row XLSX ikut urutan itu.
type ColumnKey = 
    | 'tanggal' | 'namaKegiatan' | 'perihalSurat' | 'nomorSurat' | 'dresscode'
    | 'waktu' | 'tempat' | 'pejabat' | 'picNoHp' | 'leadingSector'
    | 'statusSambutan' | 'statusKegiatan' | 'petugasProtokol' | 'petugasLiputan'
    | 'jenisPenugasan' | 'statusPublikasi';

const COLUMNS: { key: ColumnKey; label: string; get: (k: KegiatanItem) => string }[] = [
    { key: 'tanggal', label: 'Tanggal Pelaksanaan', get: (k) => formatTanggal(k.tanggal) },
    { key: 'namaKegiatan', label: 'Nama Kegiatan', get: (k) => k.namaKegiatan },
    { key: 'perihalSurat', label: 'Perihal Surat', get: (k) => k.perihalSurat || '' },
    { key: 'nomorSurat', label: 'Nomor Surat', get: (k) => k.nomorSurat || '' },
    { key: 'dresscode', label: 'Dresscode', get: (k) => k.dresscode || '' },
    { key: 'waktu', label: 'Waktu', get: (k) => k.waktu || '' },
    { key: 'tempat', label: 'Tempat', get: (k) => k.tempat },
    { key: 'pejabat', label: 'Pejabat', get: (k) => k.pejabat },
    { key: 'picNoHp', label: 'No. HP PIC', get: (k) => k.picNoHp || '' },
    { key: 'leadingSector', label: 'Leading Sector', get: (k) => k.leadingSectorNama },
    { key: 'statusSambutan', label: 'Status Sambutan', get: (k) => k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum' },
    { key: 'statusKegiatan', label: 'Status Kegiatan', get: (k) => STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan },
    { key: 'petugasProtokol', label: 'Petugas Protokol', get: (k) => crewLabel(k.allCrewProtokol, k.petugasProtokolNama) },
    { key: 'petugasLiputan', label: 'Petugas Liputan', get: (k) => crewLabel(k.allCrewLiputan, k.petugasLiputanNama) },
    { key: 'jenisPenugasan', label: 'Jenis Penugasan', get: (k) => JENIS_PENUGASAN_LABEL[k.jenisPenugasan] },
    { key: 'statusPublikasi', label: 'Status Publikasi', get: (k) => STATUS_PUBLIKASI_LABEL[k.statusPublikasi] },
];

const ALL_COLUMN_KEYS: ColumnKey[] = COLUMNS.map((c) => c.key);
const STORAGE_KEY = 'laporan.exportColumns';

type Props = {
    data: KegiatanItem[];
    startDate: string;
    endDate: string;
};

export default function LaporanClient({ data, startDate, endDate }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [localStart, setLocalStart] = useState(startDate);
    const [localEnd, setLocalEnd] = useState(endDate);

    const [activeColumns, setActiveColumns] = useState<ColumnKey[]>(ALL_COLUMN_KEYS);
    const [showColumnPicker, setShowColumnPicker] = useState(false)
    const [hydrated, setHydrated] = useState(false);

    // Baca pilihan setela mount (render awal selalu semua kolom -> tanpa hydration mismatch).
    useEffect (() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;
            const keys = parsed.filter((k) : k is string => typeof k === 'string');
            const valid = keys.filter((k) : k is ColumnKey => COLUMNS.some((c) => c.key === k));
            if (valid.length > 0) setActiveColumns(valid); 
        } catch {
            //data korup -> biarkan default (semua kolum)
        } finally {
            setHydrated(true); // penanda: nilai localStorage sudah dibaca, aman untuk menalis
        }
    }, []);

    // Simpan tiap perubahan.
    useEffect(() => {
        if (!hydrated) return;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(activeColumns)); } catch {
            // stroage penuh / private mode -> abaikan, aplikasi tetap jalan 
        }
    }, [activeColumns, hydrated]);

    const toggleColumn = (key : ColumnKey) => {
        setActiveColumns((prev) => {
            if (prev.includes(key)) {
                if (prev.length === 1) return prev; // minimal 1 kolom aktif 
                return prev.filter((k) => k!== key);
            }
            return [...prev, key];
        });
    };

    const summary = useMemo(() => {
        const perStatus: Record<string, number> = {};
        data.forEach((k) => {
            perStatus[k.statusKegiatan] = (perStatus[k.statusKegiatan] || 0) + 1;
        });
        return { total: data.length, perStatus };
    }, [data]);

    const applyFilter = () => {
        startTransition(() => {
            const params = new URLSearchParams();
            if (localStart) params.set('startDate', localStart);
            if (localEnd) params.set('endDate', localEnd);
            router.push(`/laporan?${params.toString()}`);
        });
    };

    const exportXlsx = () => {
        const active = COLUMNS.filter((c) => activeColumns.includes(c.key));
        if (active.length === 0) {
            alert('Pilih minimal satu kolom untuk diexport.');
            return;
        }

        const header = active.map((c) => c.label);
        const rows = data.map((k) => active.map((c) => c.get(k)));

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const colWidths = header.map((_, ci) => ({
            wch: Math.min(Math.max(header[ci].length, ...rows.map((r) => String(r[ci] ?? '').length)) + 2, 40),
        }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        XLSX.writeFile(wb, `laporan-spj-${localStart || 'awal'}-${localEnd || 'akhir'}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {/* Header khusus cetak/PDF — tersembunyi di layar */}
            <div className="hidden print:block text-center mb-4">
                <h1 className="text-lg font-bold">LAPORAN KEGIATAN PROTOKOL</h1>
                <p className="text-sm">Periode: {formatTanggal(localStart)} s.d. {formatTanggal(localEnd)}</p>
            </div>

            <h1 className="text-2xl font-bold no-print">Laporan Kegiatan</h1>

            {/* Filter */}
            <div className="no-print flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Tanggal Awal</label>
                    <input 
                        type="date"
                        value={localStart}
                        onChange={(e) => setLocalStart(e.target.value)}
                        className="border rounded px-3 py-1.5 text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Tanggal Akhir</label>
                    <input 
                        type="date" 
                        value={localEnd} 
                        onChange={(e) => setLocalEnd(e.target.value)}
                        className="border rounded px-3 py-1.5 text-sm" 
                    />
                </div>
                <button
                    onClick={applyFilter}
                    disabled={isPending}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Memuat...' : 'Tampilkan'}
                </button>
                <button
                    onClick={exportXlsx}
                    className="px-4 py-1.5 border text-sm rounded hover:bg-gray-100 flex items-center gap-1.5"
                >
                    <Download size={14} /> Export XLSX
                </button>
                <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 border text-sm rounded hover:bg-gray-100 flex items-center gap-1.5"
                >
                    <FileDown size={14} /> Export PDF
                </button>
                <button
                    onClick={() => setShowColumnPicker((v) => !v)}
                    className={`px-4 py-1.5 border text-sm rounded hover:bg-gray-100 flex items-center gap-1.5 ${showColumnPicker ? 'bg-gray-100' : ''}`}
                >
                    <Settings2 size={14} /> Kolom Export
                </button>
            </div>

            {/* Column Picker */}
            {showColumnPicker && (
                <div className="no-print border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Kolom Export ({activeColumns.length}/{COLUMNS.length})
                        </span>
                        <button onClick={() => setActiveColumns(ALL_COLUMN_KEYS)} className="text-xs text-blue-600 hover:underline">
                            Pilih Semua
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">
                        {COLUMNS.map((c) => (
                            <label key={c.key} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" 
                                    checked={activeColumns.includes(c.key)}
                                    onChange={() => toggleColumn(c.key)}
                                    className="accent-blue-600"
                                />
                                {c.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="no-print flex flex-wrap gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm">
                    <span className="text-blue-600 font-semibold">{summary.total}</span>{' '}
                    <span className="text-blue-500">total kegiatan</span>
                </div>
                {Object.entries(summary.perStatus).map(([status, count]) => (
                    <div key={status} className="bg-gray-50 border rounded-lg px-4 py-2 text-sm">
                        <span className="font-semibold">{count}</span>{' '}
                        <span className="text-gray-500">{STATUS_KEGIATAN_LABEL[status as keyof typeof STATUS_KEGIATAN_LABEL] || status}</span>
                    </div>
                ))}
            </div>

            {/* Mobile: card per kegiatan -- semua field terbaca tanpa scroll */}
            <div className="md:hidden print:hidden space-y-3">
                {data.length === 0 ? (
                    <p className="p-6 text-center text-gray-400 text-sm">Tidak ada data.</p>
                ) : (
                    data.map((k) => (
                        <div key={k.id} className="bg-white border rounded-xl p-3.5 text-sm">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-medium text-navy">{formatTanggal(k.tanggal)}</p>
                                    <p className="font-semibold mt-0.5">{k.namaKegiatan}</p>
                                </div>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${STATUS_KEGIATAN_CELL_CLASS[k.statusKegiatan]}`}>
                                    {STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}
                                </span>
                            </div>
                            <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-grey-600">
                                <div><dt className="text-gray-400">Waktu</dt><dd>{k.waktu || '-'}</dd></div>
                                <div><dt className="text-gray-400">Tempat</dt><dd>{k.tempat}</dd></div>
                                <div><dt className="text-gray-400">Pejabat</dt><dd>{k.pejabat}</dd></div>
                                <div><dt className="text-gray-400">No. HP PIC</dt><dd>{k.picNoHp || '-'}</dd></div>
                                <div className="col-span-2"><dt className="text-gray-400">Perihal Surat</dt><dd>{k.perihalSurat || '-'}</dd></div>
                                <div className="col-span-2"><dt className="text-gray-400">Nomor Surat</dt><dd>{k.nomorSurat || '-'}</dd></div>
                                <div><dt className="text-gray-400">Dresscode</dt><dd>{k.dresscode || '-'}</dd></div>
                                <div><dt className="text-gray-400">Leading Sector</dt><dd>{k.leadingSectorNama}</dd></div>
                                <div><dt className="text-gray-400">Sambutan</dt><dd>{k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum'}</dd></div>
                                <div><dt className="text-gray-400">Jenis Penugasan</dt><dd>{JENIS_PENUGASAN_LABEL[k.jenisPenugasan]}</dd></div>
                                <div className="col-span-2"><dt className="text-gray-400">Petugas Protokol</dt><dd>{crewLabel(k.allCrewProtokol, k.petugasProtokolNama)}</dd></div>
                                <div className="col-span-2"><dt className="text-gray-400">Petugas Liputan</dt><dd>{crewLabel(k.allCrewLiputan, k.petugasLiputanNama)}</dd></div>
                                <div><dt className="text-gray-400">Status Publikasi</dt><dd>{STATUS_PUBLIKASI_LABEL[k.statusPublikasi]}</dd></div>
                            </dl>
                        </div>
                    ))
                )}
            </div>
            
            {/* Table */}
            <div className={`overflow-x-auto border rounded-lg transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-2.5 font-medium text-gray-600">Tanggal Pelaksanaan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Kegiatan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Perihal Surat</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Nomor Surat</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Dresscode</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Waktu</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Tempat</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Pejabat</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">No. HP PIC</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Leading Sector</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Status Sambutan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Status Kegiatan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Petugas Protokol</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Petugas Liputan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Jenis Penugasan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Status Publikasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((k) => (
                            <tr key={k.id} className="border-b hover:bg-gray-50">
                                <td className="p-2.5 whitespace-nowrap">{formatTanggal(k.tanggal)}</td>
                                <td className="p-2.5 font-medium">{k.namaKegiatan}</td>
                                <td className="p-2.5 text-gray-500  max-w-[200px] truncate">{k.perihalSurat || '-'}</td>
                                <td className="p-2.5 text-gray-500  max-w-[180px] truncate">{k.nomorSurat || '-'}</td>
                                <td className="p-2.5 text-gray-500  max-w-[120px] truncate">{k.dresscode || '-'}</td>
                                <td className="p-2.5 text-gray-500 ">{k.waktu || '-'}</td>
                                <td className="p-2.5 text-gray-500  max-w-[200px] truncate">{k.tempat}</td>
                                <td className="p-2.5">{k.pejabat}</td>
                                <td className="p-2.5 text-gray-500 ">{k.picNoHp || '-'}</td>
                                <td className="p-2.5 text-gray-500 ">{k.leadingSectorNama}</td>
                                <td className="p-2.5">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${k.statusSambutan === 'SUDAH' ? 'badge-sudah' : 'badge-belum'}`}>
                                        {k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum'}
                                    </span>
                                </td>
                                <td className="p-2.5">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_KEGIATAN_CELL_CLASS[k.statusKegiatan]}`}>
                                        {STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}
                                    </span>
                                </td>
                                <td className="p-2.5 text-gray-500 ">{crewLabel(k.allCrewProtokol, k.petugasProtokolNama)}</td>
                                <td className="p-2.5 text-gray-500  max-w-[200px] truncate">{crewLabel(k.allCrewLiputan, k.petugasLiputanNama)}</td>
                                <td className="p-2.5 text-gray-500 ">{JENIS_PENUGASAN_LABEL[k.jenisPenugasan]}</td>
                                <td className="p-2.5 text-gray-500 ">{STATUS_PUBLIKASI_LABEL[k.statusPublikasi]}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan={16} className="p-6 text-center text-gray-400">Tidak ada data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    nav, header, button, .no-print { display: none !important; }
                    body { font-size: 10pt; }
                    table { page-break-after: auto; }
                    tr { page-break-inside: avoid; }
                    .overflow-x-auto { overflow: visible !important; }
                    table th, table td { display: table-cell !important; }
                }
            `}</style>
        </div>
    );
}