import { prisma } from "./prisma";
import type { Entity, ActionLog } from '@prisma/client';

type LogInput = {
    entity: Entity;
    entityId: string;
    action: ActionLog;
    userId: string;
    changes?: Record<string, unknown>;
};

export async function logActivity({ entity, entityId, action, userId, changes }: LogInput) {
    await prisma.activityLog.create({
        data: { entity, entityId, action, userId, changes: changes ?? undefined },
    });
}

export function getEntityName(entity: Entity, changes: Record<string, unknown> | null | undefined): string {
    if (!changes) return '-';
    const data = (changes.after ?? changes.before ?? {}) as Record<string, unknown>;
    return String(data.namaKegiatan ?? data.nama ?? data.username ?? '-');
}