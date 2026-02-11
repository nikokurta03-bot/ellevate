import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/helpers';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';

// GET /api/slots - Dohvati termine (requires auth)
export async function GET(request: NextRequest) {
    const { error } = await requireAuth(request);
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const weekOffset = parseInt(searchParams.get('week') || '0');
        const date = searchParams.get('date');

        let startDate: Date;
        let endDate: Date;

        if (date) {
            // Specific date
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Week view
            const today = new Date();
            const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
            startDate = weekStart;
            endDate = endOfWeek(weekStart, { weekStartsOn: 1 });
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
                                email: true,
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
            { start: '19:15', end: '20:15' },
            { start: '20:30', end: '21:30' },
        ];

        const today = new Date();
        const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });

        // Only Monday (0), Wednesday (2), Friday (4) - skip Tuesday and Thursday
        const trainingDays = [0, 2, 4];
        const slotsToCreate = [];

        for (const day of trainingDays) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + day);
            const dateStr = format(date, 'yyyy-MM-dd');

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
