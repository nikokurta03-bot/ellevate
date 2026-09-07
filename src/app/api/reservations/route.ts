import { Prisma } from '@prisma/client';
import { bookTraining, BookingError } from '@/lib/booking-service';
import { NextRequest, after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/helpers';
import { requireAuth } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { sendBookingNotification } from '@/lib/email';

export const maxDuration = 30;

// GET /api/reservations - Dohvati rezervacije (requires auth)
export async function GET(request: NextRequest) {
    const { error, session } = await requireAuth(request);
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const slotId = searchParams.get('slotId');
        const status = searchParams.get('status');

        const where: Prisma.ReservationWhereInput = {};

        // If not admin, can only see own reservations
        if (session!.role !== 'admin') {
            where.userId = session!.userId;
        } else if (userId) {
            where.userId = parseInt(userId);
        }
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

// POST /api/reservations - Kreiraj rezervaciju (requires auth)
export async function POST(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error, session } = await requireAuth(request);
    if (error) return error;

    try {
        const body = await request.json();
        const { userId, slotId } = body;

        // If not admin, can only create for self
        if (session!.role !== 'admin' && userId !== session!.userId) {
            return errorResponse('Možete kreirati rezervacije samo za sebe', 403);
        }

        if (!Number.isSafeInteger(userId) || userId <= 0 || !Number.isSafeInteger(slotId) || slotId <= 0) {
            return errorResponse('userId i slotId moraju biti pozitivni cijeli brojevi');
        }
        const reservation = await bookTraining(prisma, userId, slotId);

        // Keep notification work alive after the response on Vercel.
        const userName = `${reservation.user.firstName} ${reservation.user.lastName}`;
        const slotTime = `${reservation.slot.startTime} - ${reservation.slot.endTime}`;
        after(() => sendBookingNotification(userName, reservation.slot.date, slotTime));

        return successResponse(reservation, 201);
    } catch (error) {
        if (error instanceof BookingError) return errorResponse(error.message, error.status);
        console.error('Error creating reservation:', error);
        return errorResponse('Greška pri kreiranju rezervacije', 500);
    }
}
