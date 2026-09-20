'use client';

import { useState } from 'react';

interface ClienteFormProps {
    clienteInicial?: {
        id?: number;
        nombre: string;
        email: string;
    };
    onGuardado: () => void;
    onCancelar: () => void;
}

export default function ClienteForm({ clienteInicial, onGuardado, onCancelar }: ClienteFormProps) {
    const [nombre, setNombre] = useState(clienteInicial?.nombre || '');
    const [email, setEmail] = useState(clienteInicial?.email || '');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        const body = JSON.stringify({ nombre, email });
        const url = clienteInicial?.id ? `/api/clientes/${clienteInicial.id}` : '/api/clientes';
        const method = clienteInicial?.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        setGuardando(false);

        if (!res.ok) {
            try {
                const data = await res.json();
                let mensaje = 'Error al guardar el cliente';
                if (typeof data === 'string') mensaje = data;
                else if (Array.isArray(data)) mensaje = data.join(', ');
                else if (typeof data === 'object') mensaje = Object.values(data).flat().join('\n');
                setError(mensaje);
            } catch {
                setError('Error al guardar el cliente');
            }
            return;
        }

        onGuardado();
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>Nombre</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ej. Juan Pérez"
                    className={inputClass}
                />
            </div>

            <div>
                <label className={labelClass}>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ej. juan@example.com"
                    className={inputClass}
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={guardando}
                    className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                    {guardando ? 'Guardando...' : 'Guardar cliente'}
                </button>
                <button
                    type="button"
                    onClick={onCancelar}
                    className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}