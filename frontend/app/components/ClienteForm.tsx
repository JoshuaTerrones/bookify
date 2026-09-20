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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

        const body = JSON.stringify({ nombre, email });
        const url = clienteInicial?.id ? `/api/clientes/${clienteInicial.id}` : '/api/clientes';
        const method = clienteInicial?.id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        setGuardando(false);
        onGuardado();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg"
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg"
            />
            <div className="flex gap-3">
                <button type="submit" disabled={guardando} className="bg-black text-white px-4 py-2 rounded-lg flex-1">
                    {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={onCancelar} className="border text-black border-gray-300 px-4 py-2 rounded-lg">
                    Cancelar
                </button>
            </div>
        </form>
    );
}