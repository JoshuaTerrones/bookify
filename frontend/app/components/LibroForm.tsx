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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

        const body = JSON.stringify({ titulo, autor, precio, stock: parseInt(stock) });
        const url = libroInicial?.id ? `/api/libros/${libroInicial.id}` : '/api/libros';
        const method = libroInicial?.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        console.log('Respuesta:', res.status, await res.clone().json());

        setGuardando(false);
        onGuardado();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg"
            />
            <input
                type="text"
                placeholder="Autor"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg"
            />
            <input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg"
            />
            <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
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