import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Entity, ActionLog, Prisma } from '@prisma/client';
import ActivityLogClient from './activity-log-client';

const PAGE_SIZE = 20;

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = 'force-dynamic';

export default async function ActivityLogPage({ searchParams }: Props) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) redirect('/dashboard');

        const params = await searchParams;
        const rawPage = Number(params.page);
        const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
        const entity = typeof params.entity === 'string' ? params.entity : undefined;
        const action = typeof params.action === 'string' ? params.action : undefined;
        const userId = typeof params.userId === 'string' ? params.userId : undefined;
        const search = typeof params.search === 'string' ? params.search : undefined;
        const date = typeof params.date === 'string' ? params.date : undefined;
        const bulan = typeof params.bulan === 'string' ? params.bulan : undefined;
        const tahun = typeof params.tahun === 'string' ? params.tahun : undefined;

        const where: Prisma.ActivityLogWhereInput = {};
        if (entity && (Object.keys(Entity) as string[]).includes(entity)) {
            where.entity = entity as Entity;
        }
        if (action && (Object.keys(ActionLog) as string[]).includes(action)) {
            where.action = action as ActionLog;
        }
        if (userId) where.userId = userId;
        if (search) where.changes = { string_contains: search };

        // Filter per tanggal / bulan / tahun (WIB / UTC+7)
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const start = new Date(`${date}T00:00:00.000+07:00`);
            const end = new Date(`${date}T23:59:59.999+07:00`);
            where.createdAt = { gte: start, lte: end };
        } else if (bulan || tahun) {
            const y = tahun ? Number(tahun) : new Date().getFullYear();
            if (bulan && Number(bulan) >= 1 && Number(bulan) <= 12) {
                const m = Number(bulan);
                const monthStr = String(m).padStart(2, '0');
                const lastDay = new Date(y, m, 0).getDate();
                const start = new Date(`${y}-${monthStr}-01T00:00:00.000+07:00`);
                const end = new Date(`${y}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`);
                where.createdAt = { gte: start, lte: end };
            } else if (tahun) {
                const start = new Date(`${y}-01-01T00:00:00.000+07:00`);
                const end = new Date(`${y}-12-31T23:59:59.999+07:00`);
                where.createdAt = { gte: start, lte: end };
            }
        }

        const [logs, total, users, leadingSectors, minLog] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: { user: { select: { id: true, nama: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
            }),
            prisma.activityLog.count({ where }),
            prisma.user.findMany({ select: { id: true, nama: true }, orderBy: { nama: 'asc' } }),
            prisma.leadingSector.findMany({ select: { id: true, nama: true }, orderBy: { nama: 'asc' } }),
            prisma.activityLog.aggregate({ _min: { createdAt: true } }),
        ]);

        const currentYear = new Date().getFullYear();
        const minYear = minLog._min.createdAt ? minLog._min.createdAt.getFullYear() : currentYear;
        const tahunSet = new Set<number>([currentYear]);
        for (let y = minYear; y <= currentYear; y++) tahunSet.add(y);
        const tahunOptions = Array.from(tahunSet).sort((a, b) => b - a);

        return (
            <ActivityLogClient
                logs={logs.map((l) => ({
                    ...l,
                    changes: l.changes as Record<string, unknown> | null,
                    createdAt: l.createdAt.toISOString(),
                }))}
                total={total}
                page={page}
                pageSize={PAGE_SIZE}
                filters={{ entity, action, userId, search, date, bulan, tahun }}
                users={users}
                leadingSectors={leadingSectors}
                tahunOptions={tahunOptions}
            />
        );
    } catch (error) {
        console.error('[ACTIVITY_LOG_PAGE_ERROR]', error);
        return (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
                <p className="font-medium">Gagal memuat activity log.</p>
                <p className="text-sm mt-1">Silahkan muat ulang halaman atau hubungi administrator.</p>
            </div>
        );
    }
}