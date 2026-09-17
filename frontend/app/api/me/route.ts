export async function GET(req: Request) {
    const cookie = req.headers.get('cookie') || '';
    const res = await fetch('http://127.0.0.1:8000/api/me/', {
        headers: { cookie },
    });
    const data = await res.json();
    return Response.json(data);
}