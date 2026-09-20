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
                if (typeof data === 'string') {
                    mensaje = data;
                } else if (Array.isArray(data)) {
                    mensaje = data.join(', ');
                } else if (typeof data === 'object') {
                    mensaje = Object.values(data).flat().join('\n');
                }
                setError(mensaje);
            } catch {
                setError('Error al guardar el pedido');
            }
            return;
        }

        onGuardado();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cliente */}
            <div>
                <label className="block text-sm font-medium text-black mb-1">Cliente</label>
                <select
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg"
                >
                    <option value="">-- Selecciona un cliente --</option>
                    {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
            </div>

            {/* Detalles (items) */}
            <div>
                <label className="block text-sm font-medium text-black mb-2">Libros del pedido</label>
                {detalles.length === 0 && (
                    <p className="text-sm text-gray-500 mb-2">Aún no hay libros. Añade uno.</p>
                )}
                {detalles.map((detalle, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <select
                            value={detalle.libro}
                            onChange={(e) => cambiarItem(index, 'libro', parseInt(e.target.value))}
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg"
                        >
                            <option value={0}>-- Libro --</option>
                            {libros.map(l => (
                                <option key={l.id} value={l.id}>{l.titulo}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min={1}
                            value={detalle.cantidad}
                            onChange={(e) => cambiarItem(index, 'cantidad', parseInt(e.target.value))}
                            required
                            className="w-24 px-4 py-2 border border-gray-300 text-black rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={() => quitarItem(index)}
                            className="px-3 py-2 text-red-600 border border-gray-300 rounded-lg"
                        >
                            X
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={agregarItem}
                    className="text-sm text-blue-600 underline"
                >
                    + Añadir libro
                </button>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={guardando} className="bg-black text-white px-4 py-2 rounded-lg flex-1">
                    {guardando ? 'Guardando...' : 'Guardar pedido'}
                </button>
                <button type="button" onClick={onCancelar} className="border text-black border-gray-300 px-4 py-2 rounded-lg">
                    Cancelar
                </button>
            </div>
        </form>
    );
}