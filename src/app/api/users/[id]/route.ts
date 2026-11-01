import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { excludePassword, errorResponse, successResponse, hashPassword, validateOIB, normalizeEmail, parseOptionalIsoDate, optionalPositiveNumber } from '@/lib/helpers';
import { requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { studioDateKey } from '@/lib/booking-time';
import { parseMembershipPaidOn } from '@/lib/membership';
import { UpdateUserInput } from '@/types';

// GET /api/users/[id] - Dohvati jednog korisnika (admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin(request);
    if (error) return error;

    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return errorResponse('Neispravan ID korisnika');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                reservations: {
                    where: { status: 'active' },
                    include: {
                        slot: true,
                    },
                    orderBy: { slot: { date: 'asc' } },
                },
            },
        });

        if (!user) {
            return errorResponse('Korisnik nije pronađen', 404);
        }

        return successResponse(excludePassword(user));
    } catch (error) {
        console.error('Error fetching user:', error);
        return errorResponse('Greška pri dohvaćanju korisnika', 500);
    }
}

// PUT /api/users/[id] - Ažuriraj korisnika (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error } = await requireAdmin(request);
    if (error) return error;

    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return errorResponse('Neispravan ID korisnika');
        }

        const body: UpdateUserInput = await request.json();

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return errorResponse('Korisnik nije pronađen', 404);
        }

        // Prepare update data
        const updateData: Prisma.UserUpdateInput = {};

        // Login compares the normalized address, so mixed case must be stored lowercase.
        if (body.email !== undefined) {
            const email = normalizeEmail(body.email);
            if (!email) return errorResponse('Email adresa nije ispravna');
            if (email !== existingUser.email) {
                const emailExists = await prisma.user.findFirst({
                    where: { id: { not: userId }, email: { equals: email, mode: 'insensitive' } },
                });
                if (emailExists) {
                    return errorResponse('Email adresa je već u upotrebi');
                }
                updateData.email = email;
            }
        }

        // Validate OIB if changed
        if (body.oib && body.oib !== existingUser.oib) {
            if (!validateOIB(body.oib)) {
                return errorResponse('OIB nije ispravan');
            }
            const oibExists = await prisma.user.findFirst({
                where: { oib: body.oib, NOT: { id: userId } },
            });
            if (oibExists) {
                return errorResponse('OIB je već u upotrebi');
            }
        }

        if (body.firstName) updateData.firstName = body.firstName;
        if (body.lastName) updateData.lastName = body.lastName;
        if (body.oib) updateData.oib = body.oib;
        if (body.address !== undefined) updateData.address = body.address || null;
        if (body.dateOfBirth !== undefined) {
            const parsedBirth = parseOptionalIsoDate(body.dateOfBirth);
            if ('error' in parsedBirth) return errorResponse('Datum rođenja nije ispravan.');
            updateData.dateOfBirth = parsedBirth.date;
        }
        if (body.heightCm !== undefined) updateData.heightCm = optionalPositiveNumber(body.heightCm, true);
        if (body.weightKg !== undefined) updateData.weightKg = optionalPositiveNumber(body.weightKg, false);
        if (body.characteristics !== undefined) {
            updateData.characteristics = body.characteristics || null;
        }
        if (body.role) {
            if (body.role !== 'admin' && body.role !== 'user') return errorResponse('Uloga nije ispravna');
            if (body.role !== 'admin' && existingUser.role === 'admin') {
                const otherAdmins = await prisma.user.count({ where: { role: 'admin', NOT: { id: userId } } });
                if (otherAdmins === 0) return errorResponse('Ne možete ukloniti jedinog administratora');
            }
            updateData.role = body.role;
        }
        if ('membershipPaidOn' in body) {
            const parsed = parseMembershipPaidOn(body.membershipPaidOn, studioDateKey());
            if ('error' in parsed) return errorResponse(parsed.error);
            updateData.membershipPaidOn = parsed.date;
        }
        if (body.password) {
            updateData.password = await hashPassword(body.password);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return successResponse(excludePassword(user));
    } catch (error) {
        console.error('Error updating user:', error);
        return errorResponse('Greška pri ažuriranju korisnika', 500);
    }
}

// DELETE /api/users/[id] - Obriši korisnika (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error } = await requireAdmin(request);
    if (error) return error;

    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return errorResponse('Neispravan ID korisnika');
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return errorResponse('Korisnik nije pronađen', 404);
        }

        if (existingUser.role === 'admin') {
            const otherAdmins = await prisma.user.count({ where: { role: 'admin', NOT: { id: userId } } });
            if (otherAdmins === 0) return errorResponse('Ne možete obrisati jedinog administratora');
        }

        // Delete user (cascade will delete reservations)
        await prisma.user.delete({
            where: { id: userId },
        });

        return successResponse({ message: 'Korisnik uspješno obrisan' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return errorResponse('Greška pri brisanju korisnika', 500);
    }
}
