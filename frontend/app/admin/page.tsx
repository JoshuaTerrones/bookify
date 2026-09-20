'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LibroForm from '../components/LibroForm';
import ClienteForm from '../components/ClienteForm';
import PedidoForm from '../components/PedidoForm';

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

interface Detalle {
    id?: number;
    libro: number;
    libro_titulo?: string;
    cantidad: number;
}

interface Pedido {
    id: number;
    cliente: number;
    cliente_nombre: string;
    fecha: string;
    detalles: Detalle[];
}

export default function Admin() {
    // === ESTADOS LIBROS ===
    const [libros, setLibros] = useState<Libro[]>([]);
    const [mostrarFormLibro, setMostrarFormLibro] = useState(false);
    const [libroEditando, setLibroEditando] = useState<Libro | null>(null);

    // === ESTADOS CLIENTES ===
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

    // === ESTADOS PEDIDOS ===
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [mostrarFormPedido, setMostrarFormPedido] = useState(false);
    const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);

    // === ESTADOS GENERALES ===
    const [cargando, setCargando] = useState(true);
    const [autenticado, setAutenticado] = useState<boolean | null>(null);
    const [tabActiva, setTabActiva] = useState<'libros' | 'clientes' | 'pedidos'>('libros');
    const router = useRouter();

    const cargarLibros = useCallback(() => {
        fetch('/api/libros').then(r => r.json()).then(data => {
            setLibros(data);
            setCargando(false);
        });
    }, []);

    const cargarClientes = useCallback(() => {
        fetch('/api/clientes').then(r => r.json()).then(setClientes);
    }, []);

    const cargarPedidos = useCallback(() => {
        fetch('/api/pedidos').then(r => r.json()).then(setPedidos);
    }, []);

    useEffect(() => {
        fetch('/api/me').then(r => r.json()).then(d => {
            if (!d.autenticado) {
                router.push('/login');
            } else {
                setAutenticado(true);
                cargarLibros();
                cargarClientes();
                cargarPedidos();
            }
        });
    }, [router, cargarLibros, cargarClientes, cargarPedidos]);

    const handleBorrarLibro = async (id: number) => {
        if (!confirm('¿Borrar este libro?')) return;
        await fetch(`/api/libros/${id}`, { method: 'DELETE' });
        cargarLibros();
    };

    const handleBorrarCliente = async (id: number) => {
        if (!confirm('¿Borrar este cliente?')) return;
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        cargarClientes();
    };

    const handleBorrarPedido = async (id: number) => {
        if (!confirm('¿Borrar este pedido?')) return;
        await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
        cargarPedidos();
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
                    <h1 className="text-2xl font-bold text-black">Panel de administración</h1>
                    <div className="flex items-center gap-4">
                        <a href="/" className="text-sm text-gray-500 underline">Ver catálogo</a>
                        <button onClick={handleLogout} className="text-sm text-gray-500 underline">Cerrar sesión</button>
                    </div>
                </div>

                {/* === PESTAÑAS === */}
                <div className="flex gap-2 mb-6">
                    {(['libros', 'clientes', 'pedidos'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setTabActiva(tab)}
                            className={`px-4 py-2 rounded-lg capitalize ${tabActiva === tab ? 'bg-black text-white' : 'bg-white text-black border border-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* === LIBROS === */}
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

                        {cargando ? <p>Cargando...</p> : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {libros.map(libro => (
                                    <div key={libro.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div>
                                            <p className="font-semibold text-black">{libro.titulo}</p>
                                            <p className="text-sm text-black">{libro.autor} — S/ {libro.precio}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setLibroEditando(libro); setMostrarFormLibro(true); }} className="text-sm text-blue-600">Editar</button>
                                            <button onClick={() => handleBorrarLibro(libro.id)} className="text-sm text-red-600">Borrar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* === CLIENTES === */}
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
                                clientes.map(cliente => (
                                    <div key={cliente.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div>
                                            <p className="font-semibold text-black">{cliente.nombre}</p>
                                            <p className="text-sm text-black">{cliente.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setClienteEditando(cliente); setMostrarFormCliente(true); }} className="text-sm text-blue-600">Editar</button>
                                            <button onClick={() => handleBorrarCliente(cliente.id)} className="text-sm text-red-600">Borrar</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* === PEDIDOS === */}
                {tabActiva === 'pedidos' && (
                    <>
                        <button
                            onClick={() => { setPedidoEditando(null); setMostrarFormPedido(true); }}
                            className="bg-black text-white px-4 py-2 rounded-lg mb-6"
                        >
                            + Agregar pedido
                        </button>

                        {mostrarFormPedido && (
                            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                                <PedidoForm
                                    pedidoInicial={pedidoEditando || undefined}
                                    onGuardado={() => { setMostrarFormPedido(false); cargarPedidos(); }}
                                    onCancelar={() => setMostrarFormPedido(false)}
                                />
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {pedidos.length === 0 ? (
                                <p className="p-4 text-black">No hay pedidos todavía.</p>
                            ) : (
                                pedidos.map(pedido => (
                                    <div key={pedido.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div>
                                            <p className="font-semibold text-black">Pedido #{pedido.id} — {pedido.cliente_nombre}</p>
                                            <p className="text-sm text-black">
                                                {pedido.detalles.map(d => `${d.cantidad}x ${d.libro_titulo}`).join(', ')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setPedidoEditando(pedido); setMostrarFormPedido(true); }} className="text-sm text-blue-600">Editar</button>
                                            <button onClick={() => handleBorrarPedido(pedido.id)} className="text-sm text-red-600">Borrar</button>
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