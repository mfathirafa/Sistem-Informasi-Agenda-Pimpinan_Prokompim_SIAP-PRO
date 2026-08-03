'use client';

import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { Download, Printer } from "lucide-react";
import * as XLSX from 'xlsx';
import { STATUS_KEGIATAN_LABEL } from "@/lib/constants/status-kegiatan";
import { JENIS_PENUGASAN_LABEL, type JenisPenugasanValue } from "@/lib/constants/status-penugasan";
import { STATUS_PUBLIKASI_LABEL, STATUS_PUBLIKASI_BADGE_CLASS, type StatusPublikasiValue } from "@/lib/constants/status-publikasi";
import type { StatusKegiatan } from "@prisma/client";

type KegiatanItem = {
    id: string;
    namaKegiatan: string;
    tanggal: string;
    waktu: string | null;
    tempat: string;
    pejabat: string;
    leadingSectorNama: string;
    statusSambutan: string;
    statusKegiatan: StatusKegiatan;
    petugasProtokolNama: string[];
    petugasLiputanNama: string[];
    jenisPenugasan: JenisPenugasanValue;
    statusPublikasi: StatusPublikasiValue;
};

type Props = {
    data: KegiatanItem[];
    startDate: string;
    endDate: string;
};

function pad(n: number) { return n < 10 ? '0' + n : '' + n; }

function formatTanggal(iso: string) {
    const d = new Date(iso);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function LaporanClient({ data, startDate, endDate }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [localStart, setLocalStart] = useState(startDate);
    const [localEnd, setLocalEnd] = useState(endDate);

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
        const header = [
            'Tanggal', 'Nama Kegiatan', 'Waktu', 'Tempat', 'Pejabat',
            'Leading Sector', 'Status Sambutan', 'Status Kegiatan',
            'Petugas Protokol', 'Petugas Liputan', 'Jenis Penugasan', 'Status Publikasi',
        ];
        const rows = data.map((k) => [
            formatTanggal(k.tanggal),
            k.namaKegiatan,
            k.waktu || '',
            k.tempat,
            k.pejabat,
            k.leadingSectorNama,
            k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum',
            STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan,
            k.petugasProtokolNama.join(', '),
            k.petugasLiputanNama.join(', '),
            JENIS_PENUGASAN_LABEL[k.jenisPenugasan],
            STATUS_PUBLIKASI_LABEL[k.statusPublikasi],
        ]);

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
            <h1 className="text-2xl font-bold">Laporan SPJ</h1>

            {/* Filter */}
            <div className="flex flex-wrap gap-3 items-end">
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
                    <Printer size={14} /> Cetak
                </button>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-3">
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

            {/* Table */}
            <div className={`overflow-x-auto border rounded-lg transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-2.5 font-medium text-gray-600">Tanggal</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Kegiatan</th>
                            <th className="text-left p-2.5 font-medium text-gray-600 hidden sm:table-cell">Waktu</th>
                            <th className="text-left p-2.5 font-medium text-gray-600 hidden md:table-cell">Tempat</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Pejabat</th>
                            <th className="text-left p-2.5 font-medium text-gray-600 hidden lg:table-cell">Sector</th>
                            <th className="text-left p-2.5 font-medium text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((k) => (
                            <tr key={k.id} className="border-b hover:bg-gray-50">
                                <td className="p-2.5 whitespace-nowrap">{formatTanggal(k.tanggal)}</td>
                                <td className="p-2.5 font-medium">{k.namaKegiatan}</td>
                                <td className="p-2.5 text-gray-500 hidden sm:table-cell">{k.waktu || '-'}</td>
                                <td className="p-2.5 text-gray-500 hidden md:table-cell max-w-[200px] truncate">{k.tempat}</td>
                                <td className="p-2.5">{k.pejabat}</td>
                                <td className="p-2.5 text-gray-500 hidden lg:table-cell">{k.leadingSectorNama}</td>
                                <td className="p-2.5">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusCellClass(k.statusKegiatan)}`}> 
                                        {STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan={7} className="p-6 text-center text-gray-400">Tidak ada data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Print styles */}
            <style jsx>{`
                @media print {
                    nav, header, button, .no-print { display: none !important; }
                    body { font-size: 10pt; }
                    table { page-break-after: auto; }
                    tr { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}

function statusCellClass(status: StatusKegiatan): string {
    const map: Record<StatusKegiatan, string> = {
        ACARA_MASUK: 'bg-purple-100 text-purple-800',
        MENUNGGU_PENUGASAN: 'bg-yellow-100 text-yellow-800',
        KEGIATAN_SELESAI: 'bg-green-100 text-green-800',
        SPJ_SELESAI: 'bg-blue-100 text-blue-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
}