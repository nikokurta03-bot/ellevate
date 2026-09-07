import { NextRequest, NextResponse } from 'next/server';
import { validateOrigin } from '@/lib/csrf';
import { parseVital } from '@/lib/web-vitals';

export async function POST(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    // Bound even chunked requests, not just the Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 512) {
            await reader.cancel();
            return new NextResponse(null, { status: 413 });
        }
        chunks.push(value);
    }
    try {
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        const vital = parseVital(JSON.parse(new TextDecoder().decode(bytes)));
        if (!vital) return new NextResponse(null, { status: 400 });
        console.info('web-vitals', JSON.stringify(vital));
        return new NextResponse(null, { status: 204 });
    } catch {
        return new NextResponse(null, { status: 400 });
    }
}
