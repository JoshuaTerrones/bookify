'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        setCargando(false);

        if (data.ok) {
            router.push('/admin');
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white font-bold text-2xl mb-4">
                        B
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Bookify Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4"
                >
                    <div>
                        <label className={labelClass}>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="tu-usuario"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className={inputClass}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    <a href="/" className="hover:text-gray-600 transition">
                        ← Volver al catálogo
                    </a>
                </p>
            </div>
        </main>
    );
}