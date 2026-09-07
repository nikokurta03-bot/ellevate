import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/helpers';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { studioDateKey } from '@/lib/booking-time';

// GET /api/slots - Dohvati termine (requires auth)
export async function GET(request: NextRequest) {
    const { error } = await requireAuth(request);
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const weekOffset = parseInt(searchParams.get('week') || '0');
        const date = searchParams.get('date');
        if (!Number.isInteger(weekOffset) || Math.abs(weekOffset) > 520) return errorResponse('Neispravan tjedan');
        if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) return errorResponse('Neispravan datum');

        let startDate: Date;
        let endDate: Date;

        if (date) {
            // Specific date
            startDate = new Date(`${date}T00:00:00Z`);
            endDate = new Date(`${date}T23:59:59.999Z`);
        } else {
            // Week view
            startDate = calendarWeekStart(weekOffset);
            endDate = new Date(startDate.getTime() + 7 * 86400000 - 1);
        }

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
            currentCount: slot._count.reservations,
            isFull: slot._count.reservations >= slot.maxCapacity,
            availableSpots: slot.maxCapacity - slot._count.reservations,
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

        const TRAINING_TIMES = [
            { start: '09:00', end: '10:00' },
            { start: '18:15', end: '19:15' },
            { start: '19:15', end: '20:15' },
            { start: '20:30', end: '21:30' },
        ];

        if (!Number.isInteger(weekOffset) || Math.abs(weekOffset) > 520) return errorResponse('Neispravan tjedan');
        const weekStart = calendarWeekStart(weekOffset);

        // Only Monday (0), Wednesday (2), Friday (4) - skip Tuesday and Thursday
        const trainingDays = [0, 2, 4];
        const slotsToCreate = [];

        for (const day of trainingDays) {
            const date = new Date(weekStart);
            date.setUTCDate(date.getUTCDate() + day);
            const dateStr = date.toISOString().slice(0, 10);

            for (const time of TRAINING_TIMES) {
                slotsToCreate.push({
                    date: new Date(dateStr),
                    startTime: time.start,
                    endTime: time.end,
                    maxCapacity: 8,
                });
            }
        }

        // 🚀 OPTIMIZACIJA: Batch create using createMany (only creates what doesn't exist)
        // Since sqlite/pg might not support createMany skipDuplicates effectively everywhere or differently
        // we'll filter them first or just use a loop with create if needed, but createMany is faster.
        // Actually for pg we can use createMany with skipDuplicates: true

        const result = await prisma.trainingSlot.createMany({
            data: slotsToCreate,
            skipDuplicates: true,
        });

        return successResponse({
            message: `Uspješno obrađeno ${slotsToCreate.length} termina.`,
            count: result.count,
        }, 201);
    } catch (error) {
        console.error('Error creating slots:', error);
        return errorResponse('Greška pri kreiranju termina', 500);
    }
}

function calendarWeekStart(weekOffset: number) {
    const date = new Date(`${studioDateKey()}T00:00:00Z`);
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday + weekOffset * 7);
    return date;
}
