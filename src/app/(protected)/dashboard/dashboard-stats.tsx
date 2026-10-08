'use client';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

type Props = {
    statusCounts: Record<string, number>;
    totalTahunIni: number;
    tahun: number;
    topSektor: { nama: string; count: number }[];
};

export default function DashboardStats({ statusCounts, totalTahunIni, tahun, topSektor }: Props) {
    const selesai = (statusCounts.KEGIATAN_SELESAI || 0) + (statusCounts.SPJ_SELESAI || 0);
    const selesaiPct = totalTahunIni > 0 ? Math.round((selesai / totalTahunIni) * 100) : 0;

    return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* --- Status Pelaksanaan Kegiatan --- */}
 <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
 <div className="flex items-center justify-between mb-4">
   <h3 className="font-display text-base font-semibold text-navy">Status Pelaksanaan Kegiatan</h3>
   <span className="text-xs text-muted font-medium">Tahun {tahun}</span>
 </div>
 {totalTahunIni === 0 ? (
 <p className="text-sm text-muted">Belum ada data kegiatan tahun ini.</p>
 ) : (
 <div className="space-y-4">
   <div>
     <div className="flex justify-between text-sm mb-1.5">
       <span className="text-muted">Kegiatan Terlaksana</span>
       <span className="font-semibold text-navy">{selesai} / {totalTahunIni} ({selesaiPct}%)</span>
     </div>
     <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
       <div
         className="bg-navy h-2.5 rounded-full transition-all duration-500"
         style={{ width: `${selesaiPct}%` }}
       />
     </div>
   </div>

   <div className="grid grid-cols-2 gap-2.5 pt-1">
     <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
       <div className="text-xs text-slate-500 font-medium">Acara Masuk</div>
       <div className="text-lg font-semibold text-slate-700 mt-0.5">{statusCounts.ACARA_MASUK || 0}</div>
     </div>
     <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
       <div className="text-xs text-amber-700 font-medium">Menunggu Penugasan</div>
       <div className="text-lg font-semibold text-amber-800 mt-0.5">{statusCounts.MENUNGGU_PENUGASAN || 0}</div>
     </div>
     <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
       <div className="text-xs text-emerald-700 font-medium">Kegiatan Selesai</div>
       <div className="text-lg font-semibold text-emerald-800 mt-0.5">{statusCounts.KEGIATAN_SELESAI || 0}</div>
     </div>
     <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
       <div className="text-xs text-blue-700 font-medium">SPJ Selesai</div>
       <div className="text-lg font-semibold text-blue-800 mt-0.5">{statusCounts.SPJ_SELESAI || 0}</div>
     </div>
   </div>
 </div>
 )}
 </div>

 {/* --- Top5 Leading Sector --- */}
 <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
 <h3 className="font-display text-base font-semibold text-navy mb-4">Leading Sector Terbanyak</h3>
 {topSektor.length ===0 ? (
 <p className="text-sm text-muted">Belum ada data.</p>
 ) : (
 <div style={{ height: 240 }}>
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topSektor} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis 
                type="category"
                dataKey="nama"
                width={160}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(val: string) => {
                    if (!val) return '';
                    const match = val.match(/\(([^)]+)\)$/);
                    if (match && val.length > 24) return match[1]; // Tampilkan singkatan jika nama terlalu panjang
                    return val.length > 22 ? `${val.slice(0, 20)}...` : val;
                }} 
                axisLine={false}
                tickLine={false}
            />
            <Tooltip
                cursor={{ fill: '#F3F1EC' }}
                formatter={(value) => [`${value ?? 0} kegiatan`, 'Jumlah']}
                labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="count" fill="#16294D" radius={[0, 6, 6, 0]} barSize={18} minPointSize={4} />
        </BarChart>
    </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>
 );
}