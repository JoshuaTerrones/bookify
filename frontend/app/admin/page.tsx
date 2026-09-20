'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LibroForm from '../components/LibroForm';
import ClienteForm from '../components/ClienteForm';

interface Libro {
    id: number;
    titulo: string;
    autor: string;
    precio: string;
    stock: number;
}

interface Cliente {
    id: number;
    nombre: string;
    email: string;
}

export default function Admin() {
    // === ESTADOS DE LIBROS ===
    const [libros, setLibros] = useState<Libro[]>([]);
    const [mostrarFormLibro, setMostrarFormLibro] = useState(false);
    const [libroEditando, setLibroEditando] = useState<Libro | null>(null);

    // === ESTADOS DE CLIENTES ===
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

    // === ESTADOS GENERALES ===
    const [cargando, setCargando] = useState(true);
    const [autenticado, setAutenticado] = useState<boolean | null>(null);
    const [tabActiva, setTabActiva] = useState<'libros' | 'clientes'>('libros');
    const router = useRouter();

    // === CARGAR LIBROS DESDE EL BACKEND ===
    const cargarLibros = useCallback(() => {
        fetch('/api/libros').then(r => r.json()).then(data => {
            setLibros(data);
            setCargando(false);
        });
    }, []);

    // === CARGAR CLIENTES DESDE EL BACKEND ===
    const cargarClientes = useCallback(() => {
        fetch('/api/clientes').then(r => r.json()).then(data => {
            setClientes(data);
        });
    }, []);

    // === VERIFICAR SESIÓN AL ENTRAR ===
    useEffect(() => {
        fetch('/api/me').then(r => r.json()).then(d => {
            if (!d.autenticado) {
                router.push('/login');
            } else {
                setAutenticado(true);
                cargarLibros();
                cargarClientes();
            }
        });
    }, [router, cargarLibros, cargarClientes]);

    // === BORRAR LIBRO ===
    const handleBorrarLibro = async (id: number) => {
        if (!confirm('¿Borrar este libro?')) return;
        await fetch(`/api/libros/${id}`, { method: 'DELETE' });
        cargarLibros();
    };

    // === BORRAR CLIENTE ===
    const handleBorrarCliente = async (id: number) => {
        if (!confirm('¿Borrar este cliente?')) return;
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        cargarClientes();
    };

    // === CERRAR SESIÓN ===
    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    if (autenticado === null) return <p className="p-8">Verificando sesión...</p>;

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                {/* === HEADER === */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-black">Panel de administración</h1>
                    <div className="flex items-center gap-4">
                        <a href="/" className="text-sm text-gray-500 underline">
                            Ver catálogo
                        </a>
                        <button onClick={handleLogout} className="text-sm text-gray-500 underline">
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {/* === PESTAÑAS === */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTabActiva('libros')}
                        className={`px-4 py-2 rounded-lg ${tabActiva === 'libros' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300'}`}
                    >
                        Libros
                    </button>
                    <button
                        onClick={() => setTabActiva('clientes')}
                        className={`px-4 py-2 rounded-lg ${tabActiva === 'clientes' ? 'bg-black text-white' : 'bg-white text-black border border-gray-300'}`}
                    >
                        Clientes
                    </button>
                </div>

                {/* === SECCIÓN LIBROS === */}
                {tabActiva === 'libros' && (
                    <>
                        <button
                            onClick={() => { setLibroEditando(null); setMostrarFormLibro(true); }}
                            className="bg-black text-white px-4 py-2 rounded-lg mb-6"
                        >
                            + Agregar libro
                        </button>

                        {mostrarFormLibro && (
                            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                                <LibroForm
                                    libroInicial={libroEditando || undefined}
                                    onGuardado={() => { setMostrarFormLibro(false); cargarLibros(); }}
                                    onCancelar={() => setMostrarFormLibro(false)}
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
                                            <p className="font-semibold text-black">{libro.titulo}</p>
                                            <p className="text-sm text-black">{libro.autor} — S/ {libro.precio}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setLibroEditando(libro); setMostrarFormLibro(true); }}
                                                className="text-sm text-blue-600"
                                            >
                                                Editar
                                            </button>
                                            <button onClick={() => handleBorrarLibro(libro.id)} className="text-sm text-red-600">
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* === SECCIÓN CLIENTES === */}
                {tabActiva === 'clientes' && (
                    <>
                        <button
                            onClick={() => { setClienteEditando(null); setMostrarFormCliente(true); }}
                            className="bg-black text-white px-4 py-2 rounded-lg mb-6"
                        >
                            + Agregar cliente
                        </button>

                        {mostrarFormCliente && (
                            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                                <ClienteForm
                                    clienteInicial={clienteEditando || undefined}
                                    onGuardado={() => { setMostrarFormCliente(false); cargarClientes(); }}
                                    onCancelar={() => setMostrarFormCliente(false)}
                                />
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {clientes.length === 0 ? (
                                <p className="p-4 text-black">No hay clientes todavía.</p>
                            ) : (
                                clientes.map((cliente) => (
                                    <div key={cliente.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div>
                                            <p className="font-semibold text-black">{cliente.nombre}</p>
                                            <p className="text-sm text-black">{cliente.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setClienteEditando(cliente); setMostrarFormCliente(true); }}
                                                className="text-sm text-blue-600"
                                            >
                                                Editar
                                            </button>
                                            <button onClick={() => handleBorrarCliente(cliente.id)} className="text-sm text-red-600">
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}