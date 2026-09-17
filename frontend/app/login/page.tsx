'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.ok) {
            router.push('/admin');
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 text-black rounded-xl shadow-sm w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 ">Iniciar sesión</h1>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg mb-3"
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg mb-4"
                />
                <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-lg">
                    Entrar
                </button>
            </form>
        </main>
    );
}