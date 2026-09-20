'use client';

import { useState } from 'react';

interface LibroFormProps {
    libroInicial?: {
        id?: number;
        titulo: string;
        autor: string;
        precio: string;
        stock: number;
    };
    onGuardado: () => void;
    onCancelar: () => void;
}

export default function LibroForm({ libroInicial, onGuardado, onCancelar }: LibroFormProps) {
    const [titulo, setTitulo] = useState(libroInicial?.titulo || '');
    const [autor, setAutor] = useState(libroInicial?.autor || '');
    const [precio, setPrecio] = useState(libroInicial?.precio || '');
    const [stock, setStock] = useState(libroInicial?.stock?.toString() || '');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        const body = JSON.stringify({ titulo, autor, precio, stock: parseInt(stock) });
        const url = libroInicial?.id ? `/api/libros/${libroInicial.id}` : '/api/libros';
        const method = libroInicial?.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        setGuardando(false);

        if (!res.ok) {
            try {
                const data = await res.json();
                let mensaje = 'Error al guardar el libro';
                if (typeof data === 'string') mensaje = data;
                else if (Array.isArray(data)) mensaje = data.join(', ');
                else if (typeof data === 'object') mensaje = Object.values(data).flat().join('\n');
                setError(mensaje);
            } catch {
                setError('Error al guardar el libro');
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
                <label htmlFor="titulo" className={labelClass}>Título</label>
                <input
                    id="titulo"
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    placeholder="Ej. Cien años de soledad"
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="autor" className={labelClass}>Autor</label>
                <input
                    id="autor"
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    required
                    placeholder="Ej. Gabriel García Márquez"
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="precio" className={labelClass}>Precio (S/)</label>
                    <input
                        id="precio"
                        type="number"
                        step="0.01"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                        placeholder="0.00"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="stock" className={labelClass}>Stock</label>
                    <input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        placeholder="0"
                        className={inputClass}
                    />
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
                    {guardando ? 'Guardando...' : 'Guardar libro'}
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