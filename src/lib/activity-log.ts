import { prisma } from "./prisma";
import type { Entity, ActionLog, Prisma } from '@prisma/client';

type LogInput = {
    entity: Entity;
    entityId: string;
    action: ActionLog;
    userId: string;
    changes?: Record<string, unknown>;
};

/** Recursively convert any value to JSON-compatible for Prisma Json.
 *  Internal helper — returns InputJsonValue | null because InputJsonObject
 *  values and InputJsonArray elements both accept null.
 *
 *  - null / undefined → null
 *  - string → as-is
 *  - number → only if Number.isFinite, otherwise throw
 *  - boolean → as-is
 *  - Date → ISO string via toISOString()
 *  - Array → each element mapped recursively (undefined → null)
 *  - Plain object (prototype === Object.prototype or null) → own enumerable
 *    properties recursively; keys with undefined values are omitted
 *  - Non-plain objects (class instances, Map, Set, etc.) → throw TypeError
 *  - Function, symbol, bigint, NaN, Infinity → throw TypeError
 */
function toJsonValue(value: unknown): Prisma.InputJsonValue | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            throw new TypeError(`Unsupported numeric value in activity log snapshot: ${value}`);
        return value;
    }
    if (typeof value === 'boolean') return value;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value))
        return value.map((item) => (item === undefined ? null : toJsonValue(item)));

    if (typeof value === 'object') {
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) {
            const name = (proto.constructor as { name?: string } | null)?.name ?? 'unknown';
            throw new TypeError(`Unsupported object type in activity log snapshot: ${name}`);
        }
        const result: Record<string, Prisma.InputJsonValue | null> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (v !== undefined) result[k] = toJsonValue(v);
        }
        return result;
    }

    throw new TypeError(`Unsupported type in activity log snapshot: ${typeof value}`);
}

/** Normalize root snapshot (always { before?, after?, meta? }) to Prisma Json Object.
 *  Root is always non-null — InputJsonObject is a member of InputJsonValue.
 */
function normalizeSnapshot(value: Record<string, unknown>): Prisma.InputJsonObject {
    const result: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [k, v] of Object.entries(value)) {
        if (v !== undefined) result[k] = toJsonValue(v);
    }
    return result;
}

export async function logActivity(input: LogInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    await client.activityLog.create({
        data: {
            entity: input.entity,
            entityId: input.entityId,
            action: input.action,
            userId: input.userId,
            changes: input.changes ? normalizeSnapshot(input.changes) : undefined,
        },
    });
}

export function getEntityName(changes: Record<string, unknown> | null | undefined): string {
    if (!changes) return '-';
    // Prefer meta.entityName (format introduced after normalization refactor)
    const meta = changes.meta as Record<string, unknown> | undefined;
    if (meta?.entityName && typeof meta.entityName === 'string') {
        return meta.entityName;
    }
    // Fallback for existing logs stored before meta was added
    const data = (changes.after ?? changes.before ?? {}) as Record<string, unknown>;
    return String(data.namaKegiatan ?? data.nama ?? data.username ?? '-');
}

export async function getActivityLogByEntity(entityId: string) {
    const logs = await prisma.activityLog.findMany({
        where: { entityId },
        include: {
            user: { select: { nama: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return logs.map((log) => ({
        id: log.id,
        action: log.action,
        userName: log.user.nama,
        changes: log.changes as Record<string, unknown> | null,
        createdAt: log.createdAt,
    }));
}