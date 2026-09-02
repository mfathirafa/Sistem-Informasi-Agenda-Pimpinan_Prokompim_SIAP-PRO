'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GlobalLoading(){
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const showLoading = useCallback(() => {
        setLoading(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Auto hide setelah 10 detik (fallback jika navigation gagal)
        timeoutRef.current = setTimeout(() => setLoading(false), 10000);
    }, []);

    const hideLoading = useCallback(() => {
        setLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // 1. Route change (pathname) -> loading sebentar
    useEffect(() => {
        hideLoading();
    }, [pathname, hideLoading]);

    // 2. SearchParams change (filter/sort/page) -> loading
    const searchParamsString = searchParams?.toString();
    useEffect(() => {
        showLoading();
        const t = setTimeout(() => hideLoading(), 2000);
        return () => clearTimeout(t);
    }, [searchParamsString, showLoading, hideLoading]);

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
    }, [showLoading, hideLoading]);

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