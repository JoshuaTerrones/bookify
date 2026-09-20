'use client';

interface PaginationProps {
    paginaActual: number;
    totalPaginas: number;
    onCambiarPagina: (pagina: number) => void;
}

export default function Pagination({ paginaActual, totalPaginas, onCambiarPagina }: PaginationProps) {
    if (totalPaginas <= 1) return null;

    const generarPaginas = () => {
        const paginas: number[] = [];
        const max = 5;
        let inicio = Math.max(1, paginaActual - Math.floor(max / 2));
        let fin = Math.min(totalPaginas, inicio + max - 1);
        if (fin - inicio + 1 < max) {
            inicio = Math.max(1, fin - max + 1);
        }
        for (let i = inicio; i <= fin; i++) paginas.push(i);
        return paginas;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                ← Anterior
            </button>

            {generarPaginas().map(num => (
                <button
                    key={num}
                    onClick={() => onCambiarPagina(num)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition ${
                        paginaActual === num
                            ? 'bg-black text-white'
                            : 'text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                    {num}
                </button>
            ))}

            <button
                onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                Siguiente →
            </button>
        </div>
    );
}