import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
].filter(Boolean);

export function validateOrigin(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin');
    // Allow requests with no origin (same-origin, server-side, curl)
    if (!origin) return null;
    if (ALLOWED_ORIGINS.includes(origin)) return null;
    return NextResponse.json(
        { success: false, error: 'Forbidden: invalid origin' },
        { status: 403 }
    );
}
