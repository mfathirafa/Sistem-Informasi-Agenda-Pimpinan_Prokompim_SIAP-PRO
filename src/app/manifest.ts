import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIAP-PRO - Sistem Informasi Agenda Pimpinan Prokompim Brebes',
    short_name: 'SIAP-PRO',
    description:
      'Sistem Informasi Agenda Pimpinan Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes.',
    start_url: '/login',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/logo-pemkab.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-pemkab.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
