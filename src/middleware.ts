import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'ellevate_token';

const secret = process.env.JWT_SECRET;
const JWT_SECRET = secret ? new TextEncoder().encode(secret) : null;

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin and /dashboard routes
    const isAdmin = pathname.startsWith('/admin');
    const isDashboard = pathname.startsWith('/dashboard');
    if (!isAdmin && !isDashboard) return NextResponse.next();

    if (!JWT_SECRET) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        // Admin trying to access dashboard → redirect to admin
        if (isDashboard && role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        // Non-admin trying to access admin → redirect to dashboard
        if (isAdmin && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*'],
};
