'use server';

import { revalidatePath } from "next/cache";
import { StatusDokumen } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canEditRole, type ActionResult } from "@/lib/auth";

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
            select: { kegiatanId: true },
        });
        if (!existing) {
            return { ok: false, error: 'Dokumen tidak ditemukan.' };
        }

        await prisma.dokumen.update({
            where: { id: input.id },
            data: {
                status: input.status,
                link: trimmedLink,
                catatan: trimmedCatatan,
            },
        });

        revalidatePath('/worksheet');
        revalidatePath(`/worksheet/${existing.kegiatanId}`);
        return { ok: true };
    } catch {
        return { ok: false, error: 'Gagal memperbarui dokumen.' };
    }
}