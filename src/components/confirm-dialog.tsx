'use client';

import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useModalScrollLock } from '@/hooks/use-modal-scroll-lock';

type ConfirmDialogVariant = 'danger' | 'primary';

export default function ConfirmDialog({
    open,
    title,
    message,
    variant = 'danger',
    loading = false,
    cancelLabel ='Batal',
    confirmLabel = 'Ya',
    onConfirm,
    onCancel,
    error, // NEW: error message to show inside dialog
}: {
    open: boolean;
    title: string;
    message: string;
    variant?: ConfirmDialogVariant;
    loading?: boolean;
    cancelLabel?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    error?: string; // NEW
}) {
    const id = useId();
    const confirmRef = useRef<HTMLButtonElement>(null);

    // 🔒 Lock scroll background saat confirm dialog terbuka
    useModalScrollLock(open); 
    
    useEffect(() => {
        if (open) confirmRef.current?.focus();
    }, [open, loading]);

    if (!open) return null;

    const confirmClass = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : 'btn-primary';
        return (
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                aria-describedby={`${id}-desc`}
                className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
                onClick={loading ? undefined : onCancel}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-sm w-full animate-dialog-in"
                        onClick={(e) => e.stopPropagation()}    
                    >
                        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center">
                            <div className="rounded-full bg-red-50 p-3 mb-3">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 id={`${id}-title`} className="font-display text-lg font-semibold text-navy">
                                {title}
                            </h3>
                            <p id={`${id}-desc`} className="text-sm text-muted mt-1">
                                {message}
                            </p>
                            {error && (
                            <p className="text-xs text-red-600 mt-2 w-full text-left px-2" role="alert">
                                {error}
                            </p>
                            )}
                        </div>
                        <div className="flex gap-2 px-5 pb-5">
                            <button type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg border border-app text-sm font-medium disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button ref={confirmRef}
                                type="button"
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${confirmClass}`}
                            >
                                {loading ? 'Memproses...' : confirmLabel}        
                            </button>
                        </div>
                    </div>
                </div>
        );
}