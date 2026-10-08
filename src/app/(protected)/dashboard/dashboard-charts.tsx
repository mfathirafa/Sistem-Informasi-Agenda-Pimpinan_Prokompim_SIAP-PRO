'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardCharts({
  data,
}: {
  data: { bulan: string; fullBulan?: string; jumlah: number }[];
}) {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 10, left: -4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" vertical={false} />
          <XAxis
            dataKey="bulan"
            interval={0}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            width={28}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: '#F3F1EC' }}
            formatter={(value) => [`${value ?? 0} kegiatan`, 'Jumlah']}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload;
              return item?.fullBulan || label;
            }}
          />
          <Bar dataKey="jumlah" fill="#16294D" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
