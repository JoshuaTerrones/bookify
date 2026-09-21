'use client';

import { useState } from 'react';

interface UsuarioFormProps {
    usuarioInicial?: {
        id?: number;
        username: string;
        email: string;
        rol: string;
    };
    onGuardado: () => void;
    onCancelar: () => void;
}

export default function UsuarioForm({ usuarioInicial, onGuardado, onCancelar }: UsuarioFormProps) {
    const [username, setUsername] = useState(usuarioInicial?.username || '');
    const [email, setEmail] = useState(usuarioInicial?.email || '');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState(usuarioInicial?.rol || 'lector');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!usuarioInicial?.id && !password) {
            setError('La contraseña es obligatoria al crear un usuario');
            return;
        }

        setGuardando(true);

        const body: any = {
            username,
            email,
            grupos: [rol],
        };

        if (password) {
            body.password = password;
        }

        const url = usuarioInicial?.id ? `/api/usuarios/${usuarioInicial.id}` : '/api/usuarios';
        const method = usuarioInicial?.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        setGuardando(false);

        if (!res.ok) {
            try {
                const data = await res.json();
                let mensaje = 'Error al guardar el usuario';
                if (typeof data === 'string') mensaje = data;
                else if (Array.isArray(data)) mensaje = data.join(', ');
                else if (typeof data === 'object') mensaje = Object.values(data).flat().join('\n');
                setError(mensaje);
            } catch {
                setError('Error al guardar el usuario');
            }
            return;
        }

        onGuardado();
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
    <div>
        <label htmlFor="username" className={labelClass}>Nombre de usuario</label>
    <input
    id="username"
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
    placeholder="Ej. juanperez"
    className={inputClass}
    />
    </div>

    <div>
    <label htmlFor="email" className={labelClass}>Email</label>
        <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    placeholder="Ej. juan@example.com"
    className={inputClass}
    />
    </div>

    <div>
    <label htmlFor="password" className={labelClass}>
        Contraseña {usuarioInicial?.id && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
    </label>
    <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={usuarioInicial?.id ? '••••••••' : 'Contraseña'}
        className={inputClass}
        />
        </div>

        <div>
        <label htmlFor="rol" className={labelClass}>Rol</label>
            <select
        id="rol"
        value={rol}
        onChange={(e) => setRol(e.target.value)}
        className={`${inputClass} bg-white`}
    >
        <option value="admin">Admin — puede todo</option>
        <option value="editor">Editor — puede crear y editar, no borrar</option>
        <option value="lector">Lector — solo puede ver</option>
        </select>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
                </div>
        )}

        <div className="flex gap-3 pt-2">
        <button
            type="submit"
        disabled={guardando}
        className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
            {guardando ? 'Guardando...' : (usuarioInicial?.id ? 'Guardar cambios' : 'Crear usuario')}
            </button>
            <button
        type="button"
        onClick={onCancelar}
        className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
            >
            Cancelar
            </button>
            </div>
            </form>
    );
    }