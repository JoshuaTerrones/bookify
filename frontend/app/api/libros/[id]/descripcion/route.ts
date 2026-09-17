const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const libroRes = await fetch(`${API_URL}/api/libros/${id}/`);
    const libro = await libroRes.json();
    if (!libro.obra_key) return Response.json({ descripcion: null });

    const res = await fetch(`https://openlibrary.org${libro.obra_key}.json`);
    const data = await res.json();
    const descripcion = typeof data.description === 'string' ? data.description : data.description?.value || null;
    return Response.json({ descripcion });
}