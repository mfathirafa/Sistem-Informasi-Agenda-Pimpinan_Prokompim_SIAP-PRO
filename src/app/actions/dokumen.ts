'use server';

import { revalidatePath } from "next/cache";
import { StatusDokumen } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canEditRole, type ActionResult } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

type DokumenUpdateInput = {
    id: string;
    status: StatusDokumen;
    link?: string | null;
    catatan?: string | null;
};

export async function updateDokumen(input: DokumenUpdateInput): Promise<ActionResult> {
    const user = await getCurrentUser();
    if (!canEditRole(user?.role)) {
        return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
    }

    // Validasi status enum
    if (!Object.values(StatusDokumen).includes(input.status)) {
        return { ok: false, error: 'Status dokumen tidak valid.' };
    }

    // Validasi link URL jika diisi
    const trimmedLink = input.link?.trim() || null;
    if (trimmedLink) {
        try {
            new URL(trimmedLink);
        } catch {
            return { ok: false, error: 'Link harus berupa URL yang valid.' };
        }
    }

    const trimmedCatatan = input.catatan?.trim() || null;

    try {
        const existing = await prisma.dokumen.findUnique({
            where: { id: input.id },
        });
        if (!existing) {
            return { ok: false, error: 'Dokumen tidak ditemukan.' };
        }

        await prisma.$transaction(async (tx) => {
            await tx.dokumen.update({
                where: { id: input.id },
                data: {
                    status: input.status,
                    link: trimmedLink,
                    catatan: trimmedCatatan,
                },
            });

            const beforeSnapshot: Record<string, unknown> = {};
            const afterSnapshot: Record<string, unknown> = {};
            let hasDiff = false;

            for (const key of ['status', 'link', 'catatan'] as const) {
                const beforeVal = String((existing as Record<string, unknown>)[key] ?? '');
                const afterVal = String(key === 'status' ? input.status : key === 'link' ? trimmedLink : trimmedCatatan ?? '');
                if (beforeVal !== afterVal) {
                    beforeSnapshot[key] = (existing as Record<string, unknown>)[key];
                    afterSnapshot[key] = key === 'status' ? input.status : key === 'link' ? trimmedLink : trimmedCatatan;
                    hasDiff = true;
                }
            }

            if (!hasDiff) return { ok: true };

            const kegiatanNama = await prisma.kegiatan.findUnique({
                where: { id: existing.kegiatanId },
                select: { namaKegiatan: true },
            });
            
            await logActivity({
                entity: 'DOKUMEN',
                entityId: input.id,
                action: 'UPDATE',
                userId: user!.id,
                changes: { 
                    before: beforeSnapshot, 
                    after: afterSnapshot,
                    meta: { entityName: `Dokumen ${existing.jenis} - ${kegiatanNama?.namaKegiatan ?? '-'}` }, 
                },
            }, tx);
        });

        revalidatePath('/worksheet');
        revalidatePath(`/worksheet/${existing.kegiatanId}`);
        return { ok: true };
    } catch {
        return { ok: false, error: 'Gagal memperbarui dokumen.' };
    }
}