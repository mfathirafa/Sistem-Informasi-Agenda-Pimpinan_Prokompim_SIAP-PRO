'use client';

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useTransition, type ReactNode } from "react";
import { Download, Settings2, FileText, Table } from "lucide-react";
import * as XLSX from 'xlsx';
import { STATUS_KEGIATAN_LABEL, STATUS_KEGIATAN_CELL_CLASS } from "@/lib/constants/status-kegiatan";
import { formatTanggal } from '@/lib/format';
import { JENIS_PENUGASAN_LABEL, type JenisPenugasanValue } from "@/lib/constants/status-penugasan";
import { STATUS_PUBLIKASI_LABEL, type StatusPublikasiValue } from "@/lib/constants/status-publikasi";
import type { StatusKegiatan } from "@prisma/client";

// Format tanggal Indonesia untuk print
function formatTanggalIndonesia(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

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

type ColumnDef = {
    key: ColumnKey;
    label: string;
    /** String polos untuk export XLSX. */
    get: (k: KegiatanItem) => string;
    /** JSX untuk tabel layar / kartu mobile / print. */
    render: (k: KegiatanItem) => ReactNode;
    tdClass?: string;
};

const COLUMNS: ColumnDef[] = [
    { key: 'tanggal', label: 'Tanggal Pelaksanaan', get: (k) => formatTanggal(k.tanggal), render: (k) => formatTanggal(k.tanggal), tdClass: 'whitespace-nowrap' },
    { key: 'namaKegiatan', label: 'Nama Kegiatan', get: (k) => k.namaKegiatan, render: (k) => k.namaKegiatan, tdClass: 'font-medium' },
    { key: 'perihalSurat', label: 'Perihal Surat', get: (k) => k.perihalSurat || '', render: (k) => k.perihalSurat || '-', tdClass: 'text-gray-500 max-w-[200px] truncate' },
    { key: 'nomorSurat', label: 'Nomor Surat', get: (k) => k.nomorSurat || '', render: (k) => k.nomorSurat || '-', tdClass: 'text-gray-500 max-w-[180px] truncate' },
    { key: 'dresscode', label: 'Dresscode', get: (k) => k.dresscode || '', render: (k) => k.dresscode || '-', tdClass: 'text-gray-500 max-w-[120px] truncate' },
    { key: 'waktu', label: 'Waktu', get: (k) => k.waktu || '', render: (k) => k.waktu || '-', tdClass: 'text-gray-500' },
    { key: 'tempat', label: 'Tempat', get: (k) => k.tempat, render: (k) => k.tempat, tdClass: 'text-gray-500 max-w-[200px] truncate' },
    { key: 'pejabat', label: 'Pejabat', get: (k) => k.pejabat, render: (k) => k.pejabat },
    { key: 'picNoHp', label: 'No. HP PIC', get: (k) => k.picNoHp || '', render: (k) => k.picNoHp || '-', tdClass: 'text-gray-500' },
    { key: 'leadingSector', label: 'Leading Sector', get: (k) => k.leadingSectorNama, render: (k) => k.leadingSectorNama, tdClass: 'text-gray-500' },
    {
        key: 'statusSambutan', label: 'Status Sambutan',
        get: (k) => k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum',
        render: (k) => (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${k.statusSambutan === 'SUDAH' ? 'badge-sudah' : 'badge-belum'}`}>
                {k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum'}
            </span>
        ),
    },
    {
        key: 'statusKegiatan', label: 'Status Kegiatan',
        get: (k) => STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan,
        render: (k) => (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_KEGIATAN_CELL_CLASS[k.statusKegiatan]}`}>
                {STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}
            </span>
        ),
    },
    { key: 'petugasProtokol', label: 'Petugas Protokol', get: (k) => crewLabel(k.allCrewProtokol, k.petugasProtokolNama), render: (k) => crewLabel(k.allCrewProtokol, k.petugasProtokolNama), tdClass: 'text-gray-500' },
    { key: 'petugasLiputan', label: 'Petugas Liputan', get: (k) => crewLabel(k.allCrewLiputan, k.petugasLiputanNama), render: (k) => crewLabel(k.allCrewLiputan, k.petugasLiputanNama), tdClass: 'text-gray-500 max-w-[200px] truncate' },
    { key: 'jenisPenugasan', label: 'Jenis Penugasan', get: (k) => JENIS_PENUGASAN_LABEL[k.jenisPenugasan], render: (k) => JENIS_PENUGASAN_LABEL[k.jenisPenugasan], tdClass: 'text-gray-500' },
    { key: 'statusPublikasi', label: 'Status Publikasi', get: (k) => STATUS_PUBLIKASI_LABEL[k.statusPublikasi], render: (k) => STATUS_PUBLIKASI_LABEL[k.statusPublikasi], tdClass: 'text-gray-500' },
];

// Kolom untuk Laporan Ringkas (print-friendly, 9 kolom)
const RINGKAS_COLUMN_KEYS: ColumnKey[] = [
    'tanggal', 'namaKegiatan', 'tempat', 'pejabat', 'waktu',
    'leadingSector', 'petugasProtokol', 'petugasLiputan', 'statusKegiatan'
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
    const [printMode, setPrintMode] = useState<'ringkas' | 'detail'>('ringkas');

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

    // Kolom yang digunakan untuk print (tergantung mode)
    const printColumns = useMemo(() => {
        if (printMode === 'ringkas') {
            return COLUMNS.filter((c) => RINGKAS_COLUMN_KEYS.includes(c.key));
        }
        return COLUMNS.filter((c) => activeColumns.includes(c.key));
    }, [printMode, activeColumns]);

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
            {/* Header khusus cetak/PDF - tersembunyi di layar */}
            <div className="hidden print:block">
                {/* Kop Surat Resmi */}
                <div className="flex items-start gap-4 border-b-2 border-black pb-4 mb-4">
                    {/* Logo resmi - taruh file logo di public/logo-pemkab.png */}
                    <img 
                        src="/logo-pemkab.png" 
                        alt="Logo Pemkab"
                        className="w-16 h-16 flex-shrink-0 rounded-full object-cover" 
                    />
                    <div className="flex-1 text-center">
                        <p className="text-[11pt] font-bold tracking-wider">PEMERINTAH KABUPATEN BREBES</p>
                        <p className="text-[10pt] font-medium tracking-wide">SEKRETARIAT DAERAH</p>
                        <p className="text-[11pt] font-bold tracking-wider">BAGIAN PROTOKOL DAN KOMUNIKASI PIMPINAN</p>
                        <p className="text-[9pt] text-gray-600 mt-1">Jl. Proklamasi No. 77 Brebes 52212</p>
                    </div>
                    <div className="w-16 h-16 flex-shrink-0" /> {/* Spacer untuk center judul */}
                </div>

                {/* Judul Laporan */}
                <div className="text-center mb-3">
                    <h1 className="text-[12pt] font-bold underline">LAPORAN KEGIATAN PROTOKOL</h1>
                    <p className="text-[10pt] mt-1">
                        Periode: {formatTanggalIndonesia(localStart)} s.d. {formatTanggalIndonesia(localEnd)}
                    </p>
                </div>
            </div>

            <h1 className="font-display text-xl font-semibold text-navy no-print">Laporan Kegiatan</h1>

            {/* Filter */}
            <div className="no-print flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Tanggal Awal</label>
                    <input 
                        type="date"
                        value={localStart}
                        onChange={(e) => setLocalStart(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-app text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Tanggal Akhir</label>
                    <input 
                        type="date" 
                        value={localEnd} 
                        onChange={(e) => setLocalEnd(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-app text-sm"
                    />
                </div>
                <button
                    onClick={applyFilter}
                    disabled={isPending}
                    className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                >
                    {isPending ? 'Memuat...' : 'Tampilkan'}
                </button>
                <button
                    onClick={exportXlsx}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app text-sm hover:bg-app"
                >
                    <Download size={14} /> Export XLSX
                </button>
                <button
                    onClick={() => { setPrintMode('ringkas'); setTimeout(() => window.print(), 0); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app text-sm hover:bg-app"
                >
                    <FileText size={14} /> PDF Ringkas
                </button>
                <button
                    onClick={() => { setPrintMode('detail'); setTimeout(() => window.print(), 0); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app text-sm hover:bg-app"
                >
                    <Table size={14} /> PDF Detail
                </button>
                <button
                    onClick={() => setShowColumnPicker((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showColumnPicker ? 'bg-navy text-white border-navy' : 'border-app hover:bg-app text-navy'}`}
                >
                    <Settings2 size={14} /> Atur Kolom
                </button>
            </div>

            {/* Column Picker */}
            {showColumnPicker && (
                <div className="no-print bg-white rounded-2xl border border-app p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted">
                            Kolom Tampilan ({activeColumns.length}/{COLUMNS.length})
                        </span>
                        <button onClick={() => setActiveColumns(ALL_COLUMN_KEYS)} className="text-xs text-navy hover:underline">
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
                <div className="bg-white rounded-2xl border border-app px-4 py-2 text-sm">
                    <span className="text-navy font-semibold">{summary.total}</span>{' '}
                    <span className="text-muted">total kegiatan</span>
                </div>
                {Object.entries(summary.perStatus).map(([status, count]) => (
                    <div key={status} className="bg-white rounded-2xl border border-app px-4 py-2 text-sm">
                        <span className="font-semibold">{count}</span>{' '}
                        <span className="text-muted">{STATUS_KEGIATAN_LABEL[status as keyof typeof STATUS_KEGIATAN_LABEL] || status}</span>
                    </div>
                ))}
            </div>

            {/* Mobile: card per kegiatan -- field sesuai kolom yang aktif */}
            <div className="md:hidden print:hidden space-y-3">
                {data.length === 0 ? (
                    <p className="p-6 text-center text-muted text-sm">Tidak ada data.</p>
                ) : (
                    data.map((k) => {
                        // namaKegiatan + statusKegiatan sudah jadi header kartu (identitas record).
                        const cardColumns = COLUMNS.filter((c) => activeColumns.includes(c.key) && c.key !== 'namaKegiatan' && c.key !== 'statusKegiatan');
                        return (
                            <div key={k.id} className="bg-white border rounded-xl p-3.5 text-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-navy">{k.namaKegiatan}</p>
                                    {activeColumns.includes('statusKegiatan') && (
                                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${STATUS_KEGIATAN_CELL_CLASS[k.statusKegiatan]}`}>
                                            {STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}
                                        </span>
                                    )}
                                </div>
                                <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted">
                                    {cardColumns.map((col) => {
                                        const long = col.key === 'perihalSurat' || col.key === 'nomorSurat' || col.key === 'petugasProtokol' || col.key === 'petugasLiputan';
                                        return (
                                            <div key={col.key} className={long ? 'col-span-2' : ''}>
                                                <dt className="text-gray-400">{col.label}</dt>
                                                <dd>{col.render(k)}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>
                        );
                    })
                )}
            </div>
            
            {/* Table -- kolom mengikuti pilihan user (activeColumns) */}
            <div className={`bg-white rounded-2xl border border-app overflow-hidden transition-opacity print:hidden ${isPending ? 'opacity-50' : ''}`}>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-app text-left text-xs text-muted uppercase tracking-wide">
                        <tr>
                            {/* Urutan kolom selalu tetap (urutan COLUMNS = urutan worksheet), activeColumns hanya filter. */}
                            {COLUMNS.filter((c) => activeColumns.includes(c.key)).map((col) => (
                                <th key={col.key} className="px-4 p-3 font-medium">{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((k) => (
                            <tr key={k.id} className="border-t border-app hover:bg-slate-50">
                                {COLUMNS.filter((c) => activeColumns.includes(c.key)).map((col) => (
                                    <td key={col.key} className={`px-4 py-3 ${col.tdClass || ''}`}>
                                        {col.render(k)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan={activeColumns.length} className="px-4 py-10 text-center text-muted">Tidak ada data.</td></tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Print Table - tabel khusus untuk print dengan kolom ringkas/detail */}
            <div className="hidden print:block">
                <table className="w-full text-[9pt] border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            {printColumns.map((col) => (
                                <th key={col.key} className="border border-gray-400 px-1.5 py-1 text-left text-[8pt] font-semibold">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((k, idx) => (
                            <tr key={k.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {printColumns.map((col) => (
                                    <td key={col.key} className="border border-gray-300 px-1.5 py-0.5 align-top leading-tight">
                                        {col.key === 'statusKegiatan'
                                            ? STATUS_KEGIATAN_LABEL[k.statusKegiatan]
                                            : col.key === 'statusSambutan'
                                            ? (k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum')
                                            : col.key === 'jenisPenugasan'
                                            ? JENIS_PENUGASAN_LABEL[k.jenisPenugasan]
                                            : col.key === 'statusPublikasi'
                                            ? STATUS_PUBLIKASI_LABEL[k.statusPublikasi]
                                            : col.key === 'petugasProtokol'
                                            ? crewLabel(k.allCrewProtokol, k.petugasProtokolNama)
                                            : col.key === 'petugasLiputan'
                                            ? crewLabel(k.allCrewLiputan, k.petugasLiputanNama)
                                            : col.get(k) || '-'
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={printColumns.length} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                                    Tidak ada data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Print styles -- landscape + header repeat + no ellipsis + footer */}
                <style>
                    {`
                    @page {
                        size: A4 ${printMode === 'ringkas' ? 'landscape' : 'portrait'};
                        margin: 18mm 12mm 22mm 12mm;
                    }

                    /* Footer dengan nomor halaman - @page @bottom-center di luar @media print */
                    @page {
                        @bottom-center {
                            content: "SIAP-PRO - Sistem Informasi Agenda Prokompim | Halaman " counter(page) " dari " counter(pages);
                            font-size: 8pt;
                            color: #666;
                        }
                    }

                    @media print {
                        nav, header, button, .no-print { display: none !important; }
                        body { font-size: 10pt; }
                        .overflow-x-auto { overflow: visible !important; }

                        /* Hide screen table, show print table */
                        .print\\:block { display: block !important; }
                        table { page-break-after: auto; }
                        thead { display: table-header-group; }
                        tr { page-break-inside: avoid; }

                        /* Compact cells */
                        th, td {
                            display: table-cell !important;
                            overflow: visible !important;
                            text-overflow: unset !important;
                            white-space: normal !important;
                        }

                        /* Remove truncate */
                        .truncate {
                            overflow: visible !important;
                            text-overflow: unset !important;
                            white-space: normal !important;
                        }

                        /* Fallback footer untuk browser yang tidak support @page @bottom-center */
                        .print-footer {
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            text-align: center;
                            font-size: 8pt;
                            color: #666;
                            padding-bottom: 2mm;
                        }
                    }`}
                </style>

                {/* Footer untuk print */}
                <div className="hidden print:block print-footer">
                        SIAP-PRO - Sistem Informasi Agenda Pimpinan Prokompim | Halaman <span className="page-number"></span>
                </div>
            </div>
        </div>
    );
}