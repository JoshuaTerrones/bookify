const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ recurso: string; formato: string }> }
) {
    const { recurso, formato } = await params;
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${API_URL}/api/exportar/${recurso}/${formato}/`, {
        headers: { cookie },
    });

    if (!res.ok) {
        return new Response('Error al exportar', { status: res.status });
    }

    const blob = await res.blob();
    const contentType = formato === 'csv' ? 'text/csv' : 'application/pdf';

    return new Response(blob, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${recurso}.${formato}"`,
        },
    });
}