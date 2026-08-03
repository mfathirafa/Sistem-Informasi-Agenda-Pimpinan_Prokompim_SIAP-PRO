import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Entity, ActionLog, Prisma } from '@prisma/client';
import ActivityLogClient from './activity-log-client';

const PAGE_SIZE = 20;

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

        const where: Prisma.ActivityLogWhereInput = {};
        if (entity && (Object.keys(Entity) as string[]).includes(entity)) {
            where.entity = entity as Entity;
        }
        if (action && (Object.keys(ActionLog) as string[]).includes(action)) {
            where.action = action as ActionLog;
        }
        if (userId) where.userId = userId;
        if (search) where.changes = { string_contains: search };

        const [logs, total, users] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: { user: { select: { id: true, nama: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
            }),
            prisma.activityLog.count({ where }),
            prisma.user.findMany({ select: { id: true, nama: true }, orderBy: { nama: 'asc' } }),
        ]);

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
                filters={{ entity, action, userId, search }}
                users={users}
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