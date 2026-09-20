const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET() {
    const res = await fetch(`${API_URL}/api/pedidos/`, { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${API_URL}/api/pedidos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
}