import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import DashboardCharts from './dashboard-charts';

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

export default async function DashboardPage() {
  const kegiatan = await prisma.kegiatan.findMany();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bulanIni = kegiatan.filter((k) => {
    const d = new Date(k.tanggal);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const sudah = kegiatan.filter((k) => k.statusSambutan === 'SUDAH').length;
  const belum = kegiatan.filter((k) => k.statusSambutan === 'BELUM').length;
  const upcoming = kegiatan
    .filter((k) => new Date(k.tanggal) >= today)
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    .slice(0, 5);

  const chartMap: Record<string, { bulan: string; jumlah: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    chartMap[key] = { bulan: d.toLocaleDateString('id-ID', { month: 'short' }), jumlah: 0 };
  }
  kegiatan.forEach((k) => {
    const d = new Date(k.tanggal);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    if (chartMap[key]) chartMap[key].jumlah += 1;
  });
  const chartData = Object.values(chartMap);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-app p-5 flex items-center justify-between">
          <div>
            <p className="text-muted text-xs mb-1">Kegiatan bulan ini</p>
            <p className="font-display text-3xl font-semibold text-navy">{bulanIni.length}</p>
          </div>
          <div className="rounded-full p-2.5 bg-app text-navy">
            <CalendarDays size={18} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-app p-5 flex items-center justify-between">
          <div>
            <p className="text-muted text-xs mb-1">Sudah sambutan</p>
            <p className="font-display text-3xl font-semibold text-navy">{sudah}</p>
          </div>
          <div className="rounded-full p-2.5 badge-sudah">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-app p-5 flex items-center justify-between">
          <div>
            <p className="text-muted text-xs mb-1">Belum sambutan</p>
            <p className="font-display text-3xl font-semibold text-navy">{belum}</p>
          </div>
          <div className="rounded-full p-2.5 badge-belum">
            <Clock size={18} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-app p-5">
          <h3 className="font-display text-base font-semibold text-navy mb-4">Jumlah Kegiatan per Bulan</h3>
          <DashboardCharts data={chartData} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-app p-5">
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
