'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Global loading spinner yang muncul saat:
 * - Navigasi antar halaman (route change)
 * - Dipicu manual via setLoading(true)
 * 
 * Spinner lingkaran dengan animasi Tailwind animate-spin.
 */
export function GlobalLoading() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    // Detect route change (pathname berubah) -> tampilan loading
    useEffect(() => {
        setLoading(false); // reset saat pathname berubah (navigasi selesai)
    }, [pathname]);

    // Listen untuk event custom dari export/action
    useEffect(() => {
        const handleLoading = (e: CustomEvent<boolean>) => {
            setLoading(e.detail);
        };
        window.addEventListener('global-loading', handleLoading as EventListener);
        return () => {
            window.removeEventListener('global-loading', handleLoading as EventListener);
        }
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

/**
 * Helper untuk trigger global loading dari manapun.
 */
export function setGlobalLoading(isLoading: boolean) {
    window.dispatchEvent(new CustomEvent('global-loading', { detail: isLoading }));
}