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
    const [cargandoDescripcion, setCargandoDescripcion] = useState(false);

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
        setCargandoDescripcion(true);
        fetch(`/api/libros/${libro.id}/descripcion`)
            .then((res) => res.json())
            .then((d) => {
                setDescripcion(d.descripcion);
                setCargandoDescripcion(false);
            });
    };

    // Cerrar modal con tecla ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLibroSeleccionado(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Bloquear scroll del body cuando el modal está abierto
    useEffect(() => {
        document.body.style.overflow = libroSeleccionado ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [libroSeleccionado]);

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
        <main className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 backdrop-blur-sm bg-white/90">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-base sm:text-lg">
                            B
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">Bookify</h1>
                            <p className="text-xs text-gray-500 hidden sm:block">Catálogo de libros</p>
                        </div>
                    </div>
                    <a
                        href="/admin"
                        className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
                    >
                        Administrar
                    </a>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* BÚSQUEDA Y ORDEN */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
                    <div className="relative flex-1 max-w-md">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por título o autor..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm sm:text-base"
                        />
                    </div>
                    <select
                        value={orden}
                        onChange={(e) => setOrden(e.target.value)}
                        className="px-3 py-2.5 text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm sm:text-base"
                    >
                        <option value="">Ordenar por</option>
                        <option value="autor">Autor (A-Z)</option>
                        <option value="precio">Precio (menor a mayor)</option>
                        <option value="fecha">Más reciente</option>
                    </select>
                </div>

                {/* GRID DE LIBROS */}
                {cargando ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="aspect-[2/3] bg-gray-100 animate-pulse" />
                                <div className="p-3 sm:p-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : librosOrdenados.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center animate-fade-in">
                        <p className="text-gray-500">
                            {busqueda ? `No se encontraron libros para "${busqueda}".` : 'No hay libros en el catálogo.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        {librosOrdenados.map((libro, index) => (
                            <button
                                key={libro.id}
                                onClick={() => abrirModal(libro)}
                                className="group text-left bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-400 hover:shadow-md transition-all duration-200 active:scale-95 animate-fade-in-up"
                                style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
                            >
                                <div className="aspect-[2/3] bg-gray-100 overflow-hidden">
                                    {libro.portada_url ? (
                                        <img
                                            src={libro.portada_url}
                                            alt={libro.titulo}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            Sin portada
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 sm:p-4">
                                    <h2 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-1">
                                        {libro.titulo}
                                    </h2>
                                    <p className="text-xs text-gray-500 line-clamp-1">{libro.autor}</p>
                                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                                        <span className="text-sm sm:text-base font-bold text-gray-900">
                                            S/ {libro.precio}
                                        </span>
                                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                                            libro.stock > 0
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-700'
                                        }`}>
                                            {libro.stock > 0 ? `${libro.stock} disp.` : 'Agotado'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {libroSeleccionado && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-6 animate-fade-in"
                    onClick={() => setLibroSeleccionado(null)}
                >
                    <div
                        className="bg-white rounded-t-3xl md:rounded-2xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden max-h-[92vh] md:max-h-[80vh] shadow-2xl animate-slide-up md:animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle para móvil */}
                        <div className="md:hidden flex justify-center pt-3 pb-2 bg-white">
                            <div className="w-10 h-1 rounded-full bg-gray-300" />
                        </div>

                        {/* Portada */}
                        <div className="h-52 sm:h-64 md:h-auto md:w-2/5 bg-gray-100 shrink-0">
                            {libroSeleccionado.portada_url ? (
                                <img
                                    src={libroSeleccionado.portada_url}
                                    alt={libroSeleccionado.titulo}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    Sin portada
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-5 sm:p-6 md:p-8 flex-1 overflow-y-auto relative">
                            <button
                                onClick={() => setLibroSeleccionado(null)}
                                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>

                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Detalle del libro
                            </p>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 pr-10 leading-tight">
                                {libroSeleccionado.titulo}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">{libroSeleccionado.autor}</p>

                            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-100">
                                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                    S/ {libroSeleccionado.precio}
                                </span>
                                <span className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-full ${
                                    libroSeleccionado.stock > 0
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                }`}>
                                    {libroSeleccionado.stock > 0
                                        ? `${libroSeleccionado.stock} disponibles`
                                        : 'Agotado'}
                                </span>
                            </div>

                            <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
                            {cargandoDescripcion ? (
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-3 bg-gray-100 rounded w-5/6 animate-pulse" />
                                    <div className="h-3 bg-gray-100 rounded w-4/6 animate-pulse" />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {descripcion || 'Sin descripción disponible.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}