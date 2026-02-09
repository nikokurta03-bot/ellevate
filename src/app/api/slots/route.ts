import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/helpers';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';

// GET /api/slots - Dohvati termine
export async function GET(request: NextRequest) {
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

// POST /api/slots - Generiraj termine za tjedan
export async function POST(request: NextRequest) {
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

        const createdSlots = [];

        // Only Monday (0), Wednesday (2), Friday (4) - skip Tuesday and Thursday
        const trainingDays = [0, 2, 4];

        for (const day of trainingDays) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + day);

            for (const time of TRAINING_TIMES) {
                const existingSlot = await prisma.trainingSlot.findUnique({
                    where: {
                        date_startTime: {
                            date: new Date(format(date, 'yyyy-MM-dd')),
                            startTime: time.start,
                        },
                    },
                });

                if (!existingSlot) {
                    const slot = await prisma.trainingSlot.create({
                        data: {
                            date: new Date(format(date, 'yyyy-MM-dd')),
                            startTime: time.start,
                            endTime: time.end,
                            maxCapacity: 8,
                        },
                    });
                    createdSlots.push(slot);
                }
            }
        }

        return successResponse({
            message: `Kreirano ${createdSlots.length} novih termina`,
            slots: createdSlots,
        }, 201);
    } catch (error) {
        console.error('Error creating slots:', error);
        return errorResponse('Greška pri kreiranju termina', 500);
    }
}
