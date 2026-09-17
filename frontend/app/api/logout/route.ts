export async function POST(req: Request) {
    const cookie = req.headers.get('cookie') || '';
    await fetch('http://127.0.0.1:8000/api/logout/', {
        method: 'POST',
        headers: { cookie },
    });
    return Response.json({ ok: true });
}