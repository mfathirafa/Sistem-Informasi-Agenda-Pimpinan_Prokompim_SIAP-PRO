'use client';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

type Props = {
    progressLengkap: number;
    progressBelum: number;
    topSektor: { nama: string; count: number}[];
    perluPerhatian: string[];
};

export default function DashboardStats({ progressLengkap, progressBelum, topSektor, perluPerhatian }: Props) {
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
 {perluPerhatian.length > 0 && (
 <p className="text-xs text-muted">
 {perluPerhatian.slice(0, 3).join(', ')}
 {perluPerhatian.length > 3 && `, +${perluPerhatian.length - 3} lagi`}
 </p>
 )}
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
                formatter={(value: any) => [`${value} kegiatan`, 'Jumlah']}
                labelFormatter={(label: any) => `${label}`}
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