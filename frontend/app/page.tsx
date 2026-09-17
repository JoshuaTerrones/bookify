'use client';

import { useEffect, useState } from 'react';

interface Libro {
    id: number;
    titulo: string;
    autor: string;
    precio: string;
    stock: number;
    portada_url: string | null;
}

export default function Home() {
    const [libros, setLibros] = useState<Libro[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [orden, setOrden] = useState('');
    const [cargando, setCargando] = useState(true);
    const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);
    const [descripcion, setDescripcion] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/libros')
            .then((res) => res.json())
            .then((data) => {
                setLibros(data);
                setCargando(false);
            });
    }, []);

    const abrirModal = (libro: Libro) => {
        setLibroSeleccionado(libro);
        setDescripcion(null);
        fetch(`/api/libros/${libro.id}/descripcion`)
            .then((res) => res.json())
            .then((d) => setDescripcion(d.descripcion));
    };

    const librosFiltrados = libros.filter(
        (libro) =>
            libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            libro.autor.toLowerCase().includes(busqueda.toLowerCase())
    );

    let librosOrdenados = [...librosFiltrados];
    if (orden === 'autor') librosOrdenados.sort((a, b) => a.autor.localeCompare(b.autor));
    if (orden === 'precio') librosOrdenados.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
    if (orden === 'fecha') librosOrdenados.sort((a, b) => b.id - a.id);

    return (
        <main className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8 sm:py-10 md:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Bookify</h1>
                    <a href="/admin" className="text-sm text-gray-500 underline">
                        Administrar
                    </a>
                </div>
                <p className="text-gray-500 mb-6 sm:mb-8">Catálogo de libros</p>
                <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
                    <input
                        type="text"
                        placeholder="Buscar por título o autor..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full sm:w-96 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <select
                        value={orden}
                        onChange={(e) => setOrden(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-black border border-gray-300 rounded-lg"
                    >
                        <option value="">Ordenar por</option>
                        <option value="autor">Autor</option>
                        <option value="precio">Precio</option>
                        <option value="fecha">Más reciente</option>
                    </select>
                </div>

                {cargando ? (
                    <p className="text-gray-500">Cargando libros...</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {librosOrdenados.map((libro) => (
                            <button
                                key={libro.id}
                                onClick={() => abrirModal(libro)}
                                className="text-left bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="aspect-[2/3] bg-gray-100">
                                    {libro.portada_url ? (
                                        <img src={libro.portada_url} alt={libro.titulo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin portada</div>
                                    )}
                                </div>
                                <div className="p-3 sm:p-4">
                                    <h2 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">{libro.titulo}</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{libro.autor}</p>
                                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                                        <span className="text-sm sm:text-base font-bold text-gray-900">S/ {libro.precio}</span>
                                        <span className="text-xs text-gray-400">Stock: {libro.stock}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!cargando && librosOrdenados.length === 0 && (
                    <p className="text-gray-500 mt-8">No se encontraron libros.</p>
                )}
            </div>

            {libroSeleccionado && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50"
                    onClick={() => setLibroSeleccionado(null)}
                >
                    <div
                        className="bg-white rounded-t-2xl md:rounded-2xl max-w-2xl w-full flex flex-col md:flex-row overflow-hidden max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-44 md:h-auto md:w-1/3 bg-gray-100 shrink-0">
                            {libroSeleccionado.portada_url ? (
                                <img src={libroSeleccionado.portada_url} alt={libroSeleccionado.titulo} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin portada</div>
                            )}
                        </div>
                        <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
                            <button
                                onClick={() => setLibroSeleccionado(null)}
                                className="float-right text-gray-400 hover:text-gray-700 text-xl leading-none"
                            >
                                ✕
                            </button>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 pr-6">{libroSeleccionado.titulo}</h2>
                            <p className="text-gray-500 mb-4">{libroSeleccionado.autor}</p>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-xl md:text-2xl font-bold text-gray-900">S/ {libroSeleccionado.precio}</span>
                                <span className="text-sm text-gray-500">Stock: {libroSeleccionado.stock}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{descripcion ?? 'Cargando descripción...'}</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}