const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
    const cookie = req.headers.get('cookie') || '';
    await fetch(`${API_URL}/api/logout/`, {
        method: 'POST',
        headers: { cookie },
    });
    return Response.json({ ok: true });
}