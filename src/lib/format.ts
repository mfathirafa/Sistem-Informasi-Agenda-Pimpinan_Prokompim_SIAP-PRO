// Helper tanggal & format shared — single source of truth.
// Sebelumnya diduplikasi di worksheet-client, laporan-client, kalender, dashboard.

export function padDate(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

export function toDateInput(d: Date | string): string {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${padDate(dt.getMonth() + 1)}-${padDate(dt.getDate())}`;
}

export function formatTanggal(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${padDate(d.getDate())}/${padDate(d.getMonth() + 1)}/${d.getFullYear()}`;
}
