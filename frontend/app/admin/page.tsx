'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import LibroForm from '../components/LibroForm';
import ClienteForm from '../components/ClienteForm';
import PedidoForm from '../components/PedidoForm';
import UsuarioForm from '../components/UsuarioForm';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';

const ITEMS_POR_PAGINA = 15;

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

interface Usuario {
    id: number;
    username: string;
    email: string;
    rol: string;
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

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    const [cargando, setCargando] = useState(true);
    const [autenticado, setAutenticado] = useState<boolean | null>(null);
    const [rolUsuario, setRolUsuario] = useState<string>('');
    const [tabActiva, setTabActiva] = useState<'libros' | 'clientes' | 'pedidos' | 'usuarios'>('libros');
    const [toast, setToast] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);

    const [busquedaAdmin, setBusquedaAdmin] = useState('');
    const [paginaLibros, setPaginaLibros] = useState(1);
    const [paginaClientes, setPaginaClientes] = useState(1);
    const [paginaPedidos, setPaginaPedidos] = useState(1);
    const [paginaUsuarios, setPaginaUsuarios] = useState(1);

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');
    const [filtroStock, setFiltroStock] = useState<'todos' | 'disponibles' | 'agotados'>('todos');
    const [autorFiltro, setAutorFiltro] = useState('');

    const router = useRouter();

    // === PERMISOS POR ROL ===
    const esAdmin = rolUsuario === 'admin';
    const puedeEditar = rolUsuario === 'admin' || rolUsuario === 'editor';

    const cargarLibros = useCallback(() => {
        fetch('/api/libros')
            .then(r => r.json())
            .then(data => {
                setLibros(Array.isArray(data) ? data : []);
                setCargando(false);
            })
            .catch(() => {
                setLibros([]);
                setCargando(false);
            });
    }, []);

    const cargarClientes = useCallback(() => {
        fetch('/api/clientes')
            .then(r => r.json())
            .then(data => setClientes(Array.isArray(data) ? data : []))
            .catch(() => setClientes([]));
    }, []);

    const cargarPedidos = useCallback(() => {
        fetch('/api/pedidos')
            .then(r => r.json())
            .then(data => setPedidos(Array.isArray(data) ? data : []))
            .catch(() => setPedidos([]));
    }, []);

    const cargarUsuarios = useCallback(() => {
        fetch('/api/usuarios')
            .then(r => r.json())
            .then(data => setUsuarios(Array.isArray(data) ? data : []))
            .catch(() => setUsuarios([]));
    }, []);

    useEffect(() => {
        fetch('/api/me').then(r => r.json()).then(d => {
            if (!d.autenticado) {
                router.push('/login');
            } else {
                setAutenticado(true);
                setRolUsuario(d.rol || '');
                cargarLibros();
                cargarClientes();
                cargarPedidos();
                if (d.rol === 'admin') {
                    cargarUsuarios();
                }
            }
        });
    }, [router, cargarLibros, cargarClientes, cargarPedidos, cargarUsuarios]);

    useEffect(() => {
        setPaginaLibros(1);
        setPaginaClientes(1);
        setPaginaPedidos(1);
        setPaginaUsuarios(1);
    }, [busquedaAdmin, tabActiva, precioMin, precioMax, filtroStock, autorFiltro]);

    const autoresUnicos = useMemo(() => {
        const set = new Set(libros.map(l => l.autor));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [libros]);

    if (autenticado === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Verificando sesión...</p>
            </div>
        );
    }

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

    const handleBorrarUsuario = async (id: number, username: string) => {
        if (username === 'root') {
            mostrarToast('No se puede eliminar el usuario root', 'error');
            return;
        }
        if (!confirm(`¿Borrar el usuario "${username}"?`)) return;
        const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        if (res.ok) {
            cargarUsuarios();
            mostrarToast('Usuario eliminado correctamente');
        } else {
            mostrarToast('Error al eliminar el usuario', 'error');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    const filtrosActivos =
        (precioMin ? 1 : 0) +
        (precioMax ? 1 : 0) +
        (filtroStock !== 'todos' ? 1 : 0) +
        (autorFiltro ? 1 : 0);

    const limpiarFiltros = () => {
        setPrecioMin('');
        setPrecioMax('');
        setFiltroStock('todos');
        setAutorFiltro('');
    };

    const librosFiltrados = libros.filter(l => {
        const coincideBusqueda =
            l.titulo.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
            l.autor.toLowerCase().includes(busquedaAdmin.toLowerCase());

        const precio = parseFloat(l.precio);
        const coincideMin = !precioMin || precio >= parseFloat(precioMin);
        const coincideMax = !precioMax || precio <= parseFloat(precioMax);
        const coincideStock =
            filtroStock === 'todos' ||
            (filtroStock === 'disponibles' && l.stock > 0) ||
            (filtroStock === 'agotados' && l.stock === 0);
        const coincideAutor = !autorFiltro || l.autor === autorFiltro;

        return coincideBusqueda && coincideMin && coincideMax && coincideStock && coincideAutor;
    });

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
        c.email.toLowerCase().includes(busquedaAdmin.toLowerCase())
    );

    const pedidosFiltrados = pedidos.filter(p =>
        p.cliente_nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
        p.detalles.some(d => d.libro_titulo?.toLowerCase().includes(busquedaAdmin.toLowerCase()))
    );

    const usuariosFiltrados = usuarios.filter(u =>
        u.username.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
        u.email.toLowerCase().includes(busquedaAdmin.toLowerCase())
    );

    const librosDeLaPagina = librosFiltrados.slice(
        (paginaLibros - 1) * ITEMS_POR_PAGINA,
        paginaLibros * ITEMS_POR_PAGINA
    );
    const totalPaginasLibros = Math.ceil(librosFiltrados.length / ITEMS_POR_PAGINA);

    const clientesDeLaPagina = clientesFiltrados.slice(
        (paginaClientes - 1) * ITEMS_POR_PAGINA,
        paginaClientes * ITEMS_POR_PAGINA
    );
    const totalPaginasClientes = Math.ceil(clientesFiltrados.length / ITEMS_POR_PAGINA);

    const pedidosDeLaPagina = pedidosFiltrados.slice(
        (paginaPedidos - 1) * ITEMS_POR_PAGINA,
        paginaPedidos * ITEMS_POR_PAGINA
    );
    const totalPaginasPedidos = Math.ceil(pedidosFiltrados.length / ITEMS_POR_PAGINA);

    const usuariosDeLaPagina = usuariosFiltrados.slice(
        (paginaUsuarios - 1) * ITEMS_POR_PAGINA,
        paginaUsuarios * ITEMS_POR_PAGINA
    );
    const totalPaginasUsuarios = Math.ceil(usuariosFiltrados.length / ITEMS_POR_PAGINA);

    const tabs = [
        { id: 'libros' as const, label: 'Libros', count: libros.length },
        { id: 'clientes' as const, label: 'Clientes', count: clientes.length },
        { id: 'pedidos' as const, label: 'Pedidos', count: pedidos.length },
        ...(esAdmin
            ? [{ id: 'usuarios' as const, label: 'Usuarios', count: usuarios.length }]
            : []),
    ];

    const inputFiltroClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition";
    const labelFiltroClass = "block text-xs font-medium text-gray-600 mb-1.5";

    const rolBadge = (rol: string) => {
        const colores: Record<string, string> = {
            admin: 'bg-red-50 text-red-700',
            editor: 'bg-amber-50 text-amber-700',
            lector: 'bg-blue-50 text-blue-700',
            sin_rol: 'bg-gray-100 text-gray-600',
        };
        return colores[rol] || colores.sin_rol;
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg shrink-0">
                            B
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Bookify Admin</h1>
                            <p className="text-xs text-gray-500">
                                Panel de administración
                                {rolUsuario && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${rolBadge(rolUsuario)}`}>
                                        {rolUsuario}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-3">
                        <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                            Ver catálogo
                        </a>
                        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600 transition">
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* AVISO PARA LECTORES */}
                {rolUsuario === 'lector' && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-6">
                        Estás en modo <strong>lector</strong>. Puedes ver la información pero no modificarla.
                    </div>
                )}

                {/* TABS */}
                <div className="border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1 min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setTabActiva(tab.id)}
                                className={`px-3 sm:px-4 py-3 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
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

                {/* BUSCADOR Y FILTROS */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
                            placeholder={`Buscar en ${tabActiva}...`}
                            value={busquedaAdmin}
                            onChange={(e) => setBusquedaAdmin(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                        />
                    </div>

                    {tabActiva === 'libros' && (
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2 ${
                                mostrarFiltros || filtrosActivos > 0
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filtros
                            {filtrosActivos > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                    mostrarFiltros || filtrosActivos > 0 ? 'bg-white text-black' : 'bg-black text-white'
                                }`}>
                                    {filtrosActivos}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* PANEL DE FILTROS */}
                {tabActiva === 'libros' && mostrarFiltros && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label htmlFor="adminPrecioMin" className={labelFiltroClass}>
                                    Precio mínimo (S/)
                                </label>
                                <input
                                    id="adminPrecioMin"
                                    type="number"
                                    placeholder="0"
                                    value={precioMin}
                                    onChange={(e) => setPrecioMin(e.target.value)}
                                    className={inputFiltroClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="adminPrecioMax" className={labelFiltroClass}>
                                    Precio máximo (S/)
                                </label>
                                <input
                                    id="adminPrecioMax"
                                    type="number"
                                    placeholder="100"
                                    value={precioMax}
                                    onChange={(e) => setPrecioMax(e.target.value)}
                                    className={inputFiltroClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="adminAutorFiltro" className={labelFiltroClass}>
                                    Autor
                                </label>
                                <select
                                    id="adminAutorFiltro"
                                    value={autorFiltro}
                                    onChange={(e) => setAutorFiltro(e.target.value)}
                                    className={`${inputFiltroClass} bg-white`}
                                >
                                    <option value="">Todos los autores</option>
                                    {autoresUnicos.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="adminFiltroStock" className={labelFiltroClass}>
                                    Estado
                                </label>
                                <select
                                    id="adminFiltroStock"
                                    value={filtroStock}
                                    onChange={(e) => setFiltroStock(e.target.value as 'todos' | 'disponibles' | 'agotados')}
                                    className={`${inputFiltroClass} bg-white`}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="disponibles">Solo disponibles</option>
                                    <option value="agotados">Solo agotados</option>
                                </select>
                            </div>
                        </div>

                        {filtrosActivos > 0 && (
                            <button
                                onClick={limpiarFiltros}
                                className="text-sm text-gray-600 hover:text-black underline transition"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                {/* === LIBROS === */}
                {tabActiva === 'libros' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            {(busquedaAdmin || filtrosActivos > 0) && (
                                <p className="text-sm text-gray-500">
                                    {librosFiltrados.length} {librosFiltrados.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            )}
                            {puedeEditar && (
                                <div className="ml-auto">
                                    <button
                                        onClick={() => { setLibroEditando(null); setMostrarFormLibro(true); }}
                                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                    >
                                        + Agregar libro
                                    </button>
                                </div>
                            )}
                        </div>

                        {mostrarFormLibro && puedeEditar && (
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
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
                        ) : librosFiltrados.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500 mb-4">
                                    {busquedaAdmin || filtrosActivos > 0
                                        ? 'No hay libros que coincidan con la búsqueda o filtros.'
                                        : 'No hay libros todavía.'}
                                </p>
                                {(busquedaAdmin || filtrosActivos > 0) && (
                                    <button
                                        onClick={() => { setBusquedaAdmin(''); limpiarFiltros(); }}
                                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                    >
                                        Limpiar todo
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                    {librosDeLaPagina.map(libro => (
                                        <div key={libro.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group gap-2">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
                                            {(puedeEditar || esAdmin) && (
                                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    {puedeEditar && (
                                                        <button
                                                            onClick={() => { setLibroEditando(libro); setMostrarFormLibro(true); }}
                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {esAdmin && (
                                                        <button
                                                            onClick={() => handleBorrarLibro(libro.id)}
                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            Borrar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    paginaActual={paginaLibros}
                                    totalPaginas={totalPaginasLibros}
                                    onCambiarPagina={setPaginaLibros}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* === CLIENTES === */}
                {tabActiva === 'clientes' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            {busquedaAdmin && (
                                <p className="text-sm text-gray-500">
                                    {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            )}
                            {puedeEditar && (
                                <div className="ml-auto">
                                    <button
                                        onClick={() => { setClienteEditando(null); setMostrarFormCliente(true); }}
                                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                    >
                                        + Agregar cliente
                                    </button>
                                </div>
                            )}
                        </div>

                        {mostrarFormCliente && puedeEditar && (
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
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

                        {clientesFiltrados.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">
                                    {busquedaAdmin ? `No hay clientes para "${busquedaAdmin}".` : 'No hay clientes todavía.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                    {clientesDeLaPagina.map(cliente => (
                                        <div key={cliente.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group gap-2">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
                                                    {cliente.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{cliente.nombre}</p>
                                                    <p className="text-sm text-gray-500 truncate">{cliente.email}</p>
                                                </div>
                                            </div>
                                            {(puedeEditar || esAdmin) && (
                                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    {puedeEditar && (
                                                        <button
                                                            onClick={() => { setClienteEditando(cliente); setMostrarFormCliente(true); }}
                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {esAdmin && (
                                                        <button
                                                            onClick={() => handleBorrarCliente(cliente.id)}
                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            Borrar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    paginaActual={paginaClientes}
                                    totalPaginas={totalPaginasClientes}
                                    onCambiarPagina={setPaginaClientes}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* === PEDIDOS === */}
                {tabActiva === 'pedidos' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            {busquedaAdmin && (
                                <p className="text-sm text-gray-500">
                                    {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            )}
                            {puedeEditar && (
                                <div className="ml-auto">
                                    <button
                                        onClick={() => { setPedidoEditando(null); setMostrarFormPedido(true); }}
                                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                    >
                                        + Agregar pedido
                                    </button>
                                </div>
                            )}
                        </div>

                        {mostrarFormPedido && puedeEditar && (
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
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

                        {pedidosFiltrados.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">
                                    {busquedaAdmin ? `No hay pedidos para "${busquedaAdmin}".` : 'No hay pedidos todavía.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                    {pedidosDeLaPagina.map(pedido => (
                                        <div key={pedido.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group gap-2">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
                                            {(puedeEditar || esAdmin) && (
                                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    {puedeEditar && (
                                                        <button
                                                            onClick={() => { setPedidoEditando(pedido); setMostrarFormPedido(true); }}
                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {esAdmin && (
                                                        <button
                                                            onClick={() => handleBorrarPedido(pedido.id)}
                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            Borrar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    paginaActual={paginaPedidos}
                                    totalPaginas={totalPaginasPedidos}
                                    onCambiarPagina={setPaginaPedidos}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* === USUARIOS === */}
                {tabActiva === 'usuarios' && esAdmin && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            {busquedaAdmin && (
                                <p className="text-sm text-gray-500">
                                    {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            )}
                            <div className="ml-auto">
                                <button
                                    onClick={() => { setUsuarioEditando(null); setMostrarFormUsuario(true); }}
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                >
                                    + Agregar usuario
                                </button>
                            </div>
                        </div>

                        {mostrarFormUsuario && (
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
                                <UsuarioForm
                                    usuarioInicial={usuarioEditando || undefined}
                                    onGuardado={() => {
                                        setMostrarFormUsuario(false);
                                        cargarUsuarios();
                                        mostrarToast(usuarioEditando ? 'Usuario actualizado' : 'Usuario creado');
                                    }}
                                    onCancelar={() => setMostrarFormUsuario(false)}
                                />
                            </div>
                        )}

                        {usuariosFiltrados.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">
                                    {busquedaAdmin ? `No hay usuarios para "${busquedaAdmin}".` : 'No hay usuarios todavía.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                    {usuariosDeLaPagina.map(usuario => (
                                        <div key={usuario.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group gap-2">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold flex-shrink-0">
                                                    {usuario.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {usuario.username}
                                                        {usuario.username === 'root' && (
                                                            <span className="ml-2 text-xs text-gray-400">(superusuario)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${rolBadge(usuario.rol)}`}>
                                                    {usuario.rol}
                                                </span>
                                                <button
                                                    onClick={() => { setUsuarioEditando(usuario); setMostrarFormUsuario(true); }}
                                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                                >
                                                    Editar
                                                </button>
                                                {usuario.username !== 'root' && (
                                                    <button
                                                        onClick={() => handleBorrarUsuario(usuario.id, usuario.username)}
                                                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        Borrar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    paginaActual={paginaUsuarios}
                                    totalPaginas={totalPaginasUsuarios}
                                    onCambiarPagina={setPaginaUsuarios}
                                />
                            </>
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