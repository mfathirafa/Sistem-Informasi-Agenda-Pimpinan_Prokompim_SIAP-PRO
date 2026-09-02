import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { STATUS_KEGIATAN_LABEL } from '@/lib/constants/status-kegiatan';
import type { JenisPenugasanValue } from '@/lib/constants/status-penugasan';
import type { StatusPublikasiValue } from '@/lib/constants/status-publikasi';
import type { StatusKegiatan } from '@prisma/client';

export type KegiatanItem = {
    id: string;
    namaKegiatan: string;
    tanggal: string;
    waktu: string | null;
    tempat: string;
    pejabat: string;
    perihalSurat: string | null;
    nomorSurat: string | null;
    dresscode: string | null;
    picNama: string | null;
    picNoHp: string | null;
    leadingSectorNama: string;
    statusSambutan: string;
    statusKegiatan: StatusKegiatan;
    petugasProtokolNama: string[];
    petugasLiputanNama: string[];
    allCrewProtokol: boolean;
    allCrewLiputan: boolean;
    jenisPenugasan: JenisPenugasanValue;
    statusPublikasi: StatusPublikasiValue;
};

function formatTanggalIndo(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatCrew(allCrew: boolean, names: string[]): string {
    if (!allCrew) return names.join(', ') || '-';
    const pj = names.join(', ') || '-';
    return pj === '-' ? 'Semua crew' : `Semua crew (PJ: ${pj})`;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 25,
        paddingBottom: 35,
        paddingHorizontal: 25,
        fontSize: 7.5,
        fontFamily: 'Helvetica',
        color: '#0f172a',
    },
    headerContainer: {
        marginBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 6,
        textAlign: 'center',
    },
    instansi1: {
        fontSize: 10.5,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.8,
    },
    instansi2: {
        fontSize: 9.5,
        fontFamily: 'Helvetica',
        marginTop: 1,
    },
    instansi3: {
        fontSize: 10.5,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.5,
        marginTop: 1,
    },
    alamat: {
        fontSize: 7,
        color: '#475569',
        marginTop: 2,
    },
    titleContainer: {
        marginTop: 6,
        marginBottom: 8,
        textAlign: 'center',
    },
    reportTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'underline',
    },
    reportPeriod: {
        fontSize: 7.5,
        color: '#334155',
        marginTop: 2,
    },
    table: {
        width: '100%',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderTopWidth: 0.5,
        borderTopColor: '#94a3b8',
        borderBottomWidth: 0.5,
        borderBottomColor: '#94a3b8',
        borderLeftWidth: 0.5,
        borderLeftColor: '#94a3b8',
        borderRightWidth: 0.5,
        borderRightColor: '#94a3b8',
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#cbd5e1',
        borderLeftWidth: 0.5,
        borderLeftColor: '#cbd5e1',
        borderRightWidth: 0.5,
        borderRightColor: '#cbd5e1',
        minHeight: 16,
    },
    th: {
        padding: 3,
        borderRightWidth: 0.5,
        borderRightColor: '#94a3b8',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    td: {
        padding: 3,
        borderRightWidth: 0.5,
        borderRightColor: '#cbd5e1',
        fontSize: 6.5,
    },
    tdLast: {
        padding: 3,
        fontSize: 6.5,
    },
    footer: {
        position: 'absolute',
        bottom: 12,
        left: 25,
        right: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 6.5,
        color: '#64748b',
        borderTopWidth: 0.5,
        borderTopColor: '#cbd5e1',
        paddingTop: 3,
    },
});

export function LaporanPdfDocument({
    data,
    startDate,
    endDate,
    mode,
}: {
    data: KegiatanItem[];
    startDate: string;
    endDate: string;
    mode: 'ringkas' | 'detail';
}) {
    const isRingkas = mode === 'ringkas';

    return (
        <Document>
            <Page size="LEGAL" orientation='landscape' style={styles.page}>
                {/* Kop Surat Resmi */}
                <View style={styles.headerContainer} fixed>
                    <Text style={styles.instansi1}>PEMERINTAH KABUPATEN BREBES</Text>
                    <Text style={styles.instansi2}>SEKRETARIAT DAERAH</Text>
                    <Text style={styles.instansi3}>BAGIAN PROTOKOL DAN KOMUNIKASI PIMPINAN</Text>
                    <Text style={styles.alamat}>Jl. Proklamasi No. 77 Brebes 52212</Text>
                </View>

                {/* Judul Laporan */}
                <View style={styles.titleContainer}>
                    <Text style={styles.reportTitle}>
                        LAPORAN KEGIATAN PROKOMPIM {isRingkas ? '(RINGKAS)' : '(DETAIL)'}
                    </Text>
                    <Text style={styles.reportPeriod}>
                        Periode: {formatTanggalIndo(startDate)} s.d. {formatTanggalIndo(endDate)}
                    </Text>
                </View>

                {/* Tabel Data */}
                <View style={styles.table}>
                    {/* Header Tabel */}
                    <View style={styles.tableHeader} fixed>
                        {isRingkas ? (
                            <>
                                <Text style={[styles.th, { width: '3%' }]}>#</Text>
                                <Text style={[styles.th, { width: '7%' }]}>Tanggal</Text>
                                <Text style={[styles.th, { width: '18%' }]}>Nama Kegiatan</Text>
                                <Text style={[styles.th, { width: '13%' }]}>Tempat</Text>
                                <Text style={[styles.th, { width: '10%' }]}>Pejabat</Text>
                                <Text style={[styles.th, { width: '5%' }]}>Waktu</Text>
                                <Text style={[styles.th, { width: '12%' }]}>Leading Sector</Text>
                                <Text style={[styles.th, { width: '12%' }]}>Protokol</Text>
                                <Text style={[styles.th, { width: '12%' }]}>Liputan</Text>
                                <Text style={[styles.th, { width: '8%', borderRightWidth: 0 }]}>Status</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.th, { width: '2.5%' }]}>#</Text>
                                <Text style={[styles.th, { width: '5.5%' }]}>Tanggal</Text>
                                <Text style={[styles.th, { width: '12%' }]}>Nama Kegiatan</Text>
                                <Text style={[styles.th, { width: '7.5%' }]}>Perihal</Text>
                                <Text style={[styles.th, { width: '7%' }]}>No. Surat</Text>
                                <Text style={[styles.th, { width: '5%' }]}>Dresscode</Text>
                                <Text style={[styles.th, { width: '4.5%' }]}>Waktu</Text>
                                <Text style={[styles.th, { width: '9%' }]}>Tempat</Text>
                                <Text style={[styles.th, { width: '7%' }]}>Pejabat</Text>
                                <Text style={[styles.th, { width: '6%' }]}>No HP PIC</Text>
                                <Text style={[styles.th, { width: '8%' }]}>Leading Sector</Text>
                                <Text style={[styles.th, { width: '4.5%' }]}>Sambutan</Text>
                                <Text style={[styles.th, { width: '7.5%' }]}>Protokol</Text>
                                <Text style={[styles.th, { width: '7.5%' }]}>Liputan</Text>
                                <Text style={[styles.th, { width: '6.5%', borderRightWidth: 0 }]}>Status</Text>
                            </>
                        )}
                    </View>

                    {/* Baris Data */}
                    {data.length === 0 ? (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tdLast, { width: '100%', textAlign: 'center', padding: 8 }]}>
                                Tidak ada data kegiatan pada periode ini.
                            </Text>
                        </View>
                    ): (
                        data.map((k, index) => (
                            <View key={k.id} style={styles.tableRow} wrap={false}>
                                {isRingkas ? (
                                    <>
                                        <Text style={[styles.td, { width: '3%', textAlign: 'center' }]}>{index + 1}</Text>
                                        <Text style={[styles.td, { width: '7%' }]}>{formatTanggalIndo(k.tanggal)}</Text>
                                        <Text style={[styles.td, { width: '18%', fontFamily: 'Helvetica-Bold' }]}>{k.namaKegiatan}</Text>
                                        <Text style={[styles.td, { width: '13%' }]}>{k.tempat || '-'}</Text>
                                        <Text style={[styles.td, { width: '10%' }]}>{k.pejabat || '-'}</Text>
                                        <Text style={[styles.td, { width: '5%', textAlign: 'center' }]}>{k.waktu || '-'}</Text>
                                        <Text style={[styles.td, { width: '12%' }]}>{k.leadingSectorNama || '-'}</Text>
                                        <Text style={[styles.td, { width: '12%' }]}>{formatCrew(k.allCrewProtokol, k.petugasProtokolNama)}</Text>
                                        <Text style={[styles.td, { width: '12%' }]}>{formatCrew(k.allCrewLiputan, k.petugasLiputanNama)}</Text>
                                        <Text style={[styles.tdLast, { width: '8%' }]}>{STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}</Text>
                                    </>
                                ): (
                                    <>
                                        <Text style={[styles.td, { width: '2.5%', textAlign: 'center' }]}>{index + 1}</Text>
                                        <Text style={[styles.td, { width: '5.5%' }]}>{formatTanggalIndo(k.tanggal)}</Text>
                                        <Text style={[styles.td, { width: '12%', fontFamily: 'Helvetica-Bold' }]}>{k.namaKegiatan}</Text>
                                        <Text style={[styles.td, { width: '7.5%' }]}>{k.perihalSurat || '-'}</Text>
                                        <Text style={[styles.td, { width: '7%' }]}>{k.nomorSurat || '-'}</Text>
                                        <Text style={[styles.td, { width: '5%' }]}>{k.dresscode || '-'}</Text>
                                        <Text style={[styles.td, { width: '4.5%', textAlign: 'center' }]}>{k.waktu || '-'}</Text>
                                        <Text style={[styles.td, { width: '9%' }]}>{k.tempat || '-'}</Text>
                                        <Text style={[styles.td, { width: '7%' }]}>{k.pejabat || '-'}</Text>
                                        <Text style={[styles.td, { width: '6%' }]}>{k.picNoHp || '-'}</Text>
                                        <Text style={[styles.td, { width: '8%' }]}>{k.leadingSectorNama || '-'}</Text>
                                        <Text style={[styles.td, { width: '4.5%', textAlign: 'center' }]}>{k.statusSambutan === 'SUDAH' ? 'Sudah' : 'Belum'}</Text>
                                        <Text style={[styles.td, { width: '7.5%' }]}>{formatCrew(k.allCrewProtokol, k.petugasProtokolNama)}</Text>
                                        <Text style={[styles.td, { width: '7.5%' }]}>{formatCrew(k.allCrewLiputan, k.petugasLiputanNama)}</Text>
                                        <Text style={[styles.tdLast, { width: '6.5%' }]}>{STATUS_KEGIATAN_LABEL[k.statusKegiatan] || k.statusKegiatan}</Text>
                                    </>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Footer Halaman Dinamis */}
                <View style={styles.footer} fixed>
                    <Text>SIAP-PRO • Bagian Prokompim Setda Kab. Brebes</Text>
                    <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}