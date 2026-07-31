// helper murni grid kalender bulanan. Start hari Senin (konvensi Indonesia).
// Bulan 0-indexed (0 = Januari), konsisten dengan Date constructor.

export type MingguKalender = (Date | null)[]; // selalu panjang 7; null = sel di luar bulan

export function getMonthGrid(tahun: number, bulan: number): MingguKalender[] {
    // Geser getDay() (0 = Minggu) agar 0 = Senin.
    const offset = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
    const totalHari = new Date(tahun, bulan + 1, 0).getDate();

    const cells: (Date | null)[] = [
        ...Array.from({ length: offset }, () => null),
        ...Array.from({ length: totalHari }, (_, i) => new Date(tahun, bulan, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: MingguKalender[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}