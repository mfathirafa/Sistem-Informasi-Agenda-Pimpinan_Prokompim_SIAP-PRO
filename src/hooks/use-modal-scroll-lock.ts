'use client';

import { useEffect } from "react";

/**
 * Lock scroll pada body saat modal/dialog terbuka.
 * Mengatur overflow: hidden pada html dan body
 * Kompensasi scrollbar untuk mencegah layout shift.
 * Cleanup otomatis saat unmount atau open=false
 */
export function useModalScrollLock(open: boolean) {
    useEffect(() => {
        if (!open) return;

        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.overflow;
        const prevBody = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        // Hitung scrollbar width untuk mencegah layout shift
        const scrollbarWidth = window.innerWidth - html.clientWidth;

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';

        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            html.style.overflow = prevHtml;
            body.style.overflow = prevBody;
            body.style.paddingRight = prevPaddingRight;
        }
    }, [open])
}