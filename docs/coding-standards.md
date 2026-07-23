# Coding Standards

Standar ini diturunkan dari pola coding yang konsisten digunakan di seluruh project.

## Prinsip Dasar

- Gunakan TypeScript strict — tidak ada `any`
- Gunakan Server Component jika memungkinkan
- Gunakan Client Component hanya untuk bagian yang butuh interaktivitas (`useState`, `usePathname`, form events)
- Semua CRUD melalui Server Actions dengan directive `'use server'`
- Semua query database melalui Prisma
- Gunakan import alias `@/`
- Jangan membuat API Route kecuali benar-benar diperlukan

## Component Pattern

### Page vs Client Component

```
page.tsx                    ← Server Component, berisi data fetching
xxx-client.tsx              ← Client Component, berisi UI interaktif
xxx-modal.tsx               ← Client Component untuk modal
```

Server component bertugas:
1. Mengambil data dari Prisma
2. Transform data ke format yang bisa di-serialize
3. Render child client component dengan data sebagai props

Client component bertugas:
1. Render UI interaktif
2. Handle user events
3. Panggil Server Actions
4. Update local state dengan optimistic update

### Server Action Pattern

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export type ActionResult = { ok: boolean; error?: string };

export async function createSomething(data: InputType): Promise<ActionResult> {
  // 1. Cek session
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Anda harus login.' };

  // 2. Cek role / otorisasi
  if (user.role !== 'ADMIN') return { ok: false, error: 'Tidak punya akses.' };

  // 3. Validasi input
  if (!data.field.trim()) return { ok: false, error: 'Field wajib diisi.' };

  // 4. Eksekusi Prisma
  try {
    await prisma.something.create({ data });
    revalidatePath('/target-page');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menyimpan data.' };
  }
}
```

### Client State Management

```typescript
const [isPending, startTransition] = useTransition();

const handleSave = (data: InputType) => {
  startTransition(async () => {
    const res = await serverAction(data);
    if (res.ok) {
      // Optimistic: update local state langsung
      setItems(prev => [...prev, newItem]);
    } else {
      alert(res.error || 'Gagal menyimpan.');
    }
  });
};
```

## Auth Pattern

```typescript
// Cek session di Server Component
const user = await getCurrentUser();

// Cek role
const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
if (user?.role !== 'ADMIN') redirect('/dashboard');

// Cek session di Server Action (sebelum operasi)
const user = await getCurrentUser();
if (user?.role !== 'ADMIN') return { ok: false, error: 'Tidak punya akses.' };
```

## Constants Pattern

```typescript
// src/lib/constants/status-xxx.ts
import { EnumName } from '@prisma/client';

// Diambil langsung dari Prisma enum — single source of truth
export const OPTIONS = Object.values(EnumName);
export type OptionValue = EnumName;

// Label untuk ditampilkan di UI
export const LABEL: Record<OptionValue, string> = { ... };

// Badge class untuk styling
export const BADGE_CLASS: Record<OptionValue, string> = { ... };
```

## Naming Convention

| Tipe | Convention | Contoh |
|------|-----------|--------|
| Page | `page.tsx` | `src/app/login/page.tsx` |
| Client Component | `xxx-client.tsx` | `worksheet-client.tsx` |
| Modal | `xxx-modal.tsx` | `kegiatan-modal.tsx` |
| Server Action | `src/app/actions/*.ts` | `kegiatan.ts` |
| Shared constants | `src/lib/constants/*.ts` | `status-kegiatan.ts` |
| Shared lib | `src/lib/*.ts` | `auth.ts`, `prisma.ts` |
| Reusable component | `src/components/*.tsx` | `searchable-select.tsx` |

## Prisma Convention

- Gunakan `@@map()` untuk snake_case table names
- Gunakan `@map()` untuk snake_case column names (jika diperlukan)
- Prisma enum → constant file → UI (tidak ada string literal di kode)
- Nested create untuk operasi atomik (kegiatan + dokumen)
- `revalidatePath()` setelah operasi write untuk refresh cached data

## Styling Convention

- Gunakan Tailwind CSS
- Badge classes didefinisikan di `globals.css` via `@layer components`
- Button classes menggunakan `btn-primary`
- Gunakan semantic color tokens (`text-navy`, `bg-app`, `text-muted`, `border-app`)

## Inconsistencies (Rekomendasi, Belum Diterapkan)

Inkonsistensi yang ditemukan di codebase — ini **bukan** standar yang sudah diterapkan, hanya catatan untuk diperbaiki di masa depan:

1. **`canEditRole()` diduplikasi** di 3 file (`actions/petugas.ts`, `actions/leading-sector.ts`, `actions/kegiatan.ts`). Idealnya dijadikan utility bersama di `src/lib/auth.ts`.

2. **Dua source untuk constants** — `src/lib/status-kegiatan.ts` dan `src/lib/constants/status-kegiatan.ts` menyimpan data yang sama. Seharusnya hanya ada satu di `src/lib/constants/`.

3. **Validasi input tidak konsisten** — `createPetugas` memvalidasi `nama.trim()`, tetapi `createKegiatan` dan `updateKegiatan` tidak melakukan validasi field wajib di server side.

4. **Tipe `ActionResult` didefinisikan ulang** di setiap file actions, padahal definisinya sama persis `{ ok: boolean; error?: string }`.
