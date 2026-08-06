'use client';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

type Props = {
    progressLengkap: number;
    progressBelum: number;
    topSektor: { nama: string; count: number}[];
};

export default function DashboardStats({ progressLengkap, progressBelum, topSektor }: Props) {
    const totalProgress = progressLengkap + progressBelum;
    const progressPct = totalProgress > 0 ? Math.round((progressLengkap / totalProgress) * 100) : 0;

    return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* --- Progress Dokumen --- */}
 <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
 <h3 className="font-display text-base font-semibold text-navy mb-4">Progress Dokumen SPJ</h3>
 {totalProgress ===0 ? (
 <p className="text-sm text-muted">Belum ada data.</p>
 ) : (
 <div className="space-y-3">
 <div className="flex justify-between text-sm">
 <span className="text-muted">Kegiatan dengan dokumen lengkap</span>
 <span className="font-semibold">{progressLengkap} / {totalProgress} ({progressPct}%)</span>
 </div>
 <div className="w-full bg-gray-100 rounded-full h-3">
 <div className="bg-green-500 h-3 rounded-full transition-all"
 style={{ width: `${progressPct}%` }}
 />
 </div>
 <div className="flex justify-between text-xs text-muted">
 <span>{progressBelum} kegiatan belum lengkap</span>
 {progressLengkap === totalProgress && <span className="text-green-600 font-medium">Semua Lengkap ✓</span>}
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
 <div style={{ height:200 }}>
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={topSektor} layout="vertical" margin={{ top:4, right:8, left:0, bottom:0 }}>
 <XAxis type="number" tick={{ fontSize:12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
 <YAxis type="category"
 dataKey="nama"
 width={130}
 tick={{ fontSize:12, fill: '#6B7280' }}
 axisLine={false}
 tickLine={false}
 />
 <Tooltip />
 <Bar dataKey="count" fill="#16294D" radius={[0,6,6,0]} minPointSize={4} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>
 );
}