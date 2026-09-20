'use client';

import { useEffect } from 'react';

interface ToastProps {
    mensaje: string;
    tipo?: 'success' | 'error';
    onCerrar: () => void;
    duracion?: number;
}

export default function Toast({ mensaje, tipo = 'success', onCerrar, duracion = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onCerrar, duracion);
        return () => clearTimeout(timer);
    }, [onCerrar, duracion]);

    const estilos = {
        success: 'bg-green-50 border-green-300 text-green-800',
        error: 'bg-red-50 border-red-300 text-red-800',
    };

    const icono = {
        success: (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-md ${estilos[tipo]}`}>
                {icono[tipo]}
                <p className="text-sm font-medium">{mensaje}</p>
                <button
                    onClick={onCerrar}
                    className="ml-2 text-current opacity-50 hover:opacity-100 transition"
                    aria-label="Cerrar notificación"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}