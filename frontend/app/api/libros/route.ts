export async function GET() {
    const res = await fetch('http://127.0.0.1:8000/api/libros/', { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch('http://127.0.0.1:8000/api/libros/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
}