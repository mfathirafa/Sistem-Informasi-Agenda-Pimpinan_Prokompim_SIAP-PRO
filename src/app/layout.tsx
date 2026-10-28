import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from "sonner";
import { GlobalLoading } from "@/components/global-loading";
import './globals.css';

const fraunces = Fraunces({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    variable: '--font-fraunces',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});

const plexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-plex-mono',
    display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://siappro-app.vercel.app';

export const viewport: Viewport = {
    themeColor: '#0f172a',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        default: 'SIAP-PRO - Sistem Informasi Agenda Pimpinan Prokompim Brebes',
        template: '%s | SIAP-PRO Brebes',
    },
    description: 'Sistem Informasi Agenda Pimpinan Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes. Pengelolaan worksheet agenda, kegiatan pimpinan, dan administrasi keprotokolan.',
    applicationName: 'SIAP-PRO',
    authors: [{ name: 'Bagian Protokol dan Komunikasi Pimpinan Setda Kabupaten Brebes' }],
    creator: 'Prokompim Setda Kabupaten Brebes',
    publisher: 'Pemerintah Kabupaten Brebes',
    keywords: [
        'SIAP-PRO',
        'SIAP PRO',
        'SIAP-PRO Brebes',
        'Agenda Pimpinan Brebes',
        'Prokompim Brebes',
        'Protokol Brebes',
        'Bupati Brebes',
        'Wakil Bupati Brebes',
        'Setda Kabupaten Brebes',
        'Pemerintah Kabupaten Brebes',
        'SPJ Protokol',
    ],
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'SIAP-PRO - Sistem Informasi Agenda Pimpinan Prokompim Brebes',
        description: 'Portal Resmi Sistem Informasi Agenda Pimpinan Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes.',
        url: appUrl,
        siteName: 'SIAP-PRO Brebes',
        locale: 'id_ID',
        type: 'website',
        images: [
            {
                url: '/gedung-kpt.jpg',
                width: 1200,
                height: 630,
                alt: 'Kantor Pemerintahan Terpadu (KPT) Kabupaten Brebes - SIAP-PRO',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SIAP-PRO - Sistem Informasi Agenda Pimpinan Prokompim Brebes',
        description: 'Portal Resmi Sistem Informasi Agenda Pimpinan Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes.',
        images: ['/gedung-kpt.jpg'],
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/logo-pemkab.png', sizes: '192x192', type: 'image/png' },
        ],
        apple: [{ url: '/logo-pemkab.png' }],
    },
    verification: {
        google: '7JDJCwm4tTGmXT8I5oVcc22OOsW7TNb7kKSPGxG8HrM',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-sans antialiased`}>
                {children}
                <Suspense fallback={null}>
                    <GlobalLoading />
                </Suspense>
                <Toaster position="top-right" richColors/>
            </body>
        </html>
    );
}
