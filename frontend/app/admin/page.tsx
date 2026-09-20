'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LibroForm from '../components/LibroForm';
import ClienteForm from '../components/ClienteForm';
import PedidoForm from '../components/PedidoForm';
import Toast from '../components/Toast';

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
    const [libros, setLibros] = useState<Libro[]>([]);
    const [mostrarFormLibro, setMostrarFormLibro] = useState(false);
    const [libroEditando, setLibroEditando] = useState<Libro | null>(null);

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [mostrarFormPedido, setMostrarFormPedido] = useState(false);
    const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);

    const [cargando, setCargando] = useState(true);
    const [autenticado, setAutenticado] = useState<boolean | null>(null);
    const [tabActiva, setTabActiva] = useState<'libros' | 'clientes' | 'pedidos'>('libros');
    const [toast, setToast] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);
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

    const mostrarToast = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setToast({ mensaje, tipo });
    };

    const handleBorrarLibro = async (id: number) => {
        if (!confirm('¿Borrar este libro?')) return;
        await fetch(`/api/libros/${id}`, { method: 'DELETE' });
        cargarLibros();
        mostrarToast('Libro eliminado correctamente');
    };

    const handleBorrarCliente = async (id: number) => {
        if (!confirm('¿Borrar este cliente?')) return;
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        cargarClientes();
        mostrarToast('Cliente eliminado correctamente');
    };

    const handleBorrarPedido = async (id: number) => {
        if (!confirm('¿Borrar este pedido?')) return;
        await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
        cargarPedidos();
        mostrarToast('Pedido eliminado correctamente');
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    if (autenticado === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Verificando sesión...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'libros' as const, label: 'Libros', count: libros.length },
        { id: 'clientes' as const, label: 'Clientes', count: clientes.length },
        { id: 'pedidos' as const, label: 'Pedidos', count: pedidos.length },
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">
                            B
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Bookify Admin</h1>
                            <p className="text-xs text-gray-500">Panel de administración</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            className="text-sm text-gray-600 hover:text-gray-900 transition"
                        >
                            Ver catálogo
                        </a>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-600 hover:text-red-600 transition"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* TABS */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setTabActiva(tab.id)}
                                className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                                    tabActiva === tab.id
                                        ? 'border-black text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    tabActiva === tab.id
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* === LIBROS === */}
                {tabActiva === 'libros' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => { setLibroEditando(null); setMostrarFormLibro(true); }}
                                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                            >
                                + Agregar libro
                            </button>
                        </div>

                        {mostrarFormLibro && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
                                <LibroForm
                                    libroInicial={libroEditando || undefined}
                                    onGuardado={() => {
                                        setMostrarFormLibro(false);
                                        cargarLibros();
                                        mostrarToast(libroEditando ? 'Libro actualizado' : 'Libro creado');
                                    }}
                                    onCancelar={() => setMostrarFormLibro(false)}
                                />
                            </div>
                        )}

                        {cargando ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                                Cargando libros...
                            </div>
                        ) : libros.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500 mb-4">No hay libros todavía.</p>
                                <button
                                    onClick={() => { setLibroEditando(null); setMostrarFormLibro(true); }}
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                >
                                    + Crear el primero
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                {libros.map(libro => (
                                    <div key={libro.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-semibold flex-shrink-0">
                                                {libro.titulo.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{libro.titulo}</p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {libro.autor} · S/ {libro.precio} · Stock: {libro.stock}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button
                                                onClick={() => { setLibroEditando(libro); setMostrarFormLibro(true); }}
                                                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleBorrarLibro(libro.id)}
                                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* === CLIENTES === */}
                {tabActiva === 'clientes' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => { setClienteEditando(null); setMostrarFormCliente(true); }}
                                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                            >
                                + Agregar cliente
                            </button>
                        </div>

                        {mostrarFormCliente && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
                                <ClienteForm
                                    clienteInicial={clienteEditando || undefined}
                                    onGuardado={() => {
                                        setMostrarFormCliente(false);
                                        cargarClientes();
                                        mostrarToast(clienteEditando ? 'Cliente actualizado' : 'Cliente creado');
                                    }}
                                    onCancelar={() => setMostrarFormCliente(false)}
                                />
                            </div>
                        )}

                        {clientes.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500 mb-4">No hay clientes todavía.</p>
                                <button
                                    onClick={() => { setClienteEditando(null); setMostrarFormCliente(true); }}
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                >
                                    + Crear el primero
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                {clientes.map(cliente => (
                                    <div key={cliente.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
                                                {cliente.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{cliente.nombre}</p>
                                                <p className="text-sm text-gray-500 truncate">{cliente.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button
                                                onClick={() => { setClienteEditando(cliente); setMostrarFormCliente(true); }}
                                                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleBorrarCliente(cliente.id)}
                                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* === PEDIDOS === */}
                {tabActiva === 'pedidos' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => { setPedidoEditando(null); setMostrarFormPedido(true); }}
                                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                            >
                                + Agregar pedido
                            </button>
                        </div>

                        {mostrarFormPedido && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
                                <PedidoForm
                                    pedidoInicial={pedidoEditando || undefined}
                                    onGuardado={() => {
                                        setMostrarFormPedido(false);
                                        cargarPedidos();
                                        mostrarToast(pedidoEditando ? 'Pedido actualizado' : 'Pedido creado');
                                    }}
                                    onCancelar={() => setMostrarFormPedido(false)}
                                />
                            </div>
                        )}

                        {pedidos.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500 mb-4">No hay pedidos todavía.</p>
                                <button
                                    onClick={() => { setPedidoEditando(null); setMostrarFormPedido(true); }}
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                >
                                    + Crear el primero
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                {pedidos.map(pedido => (
                                    <div key={pedido.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-semibold flex-shrink-0">
                                                #{pedido.id}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {pedido.cliente_nombre}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {pedido.detalles.map(d => `${d.cantidad}x ${d.libro_titulo}`).join(' · ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button
                                                onClick={() => { setPedidoEditando(pedido); setMostrarFormPedido(true); }}
                                                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleBorrarPedido(pedido.id)}
                                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* TOAST */}
            {toast && (
                <Toast
                    mensaje={toast.mensaje}
                    tipo={toast.tipo}
                    onCerrar={() => setToast(null)}
                />
            )}
        </main>
    );
}