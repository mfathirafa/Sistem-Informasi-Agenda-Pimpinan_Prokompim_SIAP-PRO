'use client';

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Global loading spinner yang muncul saat:
 * - Navigasi antar halaman (route change)
 * - Dipicu manual via setLoading(true)
 * 
 * Spinner lingkaran dengan animasi Tailwind animate-spin.
 */
export function GlobalLoading() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

    const showLoading = () => {
        setLoading(true);
        if (loadingTimeout) clearTimeout(loadingTimeout);
        // Auto hide setelah 10 detik (fallback jika navigation gagal)
        const t = setTimeout(() => setLoading(false), 10000);
        setLoadingTimeout(t);
    };

    const hideLoading = () => {
        setLoading(false);
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            setLoadingTimeout(null);
        }
    };

    // 1. Route change (pathname) -> loading sebentar
    useEffect(() => {
        showLoading();
        // Hide setelah router selesai (Next.js 15 App Router tidak punya event built in)
        // Pakai timeout pendek sebagai fallback
        const t = setTimeout(() => hideLoading(), 2000);
        return () => clearTimeout(t);
    }, [pathname]);

    // 2. SearchParams change (filter/sort/page) -> loading
    useEffect(() => {
        showLoading();
        const t = setTimeout(() => hideLoading(), 2000);
        return () => clearTimeout(t);
    }, [searchParams?.toString()]);

    // 3. Manual trigger (login, logout, export, dll)
    useEffect(() => {
        const handleLoading = (e: CustomEvent<boolean>) => {
            if (e.detail) showLoading();
            else hideLoading();
        };
        window.addEventListener('global-loading', handleLoading as EventListener);
        return () => {
            window.removeEventListener('global-loading', handleLoading as EventListener);
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

/**
 * Helper trigger global loading dari manapun (Server Actionss, dll).
 * Usage: setGlobalLoading(true) -> proses -> setGlobalLoading(false)
 */
export function setGlobalLoading(isLoading: boolean) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('global-loading', { detail: isLoading }));
    }
}