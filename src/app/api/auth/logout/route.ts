import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

// POST /api/auth/logout - Odjava korisnika
export async function POST() {
    const response = NextResponse.json(
        { success: true, data: { message: 'Uspješna odjava' } },
        { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return response;
}
