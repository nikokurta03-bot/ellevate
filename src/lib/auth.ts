import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { errorResponse } from './helpers';
import { prisma } from './prisma';

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is required');
    return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'ellevate_token';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge,
    };
}

type SessionPayload = {
    userId: number;
    role: string;
};

// Sign a JWT token
export async function signToken(userId: number, role: string): Promise<string> {
    return new SignJWT({ userId, role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getJwtSecret());
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

// Get session from request cookie
export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

// Require authentication - returns session or 401 error response
export async function requireAuth(request: NextRequest) {
    const session = await getSession(request);
    if (!session) {
        return { error: errorResponse('Niste prijavljeni', 401), session: null };
    }
    return { error: null, session };
}

// Require admin role - returns session or 401/403 error response.
// The database role wins over the JWT so a demoted or deleted admin loses access immediately.
export async function requireAdmin(request: NextRequest) {
    const { error, session } = await requireAuth(request);
    if (error || !session) return { error, session: null };
    const userId = Number(session.userId);
    if (!Number.isSafeInteger(userId)) {
        return { error: errorResponse('Niste prijavljeni', 401), session: null };
    }
    let administrator: { role: string } | null;
    try {
        administrator = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    } catch (cause) {
        console.error('Admin role check failed', cause);
        return { error: errorResponse('Greška pri provjeri ovlasti', 500), session: null };
    }
    if (administrator?.role !== 'admin') {
        return { error: errorResponse('Nemate administratorska prava', 403), session: null };
    }
    return { error: null, session: { userId, role: administrator.role } };
}

export { COOKIE_NAME };
