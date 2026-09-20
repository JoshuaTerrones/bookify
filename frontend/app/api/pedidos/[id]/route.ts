const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${API_URL}/api/pedidos/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookie = req.headers.get('cookie') || '';

    await fetch(`${API_URL}/api/pedidos/${id}/`, {
        method: 'DELETE',
        headers: { cookie },
    });
    return Response.json({ ok: true });
}