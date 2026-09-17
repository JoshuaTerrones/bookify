'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LibroForm from '../components/LibroForm';

interface Libro {
    id: number;
    titulo: string;
    autor: string;
    precio: string;
    stock: number;
}

export default function Admin() {
    const [libros, setLibros] = useState<Libro[]>([]);
    const [cargando, setCargando] = useState(true);
    const [autenticado, setAutenticado] = useState<boolean | null>(null);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [libroEditando, setLibroEditando] = useState<Libro | null>(null);
    const router = useRouter();

    const cargarLibros = useCallback(() => {
        fetch('/api/libros').then(r => r.json()).then(data => {
            setLibros(data);
            setCargando(false);
        });
    }, []);

    useEffect(() => {
        fetch('/api/me').then(r => r.json()).then(d => {
            if (!d.autenticado) {
                router.push('/login');
            } else {
                setAutenticado(true);
                cargarLibros();
            }
        });
    }, [router, cargarLibros]);

    const handleBorrar = async (id: number) => {
        if (!confirm('¿Borrar este libro?')) return;
        await fetch(`/api/libros/${id}`, { method: 'DELETE' });
        cargarLibros();
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    if (autenticado === null) return <p className="p-8">Verificando sesión...</p>;

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Administrar libros</h1>
                    <div className="flex items-center gap-4">
                        <a href="/" className="text-sm text-gray-500 underline">
                            Ver catálogo
                        </a>
                        <button onClick={handleLogout} className="text-sm text-gray-500 underline">
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => { setLibroEditando(null); setMostrarForm(true); }}
                    className="bg-black text-white px-4 py-2 rounded-lg mb-6"
                >
                    + Agregar libro
                </button>

                {mostrarForm && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                        <LibroForm
                            libroInicial={libroEditando || undefined}
                            onGuardado={() => { setMostrarForm(false); cargarLibros(); }}
                            onCancelar={() => setMostrarForm(false)}
                        />
                    </div>
                )}

                {cargando ? (
                    <p>Cargando...</p>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {libros.map((libro) => (
                            <div key={libro.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                <div>
                                    <p className="font-semibold text-black ">{libro.titulo}</p>
                                    <p className="text-sm text-black">{libro.autor} — S/ {libro.precio}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setLibroEditando(libro); setMostrarForm(true); }}
                                        className="text-sm text-blue-600"
                                    >
                                        Editar
                                    </button>
                                    <button onClick={() => handleBorrar(libro.id)} className="text-sm text-red-600">
                                        Borrar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}