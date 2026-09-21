'use client';

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Resumen {
    total_libros: number;
    total_clientes: number;
    total_pedidos: number;
    stock_bajo: number;
}

interface LibroVendido {
    id: number;
    titulo: string;
    autor: string;
    vendidos: number;
}

interface ClienteFrecuente {
    id: number;
    nombre: string;
    pedidos: number;
}

interface Estadisticas {
    resumen: Resumen;
    libros_mas_vendidos: LibroVendido[];
    clientes_frecuentes: ClienteFrecuente[];
}

export default function Dashboard() {
    const [datos, setDatos] = useState<Estadisticas | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/estadisticas')
            .then(r => {
                if (!r.ok) throw new Error('Error al cargar estadísticas');
                return r.json();
            })
            .then(data => {
                setDatos(data);
                setCargando(false);
            })
            .catch(() => {
                setError('No se pudieron cargar las estadísticas');
                setCargando(false);
            });
    }, []);

    if (cargando) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                Cargando estadísticas...
            </div>
        );
    }

    if (error || !datos) {
        return (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error || 'Error desconocido'}
            </div>
        );
    }

    const tarjetas = [
        { label: 'Total libros', value: datos.resumen.total_libros, color: 'bg-blue-50 text-blue-700' },
        { label: 'Total clientes', value: datos.resumen.total_clientes, color: 'bg-green-50 text-green-700' },
        { label: 'Total pedidos', value: datos.resumen.total_pedidos, color: 'bg-amber-50 text-amber-700' },
        { label: 'Stock bajo', value: datos.resumen.stock_bajo, color: 'bg-red-50 text-red-700' },
    ];

    return (
        <div className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {tarjetas.map(t => (
                    <div key={t.label} className={`rounded-xl p-4 sm:p-5 ${t.color}`}>
                        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                            {t.label}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold mt-1">{t.value}</p>
                    </div>
                ))}
            </div>

            {/* Libros más vendidos */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Libros más vendidos
                </h3>
                {datos.libros_mas_vendidos.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                        Aún no hay ventas registradas. Crea pedidos con items para ver datos aquí.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datos.libros_mas_vendidos}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="titulo"
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                formatter={(value) => [`${value} vendidos`, 'Cantidad']}
                                labelFormatter={(label) => `Libro: ${label}`}
                            />
                            <Bar dataKey="vendidos" fill="#111827" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Clientes frecuentes */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Clientes con más pedidos
                </h3>
                {datos.clientes_frecuentes.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                        No hay clientes con pedidos todavía.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datos.clientes_frecuentes}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                formatter={(value) => [`${value} pedidos`, 'Cantidad']}
                            />
                            <Bar dataKey="pedidos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}