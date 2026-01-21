import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, isSlotFull, canCancelReservation } from '@/lib/helpers';

// GET /api/reservations - Dohvati rezervacije
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const slotId = searchParams.get('slotId');
        const status = searchParams.get('status');

        const where: any = {};

        if (userId) where.userId = parseInt(userId);
        if (slotId) where.slotId = parseInt(slotId);
        if (status) where.status = status;

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                slot: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return errorResponse('Greška pri dohvaćanju rezervacija', 500);
    }
}

// POST /api/reservations - Kreiraj rezervaciju
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, slotId } = body;

        if (!userId || !slotId) {
            return errorResponse('userId i slotId su obavezni');
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return errorResponse('Korisnik nije pronađen', 404);
        }

        // Check if slot exists
        const slot = await prisma.trainingSlot.findUnique({
            where: { id: slotId },
        });
        if (!slot) {
            return errorResponse('Termin nije pronađen', 404);
        }

        // Check if slot is in the past
        const now = new Date();
        const slotDateTime = new Date(slot.date);
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);

        if (slotDateTime < now) {
            return errorResponse('Ne možete rezervirati termin koji je već prošao');
        }

        // Check if slot is full
        if (await isSlotFull(slotId)) {
            return errorResponse('Termin je popunjen');
        }

        // Check if user already has a reservation for this slot
        const existingReservation = await prisma.reservation.findUnique({
            where: {
                userId_slotId: {
                    userId,
                    slotId,
                },
            },
        });
        if (existingReservation && existingReservation.status === 'active') {
            return errorResponse('Već imate rezervaciju za ovaj termin');
        }

        // Create or reactivate reservation
        let reservation;
        if (existingReservation) {
            reservation = await prisma.reservation.update({
                where: { id: existingReservation.id },
                data: {
                    status: 'active',
                    cancelledAt: null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    slot: true,
                },
            });
        } else {
            reservation = await prisma.reservation.create({
                data: {
                    userId,
                    slotId,
                    status: 'active',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    slot: true,
                },
            });
        }

        return successResponse(reservation, 201);
    } catch (error) {
        console.error('Error creating reservation:', error);
        return errorResponse('Greška pri kreiranju rezervacije', 500);
    }
}
