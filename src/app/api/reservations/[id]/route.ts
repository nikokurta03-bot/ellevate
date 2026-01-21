import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, canCancelReservation } from '@/lib/helpers';

// DELETE /api/reservations/[id] - Otkaži rezervaciju
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const reservationId = parseInt(id);

        if (isNaN(reservationId)) {
            return errorResponse('Neispravan ID rezervacije');
        }

        // Check if reservation exists
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { slot: true },
        });

        if (!reservation) {
            return errorResponse('Rezervacija nije pronađena', 404);
        }

        if (reservation.status === 'cancelled') {
            return errorResponse('Rezervacija je već otkazana');
        }

        // Check if cancellation is allowed (1 hour before)
        if (!canCancelReservation(reservation.slot.date, reservation.slot.startTime)) {
            return errorResponse('Nije moguće otkazati rezervaciju manje od 1 sat prije početka termina');
        }

        // Cancel reservation
        const updatedReservation = await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
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

        return successResponse({
            message: 'Rezervacija uspješno otkazana',
            reservation: updatedReservation,
        });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return errorResponse('Greška pri otkazivanju rezervacije', 500);
    }
}

// GET /api/reservations/[id] - Dohvati jednu rezervaciju
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const reservationId = parseInt(id);

        if (isNaN(reservationId)) {
            return errorResponse('Neispravan ID rezervacije');
        }

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
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

        if (!reservation) {
            return errorResponse('Rezervacija nije pronađena', 404);
        }

        return successResponse(reservation);
    } catch (error) {
        console.error('Error fetching reservation:', error);
        return errorResponse('Greška pri dohvaćanju rezervacije', 500);
    }
}
