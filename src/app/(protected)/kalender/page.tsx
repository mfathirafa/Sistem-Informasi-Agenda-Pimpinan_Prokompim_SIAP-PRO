import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthGrid } from "@/lib/kalender";
import KalenderClient from './kalender-client';
import {
    STATUS_KEGIATAN_OPTIONS,
    STATUS_KEGIATAN_LABEL,
    STATUS_KEGIATAN_BADGE_CLASS,
    type StatusKegiatanValue,
} from '@/lib/constants/status-kegiatan';

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

// Warna dot unruk legend & mobile --- mengikuti tone badge yang sudah ada.
const DOT_COLOR: Record<StatusKegiatanValue, string> = {
    ACARA_MASUK: 'bg-slate-400',
    MENUNGGU_PENUGASAN: 'bg-amber-400',
    KEGIATAN_SELESAI: 'bg-emerald-400',
    SPJ_SELESAI: 'bg-navy',
};

// Parse ?bulan=YYYY-MM. Invalid/kosong -> bulan berjalan.
function parseBulan(value: string | undefined): { tahun: number; bulan: number } {
    const now = new Date();
    const m = value?.match(/^(\d{4})-(\d{2})$/);
    if (!m) return { tahun: now.getFullYear(), bulan: now.getMonth() };
    const tahun = Number(m[1]);
    const bulan = Number(m[2]) - 1;
    if (bulan < 0 || bulan > 11) return { tahun: now.getFullYear(), bulan: now.getMonth() };
    return { tahun, bulan };
}

export default async function KalenderPage({
    searchParams,
}: {
    searchParams: Promise<{ bulan?: string }>;
}) {
    try {
        const { bulan } = await searchParams;
        const { tahun, bulan: bulanIdx } = parseBulan(bulan);
        const periode = new Date(tahun, bulanIdx, 1);

        const fmtBulan = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const prev = new Date(tahun, bulanIdx - 1, 1);
        const next = new Date(tahun, bulanIdx + 1, 1);
        
        const start = new Date(tahun, bulanIdx, 1);
        const end = new Date(tahun, bulanIdx + 1, 0, 23, 59, 59, 999);

        const kegiatan = await prisma.kegiatan.findMany({
            where: { tanggal: { gte: start, lte: end } },
            orderBy: { tanggal: 'asc' },
            select: { 
                id: true, 
                namaKegiatan: true, 
                tanggal: true, 
                waktu: true, 
                statusKegiatan: true,
                tempat: true,
                pejabat: true,
                perihalSurat: true,
                nomorSurat: true,
                dresscode: true,
                picNama: true,
                picNoHp: true,
                jenisPenugasan: true,
                statusPublikasi: true,
                leadingSector: { select: { nama: true } },
                dokumen: { select: { jenis: true, status: true, link: true, catatan: true } }, 
            },
        });

        // Group per tanggal (komponen lokal, konsistensi dengan sel grid).
        const byTanggal = new Map<string, (typeof kegiatan)[number][]>();
        for (const k of kegiatan) {
            const key = `${k.tanggal.getFullYear()}-${k.tanggal.getMonth()}-${k.tanggal.getDate()}`;
            const arr = byTanggal.get(key) ?? [];
            arr.push(k);
            byTanggal.set(key, arr);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-semibold text-navy">Kalender Kegiatan</h1>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/kalender?bulan=${fmtBulan(prev)}`}
                            aria-label="Bulan sebelumnya"
                            className="btn-primary rounded-lg px-2.5 py-1.5 inline-flex items-center "
                        >
                            <ChevronLeft size={16} />
                        </Link>
                        <span className="text-base font-medium text-navy min-w-[150px] text-center">
                            {periode.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                        <Link
                            href={`/kalender?bulan=${fmtBulan(next)}`}
                            aria-label="Bulan berikutnya"
                            className="btn-primary rounded-lg px-2.5 py-1.5 inline-flex items-center"
                        >
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                <KalenderClient events={kegiatan}>
                <div className="bg-white rounded-2xl border border-app shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-app">
                        {NAMA_HARI.map((h) => (
                            <div key={h} className="px-2 py-2 text-center text-xs font-semibold text-muted">
                                {h}
                            </div>
                        ))}
                    </div>
                        
                    {getMonthGrid(tahun, bulanIdx).map((minggu, wi) => (
                        <div key={wi} className="grid grid-cols-7">
                            {minggu.map((tanggal, di) => {
                                if (!tanggal) {
                                    return (
                                        <div
                                            key={di}
                                            className="min-h-[72px] sm:min-h-[92px] border-b border-r border-app bg-slate-50/50"
                                        />
                                    );
                                }

                                const key = `${tanggal.getFullYear()}-${tanggal.getMonth()}-${tanggal.getDate()}`;
                                const list = byTanggal.get(key) ?? [];
                                const isToday = tanggal.getTime() === today.getTime();
                                const isWeekend = tanggal.getDay() === 0 || tanggal.getDay() === 6;
                                const nomorTanggal = (
                                    <span className={`inline-flex items-center justify-center ${
                                        isToday ? 'w-5 h-5 rounded-full bg-navy text-white' : ''
                                    }`}>
                                        {tanggal.getDate()}
                                    </span>
                                );

                                return (
                                    <div
                                        key={di}
                                        className={`min-h-[72px] sm:min-h-[92px] border-b border-r border-app p-1.5 ${
                                            isToday ? 'bg-amber-50' : isWeekend ? 'bg-slate-50/50' : ''
                                        }`}
                                    >
                                        <div className="text-xs mb-1 text-muted">
                                            <div className="flex items-center justify-between">
                                                {list.length > 0 ? (
                                                    <button
                                                        type="button"
                                                        data-open-tanggal={key}
                                                        aria-label={`Lihat agenda tanggal ${tanggal.getDate()}`}
                                                        className="hover:underline underline-offset-2"
                                                    >
                                                        {nomorTanggal}
                                                    </button>
                                                ) : (
                                                    <span>{nomorTanggal}</span>
                                                )}
                                            </div>
                                            <span className="sm:hidden flex items-center gap-1 mt-0.5">
                                                {list.slice(0, 3).map((k) => (
                                                    <span
                                                        key={k.id}
                                                        className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[k.statusKegiatan]}`}
                                                    />
                                                ))}
                                                {list.length > 3 && (
                                                    <button type="button"
                                                    data-open-tanggal={key}
                                                    aria-label={`Lihat ${list.length -3} kegiatan lagi`}
                                                    className="text-[10px] text-navy font-medium underline decoration-dotted underline-offset-2"
                                                    >
                                                        +{list.length -3}
                                                    </button>
                                                )}
                                            </span>
                                        </div>
                                        <div className="hidden sm:flex flex-col gap-1">
                                                {list.slice(0, 2).map((k) => (
                                                    <Link
                                                        key={k.id}
                                                        href={`/worksheet/${k.id}`}
                                                        title={`${k.namaKegiatan}${k.waktu ? ` - ${k.waktu}` : ''}`}
                                                        className={`truncate rounded px-1.5 py-0.5 text-[11px] leading-tight ${STATUS_KEGIATAN_BADGE_CLASS[k.statusKegiatan]}`}
                                                    >
                                                        {k.namaKegiatan}
                                                    </Link>
                                                ))}
                                                {list.length > 2 && (
                                                    <button
                                                        type="button"
                                                        data-open-tanggal={key}
                                                        className="text-[11px] text-navy underline decoration-dotted underline-offset-2 pl-1 hover:text-gold"
                                                    >
                                                        +{list.length - 2} lagi
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                </KalenderClient>

                <div className="flex flex-wrap gap-3 text-xs text-muted">
                    {STATUS_KEGIATAN_OPTIONS.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${DOT_COLOR[s]}`} />
                            {STATUS_KEGIATAN_LABEL[s]}
                        </span>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error('[KALENDER_PAGE_ERROR]', error);
        return (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
                <p className="font-medium">Gagal memuat kalender.</p>
                <p className="text-sm mt-1">Silahkan muat ulang halaman atau hubungi administrator.</p>
            </div>
        );
    }
}