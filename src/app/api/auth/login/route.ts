import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, verifyPassword, excludePassword } from '@/lib/helpers';
import { signToken, COOKIE_NAME } from '@/lib/auth';

// POST /api/auth/login - Prijava korisnika
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return errorResponse('Email i lozinka su obavezni');
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

