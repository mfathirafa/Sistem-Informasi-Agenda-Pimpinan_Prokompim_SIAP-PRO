import { Suspense } from "react";
import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from "sonner";
import { GlobalLoading } from "@/components/global-loading";
import './globals.css';

const fraunces = Fraunces({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    variable: '--font-fraunces',
});
const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
});
const plexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-plex-mono',
});

export const metadata: Metadata = {
    title: 'SIAP-PRO - Sistem Informasi Agenda Pimpinan Prokompim',
    description: 'Worksheet kegiatan Bupati dan Wakil Bupati Kabupaten Brebes',
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