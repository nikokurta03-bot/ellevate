import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { errorResponse } from './helpers';

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is required');
    return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'ellevate_token';

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

// Require admin role - returns session or 401/403 error response
export async function requireAdmin(request: NextRequest) {
    const { error, session } = await requireAuth(request);
    if (error) return { error, session: null };
    if (session!.role !== 'admin') {
        return { error: errorResponse('Nemate administratorska prava', 403), session: null };
    }
    return { error: null, session };
}

export { COOKIE_NAME };
