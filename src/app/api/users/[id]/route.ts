import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { excludePassword, errorResponse, successResponse, hashPassword, validateOIB } from '@/lib/helpers';
import { UpdateUserInput } from '@/types';

// GET /api/users/[id] - Dohvati jednog korisnika
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

// PUT /api/users/[id] - Ažuriraj korisnika
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Validate email if changed
        if (body.email && body.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: body.email },
            });
            if (emailExists) {
                return errorResponse('Email adresa je već u upotrebi');
            }
        }

        // Validate OIB if changed
        if (body.oib && body.oib !== existingUser.oib) {
            if (!validateOIB(body.oib)) {
                return errorResponse('OIB nije ispravan');
            }
            const oibExists = await prisma.user.findFirst({
                where: { oib: body.oib },
            });
            if (oibExists) {
                return errorResponse('OIB je već u upotrebi');
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (body.email) updateData.email = body.email;
        if (body.firstName) updateData.firstName = body.firstName;
        if (body.lastName) updateData.lastName = body.lastName;
        if (body.oib) updateData.oib = body.oib;
        if (body.address !== undefined) updateData.address = body.address || null;
        if (body.dateOfBirth !== undefined) {
            updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
        }
        if (body.heightCm !== undefined) updateData.heightCm = body.heightCm || null;
        if (body.weightKg !== undefined) updateData.weightKg = body.weightKg || null;
        if (body.characteristics !== undefined) {
            updateData.characteristics = body.characteristics || null;
        }
        if (body.role) updateData.role = body.role;
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

// DELETE /api/users/[id] - Obriši korisnika
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
