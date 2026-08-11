import Link from 'next/link';
import { CalendarDays, CheckCircle2, FileWarning } from 'lucide-react';
import type { ReactNode } from 'react';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import DashboardCharts from './dashboard-charts';
import DashboardStats from './dashboard-stats';
import { hitungProgressDokumen } from '@/lib/constants/status-dokumen';

  export default async function DashboardPage() {
    try {
      const user = await getCurrentUser();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

      const rangeConfig = {
        startOffset: -3,
        monthCount: 6,
      };
      const rangeStartDate = new Date(today.getFullYear(), today.getMonth() + rangeConfig.startOffset, 1);
      const currentYearStart = new Date(today.getFullYear(), 0, 1);

      // Hero: pakai foto gedung KPT hanya jika file sudah ada di public/
      const showHeroFoto = existsSync(path.join(process.cwd(), 'public', 'gedung-kpt.jpg'));

      const [
        bulanIniCount,
        hariIniCount,
        sudahCount,
        belumCount,
        dokumenBelumUploadCount,
        upcoming,
        chartDataRaw,
        topSektorRaw,
        kegiatanWithDokumen,
      ] = await Promise.all([
        prisma.kegiatan.count({ where: { tanggal: { gte: startOfMonth, lte: endOfMonth } } }),
        prisma.kegiatan.count({ where: { tanggal: { gte: today, lt: tomorrow } } }),
        prisma.kegiatan.count({ where: { statusSambutan: 'SUDAH' } }),
        prisma.kegiatan.count({ where: { statusSambutan: 'BELUM' } }),
        prisma.kegiatan.count({ where: { OR: [{ linkUpload: null }, { linkUpload: '' }] } }),
        prisma.kegiatan.findMany({
          where: { tanggal: { gte: today } },
          orderBy: { tanggal: 'asc' },
          take: 5,
        }),
        prisma.kegiatan.findMany({
          where: { tanggal: { gte: rangeStartDate } },
          select: { tanggal: true }
        }),
        prisma.kegiatan.groupBy({
          by: ['leadingSectorId'],
          _count: true,
          orderBy: { _count: { leadingSectorId: 'desc' } },
          take: 5,
        }),
                prisma.kegiatan.findMany({
          where: { tanggal: { gte: currentYearStart } },
          select: { id: true, namaKegiatan: true, dokumen: { select: { status: true } } },
        }),
      ]);

      const chartMap: Record<string, { bulan: string; jumlah: number }> = {};
      for (let i = 0; i < rangeConfig.monthCount; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + rangeConfig.startOffset + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        chartMap[key] = { bulan: label, jumlah:0 };
      }

      chartDataRaw.forEach((k) => {
        const d = new Date(k.tanggal);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (chartMap[key]) chartMap[key].jumlah += 1;
      });
      const chartData = Object.values(chartMap);

      // --- Progress dokumen per kegiatan (tahun berjalan) ---
      let progressLengkap = 0;
      let progressBelum = 0;
      const perluPerhatianList: string[] = [];
      kegiatanWithDokumen.forEach((k) => {
        const pct = hitungProgressDokumen(k.dokumen);
        if (pct === 100) {
          progressLengkap++;
        } else {
          progressBelum++;
          perluPerhatianList.push(k.namaKegiatan);
        }
      });

      // --- Top 5 leading sector
      const topSektorIds = topSektorRaw.map((t) => t.leadingSectorId);
      const sektorNama = topSektorIds.length > 0
        ? await prisma.leadingSector.findMany({
            where: { id: { in: topSektorIds } },
            select: { id: true, nama: true },
        })
        : [];
        const topSektorData = topSektorRaw.map((t) => {
          const s = sektorNama.find((x) => x.id === t.leadingSectorId);
          return { nama: s?.nama || '(dihapus)', count: t._count};
        });

        type Stat = {
          label: string;
          value: number;
          icon: ReactNode;
          tone: 'default' | 'success' | 'warning';
          sub?: ReactNode;
        };

      const stats: Stat[] = [
        { label: 'Kegiatan bulan ini', value: bulanIniCount, icon: <CalendarDays size={18} />, tone: 'default' as const
  },
        { label: 'Kegiatan hari ini', value: hariIniCount, icon: <CalendarDays size={18} />, tone: 'default' as const },
        { 
          label: 'Total Sambutan', 
          value: sudahCount + belumCount, 
          icon: <CheckCircle2 size={18} />, 
          tone: 'success', 
          sub: ( 
            <div className='flex gap-4 mt-1 text-xs'>
              <span>
                <span className='text-green-600 font-semibold'>{sudahCount}</span> sudah </span>
              <span>
                <span className='text-amber-600 font-semibold'>{belumCount}</span> belum </span>
            </div>
           ), },
        { label: 'Dokumen belum upload', value: dokumenBelumUploadCount, icon: <FileWarning size={18} />, tone: 'warning'},
      ];

      const toneClass = { default: 'bg-app text-navy', success: 'badge-sudah', warning: 'badge-belum' };

      return (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className='relative overflow-hidden rounded-2xl bg-navy text-white shadow-sm'>
            {showHeroFoto && (
              <div className='absolute inset-0 opacity-40'
              style={{
                backgroundImage: "url('/gedung-kpt.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}></div>
            )}
            <div className='absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30' />
            <div className='relative p-5 sm:p-8'>
              <p className='text-gold text-xs font-semibold uppercase tracking-wider'>Sistem Manajemen SPJ · Protokom</p>
              <h1 className='font-display text-2xl sm:text-3xl font-semibold mt-1'>
                Selamat datang, {user?.nama ?? 'Pengguna'}
              </h1>
              <p className='text-white/80 text-sm mt-2'>
              Pantau agenda kegiatan, status sambutan, dan kelengkapan dokumen SPJ.
              </p>
            </div>
          </div>

          {/* --- Status cards --- */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {stats.map((s) => (
              <div key={s.label} className='bg-white rounded-2xl border border-app p-5 flex items-center justify-between shadow-sm'>
                <div>
                  <p className='text-muted text-xs mb-1'>{s.label}</p>
                  <p className='font-display text-3xl font-semibold text-navy'>{s.value}</p>
                  {s.sub && <div>{s.sub}</div>}
                </div>
                <div className={`rounded-full p-2.5 ${toneClass[s.tone]}`}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* --- Row: grafik bulanan + kegiatan terdekat --- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 bg-white rounded-2xl border border-app p-5 shadow-sm">
              <h3 className="font-display text-base font-semibold text-navy mb-4">Jumlah Kegiatan per Bulan</h3>
              <DashboardCharts data={chartData} />
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-app p-5 shadow-sm">
              <h3 className="font-display text-base font-semibold text-navy mb-4">Kegiatan Terdekat</h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted">Belum ada kegiatan mendatang.</p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((k) => (
                    <li key={k.id}>
                      <Link
                        href="/worksheet"
                        className="flex items-start gap-3 text-sm rounded-lg p-1.5 -m-1.5 hover:bg-app transition-colors"
                      >
                        <div className="font-mono text-xs bg-app rounded-md px-2 py-1 text-navy flex-shrink-0 mt-0.5">
                          {new Date(k.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{k.namaKegiatan}</p>
                          <p className="text-muted text-xs truncate">{k.tempat}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* --- Row 3: Charts baru (distribusi + progress + top petugas + top sektor) --- */}
          <DashboardStats 
            progressLengkap={progressLengkap}
            progressBelum={progressBelum}
            topSektor={topSektorData}
          />

          {/* --- Row 4: Perlu Perhatian --- */}
          {(progressBelum > 0) && (
            <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
              <h3 className="font-display text-base font-semibold text-navy mb-3">Perlu Perhatian</h3>
              <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                    <span><strong>{progressBelum}</strong> kegiatan dengan dokumen belum lengkap</span>
                  </li>
                {perluPerhatianList.length > 0 && (
                  <li className="text-muted text-xs mt-1">
                    {perluPerhatianList.slice(0, 3).join(', ')}
                    {perluPerhatianList.length > 3 && `, +${perluPerhatianList.length - 3} lagi`}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('[DASHBOARD_PAGE_ERROR]', error);
      return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
          <p className="font-medium">Gagal memuat dashboard.</p>
          <p className="text-sm mt-1">Silakan muat ulang halaman atau hubungi administrator.</p>
        </div>
      );
    }
  }