const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');

    const response = Response.json(data);
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
}