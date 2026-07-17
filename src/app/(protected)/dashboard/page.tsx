import { CalendarDays, CheckCircle2, Clock, FileWarning, UserX } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import DashboardCharts from './dashboard-charts';

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

export default async function DashboardPage() {
  // 1. Setup Variabel Waktu
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  // 2. Tarik Data Paralel dari Database (Jauh lebih hemat memori)
  const [
    bulanIniCount,
    hariIniCount,
    sudahCount,
    belumCount,
    dokumenBelumUploadCount,
    belumAdaPetugasCount,
    upcoming,
    chartDataRaw
  ] = await Promise.all([
    prisma.kegiatan.count({ where: { tanggal: { gte: startOfMonth, lte: endOfMonth } } }),
    prisma.kegiatan.count({ where: { tanggal: { gte: today, lt: tomorrow } } }),
    prisma.kegiatan.count({ where: { statusSambutan: 'SUDAH' } }),
    prisma.kegiatan.count({ where: { statusSambutan: 'BELUM' } }),
    prisma.kegiatan.count({ where: { OR: [{ linkUpload: null }, { linkUpload: '' }] } }),
    prisma.kegiatan.count({ where: { OR: [{ petugasProtokolId: null }, { petugasLiputanId: null }] } }),
    prisma.kegiatan.findMany({
      where: { tanggal: { gte: today } },
      orderBy: { tanggal: 'asc' },
      take: 5, // Ambil 5 terdekat saja
    }),
    prisma.kegiatan.findMany({
      where: { tanggal: { gte: sixMonthsAgo } },
      select: { tanggal: true } // Hanya tarik kolom tanggal untuk chart
    })
  ]);

  // 3. Olah Data untuk Chart
  const chartMap: Record<string, { bulan: string; jumlah: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    chartMap[key] = { bulan: d.toLocaleDateString('id-ID', { month: 'short' }), jumlah: 0 };
  }
  
  chartDataRaw.forEach((k) => {
    const d = new Date(k.tanggal);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    if (chartMap[key]) chartMap[key].jumlah += 1;
  });
  const chartData = Object.values(chartMap);

  // 4. Mapping Data UI
  const stats = [
    { label: 'Kegiatan bulan ini', value: bulanIniCount, icon: <CalendarDays size={18} />, tone: 'default' as const },
    { label: 'Kegiatan hari ini', value: hariIniCount, icon: <CalendarDays size={18} />, tone: 'default' as const },
    { label: 'Sudah sambutan', value: sudahCount, icon: <CheckCircle2 size={18} />, tone: 'success' as const },
    { label: 'Belum sambutan', value: belumCount, icon: <Clock size={18} />, tone: 'warning' as const },
    { label: 'Dokumen belum upload', value: dokumenBelumUploadCount, icon: <FileWarning size={18} />, tone: 'warning' as const },
    { label: 'Belum ada petugas', value: belumAdaPetugasCount, icon: <UserX size={18} />, tone: 'warning' as const },
  ];
  
  const toneClass = { default: 'bg-app text-navy', success: 'badge-sudah', warning: 'badge-belum' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-app p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-muted text-xs mb-1">{s.label}</p>
              <p className="font-display text-3xl font-semibold text-navy">{s.value}</p>
            </div>
            <div className={`rounded-full p-2.5 ${toneClass[s.tone]}`}>{s.icon}</div>
          </div>
        ))}
      </div>
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
                <li key={k.id} className="flex items-start gap-3 text-sm">
                  <div className="font-mono text-xs bg-app rounded-md px-2 py-1 text-navy flex-shrink-0 mt-0.5">
                    {new Date(k.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{k.namaKegiatan}</p>
                    <p className="text-muted text-xs truncate">{k.tempat}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}