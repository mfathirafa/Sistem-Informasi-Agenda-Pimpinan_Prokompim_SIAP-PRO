'use client';

import { useEffect } from "react";

/**
 * Hook untuk mengunci scroll body saat modal terbuka.
 * Gunakan di component modal: `useModalScrollLock(isOpen)`.
 */
export function useModalScrollLock(isOpen: boolean) {
    useEffect(() => {
        if (!isOpen) return;

        // simpan overflow asli
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Hitung scrollbar width untuk mencegah layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Kunci Scroll
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Cleanup saat unmount atau isOpen berubah jadi false
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isOpen]);
}