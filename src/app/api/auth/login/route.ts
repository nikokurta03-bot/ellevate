import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, verifyPassword, excludePassword } from '@/lib/helpers';

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

        // Return user without password
        return successResponse({
            user: excludePassword(user),
            message: 'Uspješna prijava',
        });
    } catch (error: any) {
        console.error('Error logging in:', error);
        return errorResponse(`Greška pri prijavi: ${error.message || 'Nepoznata greška'}`, 500);
    }
}
