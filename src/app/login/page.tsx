import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SealLogo from '@/components/seal-logo';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Masuk',
  description:
    'Portal Masuk SIAP-PRO - Sistem Informasi Agenda Pimpinan Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes.',
  alternates: {
    canonical: '/login',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'GovernmentOrganization',
      '@id': 'https://siappro-app.vercel.app/#organization',
      name: 'Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes',
      alternateName: 'Prokompim Setda Kabupaten Brebes',
      url: 'https://siappro-app.vercel.app',
      logo: 'https://siappro-app.vercel.app/logo-pemkab.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kabupaten Brebes',
        addressRegion: 'Jawa Tengah',
        addressCountry: 'ID',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://siappro-app.vercel.app/#webapp',
      name: 'SIAP-PRO',
      alternateName: 'Sistem Informasi Agenda Pimpinan Prokompim Brebes',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      url: 'https://siappro-app.vercel.app/login',
      description:
        'Sistem Informasi Agenda Pimpinan Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes.',
      provider: {
        '@id': 'https://siappro-app.vercel.app/#organization',
      },
    },
  ],
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-app px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <SealLogo size={64} />
          <h1 className="font-display text-2xl mt-4 text-navy font-semibold text-center">
            SIAP-PRO
          </h1>
          <p className="text-slate-600 text-sm mt-1 text-center">
            Sistem Informasi Agenda Pimpinan Prokompim <br />
            Bagian Protokol dan Komunikasi Pimpinan <br />
            Sekretariat Daerah Kabupaten Brebes
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
