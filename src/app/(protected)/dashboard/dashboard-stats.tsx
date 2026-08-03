'use client';

import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { STATUS_KEGIATAN_CHART_COLOR, STATUS_KEGIATAN_LABEL } from '@/lib/constants/status-kegiatan';

// Aliased ke Record<string, string> agar aman diindex key string dari recharts.
const STATUS_COLORS: Record<string, string> = STATUS_KEGIATAN_CHART_COLOR;
const STATUS_LABEL: Record<string, string> = STATUS_KEGIATAN_LABEL;

const KATEGORI_COLORS: Record<string, string> = {
    PROTOKOL: '#16294D',
    LIPUTAN: '#F59E0B',
};

type Props = {
    statusDist: { status: string; count: number }[];
    progressLengkap: number;
    progressBelum: number;
    topPetugas: { nama: string; count: number; kategori: string }[];
    topSektor: { nama: string; count: number }[];
};

export default function DashboardStats({ statusDist, progressLengkap, progressBelum, topPetugas, topSektor }: Props) {
    const totalProgress = progressLengkap + progressBelum;
    const progressPct = totalProgress > 0 ? Math.round((progressLengkap / totalProgress) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* --- Distribusi Status --- */}
            <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
                <h3 className="font-display text-base font-semibold text-navy mb-4">Distribusi Status Kegiatan</h3>
                {statusDist.length === 0 ? (
                    <p className="text-sm text-muted">Belum ada data.</p>
                ) : (
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDist}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={45}
                                    paddingAngle={3}
                                >
                                    {statusDist.map((entry) => (
                                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#ccc'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number, name: string) => [value, STATUS_LABEL[name] || name]} />
                                <Legend formatter={(value: string) => STATUS_LABEL[value] || value} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* --- Progress Dokumen --- */}
            <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
                <h3 className="font-display text-base font-semibold text-navy mb-4">Progress Dokumen SPJ</h3>
                {totalProgress === 0 ? (
                    <p className="text-sm text-muted">Belum ada data.</p>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Kegiatan dengan dokumen lengkap</span>
                            <span className="font-semibold">{progressLengkap} / {totalProgress} ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div 
                                className="bg-green-500 h-3 rounded-full transition-all"
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

            {/* --- Top 5 Petugas --- */}
            <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
                <h3 className="font-display text-base font-semibold text-navy mb-4">Petugas Paling Aktif</h3>
                {topPetugas.length === 0 ? (
                    <p className="text-sm text-muted">Belum ada data.</p>
                ) : (
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topPetugas} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="nama"
                                    width={110}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false} 
                                />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} minPointSize={4}>
                                    {topPetugas.map((entry, i) => (
                                        <Cell key={i} fill={KATEGORI_COLORS[entry.kategori] || '#9CA3AF'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* --- Top 5 Leading Sector --- */}
            <div className="bg-white rounded-2xl border border-app p-5 shadow-sm">
                <h3 className="font-display text-base font-semibold text-navy mb-4">Leading Sector Terbanyak</h3>
                {topSektor.length === 0 ? (
                    <p className="text-sm text-muted">Belum ada data.</p>
                ) : (
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topSektor} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis 
                                    type="category"
                                    dataKey="nama"
                                    width={130}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip />
                                <Bar dataKey="count" fill="#16294D" radius={[0, 6, 6, 0]} minPointSize={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}