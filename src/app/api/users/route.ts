import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { excludePassword, errorResponse, successResponse, hashPassword, validateOIB, normalizeEmail, parseOptionalIsoDate, optionalPositiveNumber } from '@/lib/helpers';
import { requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { studioDateKey } from '@/lib/booking-time';
import { parseMembershipPaidOn } from '@/lib/membership';
import { CreateUserInput } from '@/types';

// GET /api/users - Dohvati sve korisnike (admin only)
export async function GET(request: NextRequest) {
    const { error } = await requireAdmin(request);
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        const where: Prisma.UserWhereInput = {};

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { oib: { contains: search } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        const usersWithoutPassword = users.map(excludePassword);

        return successResponse(usersWithoutPassword);
    } catch (error) {
        console.error('Error fetching users:', error);
        return errorResponse('Greška pri dohvaćanju korisnika', 500);
    }
}

// POST /api/users - Kreiraj novog korisnika (admin only)
export async function POST(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error } = await requireAdmin(request);
    if (error) return error;

    try {
        const body: CreateUserInput = await request.json();

        const email = normalizeEmail(body.email);
        const role = body.role || 'user';

        // Validate required fields (OIB is now optional)
        if (!email || !body.password || !body.firstName || !body.lastName) {
            return errorResponse('Sva obavezna polja moraju biti popunjena');
        }
        if (role !== 'admin' && role !== 'user') {
            return errorResponse('Uloga nije ispravna');
        }

        // Validate OIB only if provided
        if (body.oib) {
            if (!validateOIB(body.oib)) {
                return errorResponse('OIB nije ispravan');
            }

            // Check if OIB already exists
            const existingOIB = await prisma.user.findFirst({
                where: { oib: body.oib },
            });
            if (existingOIB) {
                return errorResponse('Korisnik s ovim OIB-om već postoji');
            }
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        });
        if (existingEmail) {
            return errorResponse('Korisnik s ovom email adresom već postoji');
        }

        let membershipPaidOn: Date | null = null;
        if ('membershipPaidOn' in body) {
            const parsed = parseMembershipPaidOn(body.membershipPaidOn, studioDateKey());
            if ('error' in parsed) return errorResponse(parsed.error);
            membershipPaidOn = parsed.date;
        }

        let dateOfBirth: Date | null = null;
        if (body.dateOfBirth) {
            const parsedBirth = parseOptionalIsoDate(body.dateOfBirth);
            if ('error' in parsedBirth) return errorResponse('Datum rođenja nije ispravan.');
            dateOfBirth = parsedBirth.date;
        }

        // Hash password
        const hashedPassword = await hashPassword(body.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: body.firstName,
                lastName: body.lastName,
                oib: body.oib || '',
                address: body.address || null,
                dateOfBirth,
                heightCm: optionalPositiveNumber(body.heightCm, true),
                weightKg: optionalPositiveNumber(body.weightKg, false),
                characteristics: body.characteristics || null,
                role,
                membershipPaidOn,
            },
        });

        return successResponse(excludePassword(user), 201);
    } catch (error) {
        console.error('Error creating user:', error);
        return errorResponse('Greška pri kreiranju korisnika', 500);
    }
}
