const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${API_URL}/api/usuarios/`, {
        cache: 'no-store',
        headers: { cookie },
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
}

export async function POST(req: Request) {
    const body = await req.json();
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${API_URL}/api/usuarios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
}