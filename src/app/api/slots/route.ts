import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/helpers';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { dateKey, validDate, weekDates } from '@/lib/schedule';
import { generateWeek } from '@/lib/schedule-db';

// GET /api/slots - Dohvati termine (requires auth)
export async function GET(request: NextRequest) {
    const { error } = await requireAuth(request);
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const weekOffset = Number(searchParams.get('week') || 0);
        const date = searchParams.get('date');
        if (!Number.isInteger(weekOffset) || Math.abs(weekOffset) > 520 || (date !== null && !validDate(date))) {
            return errorResponse('Neispravan datum ili tjedan');
        }
        const dates = date ? [date, date] : weekDates(weekOffset);
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        endDate.setUTCHours(23, 59, 59, 999);
        const closedDays = new Set((await prisma.scheduleDay.findMany({
            where: { date: { gte: startDate, lte: endDate }, isClosed: true },
        })).map(day => dateKey(day.date)));

        const slots = await prisma.trainingSlot.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                _count: {
                    select: {
                        reservations: {
                            where: { status: 'active' },
                        },
                    },
                },
                reservations: {
                    where: { status: 'active' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });

        // Transform to include availability info
        const slotsWithAvailability = slots.map((slot) => ({
            ...slot,
            isClosed: closedDays.has(dateKey(slot.date)),
            currentCount: slot._count.reservations,
            isFull: slot._count.reservations >= slot.maxCapacity,
            availableSpots: closedDays.has(dateKey(slot.date)) ? 0 : Math.max(0, slot.maxCapacity - slot._count.reservations),
        }));

        return successResponse(slotsWithAvailability);
    } catch (error) {
        console.error('Error fetching slots:', error);
        return errorResponse('Greška pri dohvaćanju termina', 500);
    }
}

// POST /api/slots - Generiraj termine za tjedan (admin only)
export async function POST(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error } = await requireAdmin(request);
    if (error) return error;
    try {
        const body = await request.json();
        const { weekOffset = 0 } = body;

        if (!Number.isInteger(weekOffset) || Math.abs(weekOffset) > 520) return errorResponse('Neispravan tjedan');
        const count = await generateWeek(prisma, weekOffset);

        return successResponse({
            message: `Dodano ${count} termina. Zatvoreni i prošli dani su preskočeni.`,
            count,
        }, 201);
    } catch (error) {
        console.error('Error creating slots:', error);
        return errorResponse('Greška pri kreiranju termina', 500);
    }
}
