import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, verifyPassword, excludePassword, normalizeEmail } from '@/lib/helpers';
import { signToken, COOKIE_NAME, sessionCookieOptions } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';

// In-memory rate limiting
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 20;
const MAX_IP_ATTEMPTS = 60;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = loginAttempts.get(key);
    const limit = key.startsWith('ip:') ? MAX_IP_ATTEMPTS : MAX_ATTEMPTS;
    if (!record) return false;
    if (now - record.firstAttempt > WINDOW_MS) {
        loginAttempts.delete(key);
        return false;
    }
    return record.count >= limit;
}

function recordFailedAttempt(email: string) {
    const now = Date.now();
    const record = loginAttempts.get(email);
    if (!record || now - record.firstAttempt > WINDOW_MS) {
        loginAttempts.set(email, { count: 1, firstAttempt: now });
    } else {
        record.count++;
    }
}

function clearRateLimit(email: string) {
    loginAttempts.delete(email);
}

// POST /api/auth/login - Prijava korisnika
export async function POST(request: NextRequest) {
    try {
        const originError = validateOrigin(request);
        if (originError) return originError;

        const body = await request.json();
        const email = normalizeEmail(body.email);
        const password = typeof body.password === 'string' ? body.password : '';
        const ipKey = `ip:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'}`;

        if (!email || !password) {
            return errorResponse('Email i lozinka su obavezni');
        }

        if (isRateLimited(ipKey) || isRateLimited(email)) {
            return NextResponse.json(
                { success: false, error: 'Previše pokušaja prijave. Pokušajte ponovno za 15 minuta.' },
                { status: 429 }
            );
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        });

        if (!user) {
            recordFailedAttempt(ipKey);
            recordFailedAttempt(email);
            return errorResponse('Pogrešan email ili lozinka', 401);
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            recordFailedAttempt(ipKey);
            recordFailedAttempt(email);
            return errorResponse('Pogrešan email ili lozinka', 401);
        }

        // Reset rate limit on successful login
        clearRateLimit(ipKey);
        clearRateLimit(email);

        // Sign JWT token
        const token = await signToken(user.id, user.role);

        // Build response with cookie
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    user: excludePassword(user),
                    message: 'Uspješna prijava',
                },
            },
            { status: 200 }
        );

        // Set HTTP-only cookie
        response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());

        return response;
    } catch (error) {
        console.error('Error logging in:', error);
        return errorResponse('Greška pri prijavi. Pokušajte ponovno.', 500);
    }
}

