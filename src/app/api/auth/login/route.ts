import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, verifyPassword, excludePassword } from '@/lib/helpers';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';

// In-memory rate limiting
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(email: string): boolean {
    const now = Date.now();
    const record = loginAttempts.get(email);
    if (!record) {
        loginAttempts.set(email, { count: 1, firstAttempt: now });
        return false;
    }
    if (now - record.firstAttempt > WINDOW_MS) {
        loginAttempts.set(email, { count: 1, firstAttempt: now });
        return false;
    }
    record.count++;
    return record.count > MAX_ATTEMPTS;
}

// POST /api/auth/login - Prijava korisnika
export async function POST(request: NextRequest) {
    try {
        const originError = validateOrigin(request);
        if (originError) return originError;

        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return errorResponse('Email i lozinka su obavezni');
        }

        if (isRateLimited(email)) {
            return NextResponse.json(
                { success: false, error: 'Previše pokušaja prijave. Pokušajte ponovno za 15 minuta.' },
                { status: 429 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse('Pogrešan email ili lozinka', 401);
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return errorResponse('Pogrešan email ili lozinka', 401);
        }

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
        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('Error logging in:', error);
        return errorResponse(`Greška pri prijavi: ${error.message || 'Nepoznata greška'}`, 500);
    }
}

