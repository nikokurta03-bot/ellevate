import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, sessionCookieOptions } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';

// POST /api/auth/logout - Odjava korisnika
export async function POST(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const response = NextResponse.json(
        { success: true, data: { message: 'Uspješna odjava' } },
        { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set(COOKIE_NAME, '', sessionCookieOptions(0));

    return response;
}
