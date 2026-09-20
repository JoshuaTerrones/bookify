'use client';

import { useState, useEffect } from 'react';

interface Detalle {
    libro: number;
    cantidad: number;
}

interface PedidoFormProps {
    pedidoInicial?: {
        id?: number;
        cliente: number;
        detalles: Detalle[];
    };
    onGuardado: () => void;
    onCancelar: () => void;
}

interface Cliente {
    id: number;
    nombre: string;
}

interface Libro {
    id: number;
    titulo: string;
    precio: string;
}

export default function PedidoForm({ pedidoInicial, onGuardado, onCancelar }: PedidoFormProps) {
    const [cliente, setCliente] = useState(pedidoInicial?.cliente?.toString() || '');
    const [detalles, setDetalles] = useState<Detalle[]>(pedidoInicial?.detalles || []);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [libros, setLibros] = useState<Libro[]>([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/clientes').then(r => r.json()).then(setClientes);
        fetch('/api/libros').then(r => r.json()).then(setLibros);
    }, []);

    const agregarItem = () => {
        setDetalles([...detalles, { libro: 0, cantidad: 1 }]);
    };

    const quitarItem = (index: number) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const cambiarItem = (index: number, campo: 'libro' | 'cantidad', valor: number) => {
        const nuevos = [...detalles];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        setDetalles(nuevos);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!cliente) {
            setError('Selecciona un cliente');
            return;
        }
        if (detalles.length === 0) {
            setError('Añade al menos un libro');
            return;
        }

        setGuardando(true);

        const body = JSON.stringify({
            cliente: parseInt(cliente),
            detalles,
        });
        const url = pedidoInicial?.id ? `/api/pedidos/${pedidoInicial.id}` : '/api/pedidos';
        const method = pedidoInicial?.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        setGuardando(false);

        if (!res.ok) {
            try {
                const data = await res.json();
                let mensaje = 'Error al guardar el pedido';
                if (typeof data === 'string') mensaje = data;
                else if (Array.isArray(data)) mensaje = data.join(', ');
                else if (typeof data === 'object') mensaje = Object.values(data).flat().join('\n');
                setError(mensaje);
            } catch {
                setError('Error al guardar el pedido');
            }
            return;
        }

        onGuardado();
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className={labelClass}>Cliente</label>
                <select
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    required
                    className={inputClass}
                >
                    <option value="">-- Selecciona un cliente --</option>
                    {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Libros del pedido</label>
                    <button
                        type="button"
                        onClick={agregarItem}
                        className="text-sm font-medium text-black hover:underline"
                    >
                        + Añadir libro
                    </button>
                </div>

                {detalles.length === 0 && (
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                        Aún no hay libros. Añade uno para comenzar.
                    </div>
                )}

                <div className="space-y-2">
                    {detalles.map((detalle, index) => (
                        <div key={index} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                            <select
                                value={detalle.libro}
                                onChange={(e) => cambiarItem(index, 'libro', parseInt(e.target.value))}
                                required
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                            >
                                <option value={0}>-- Selecciona un libro --</option>
                                {libros.map(l => (
                                    <option key={l.id} value={l.id}>{l.titulo} (S/ {l.precio})</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                value={detalle.cantidad}
                                onChange={(e) => cambiarItem(index, 'cantidad', parseInt(e.target.value))}
                                required
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                            />
                            <button
                                type="button"
                                onClick={() => quitarItem(index)}
                                className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                aria-label="Quitar"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
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
                    {guardando ? 'Guardando...' : 'Guardar pedido'}
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