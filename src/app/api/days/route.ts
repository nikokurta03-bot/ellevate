import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { errorResponse, successResponse } from '@/lib/helpers';
import { studioToday, validDate, weekDates } from '@/lib/schedule';
import { setDayState } from '@/lib/schedule-db';

export async function GET(request: NextRequest) {
    const { error } = await requireAuth(request);
    if (error) return error;
    const offset = Number(new URL(request.url).searchParams.get('week') || 0);
    if (!Number.isInteger(offset) || Math.abs(offset) > 520) return errorResponse('Neispravan tjedan');
    try {
        const dates = weekDates(offset);
        return successResponse(await prisma.scheduleDay.findMany({ where: { date: { gte: new Date(dates[0]), lte: new Date(dates[6]) } } }));
    } catch (error) {
        console.error('Error fetching days:', error);
        return errorResponse('Greška pri dohvaćanju dana', 500);
    }
}

export async function PATCH(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error } = await requireAdmin(request);
    if (error) return error;
    try {
        const { date, isClosed } = await request.json();
        if (!validDate(date) || typeof isClosed !== 'boolean') return errorResponse('Neispravan datum ili status dana');
        if (date < studioToday()) return errorResponse('Nije moguće mijenjati prošle dane');
        const day = await setDayState(prisma, date, isClosed);
        return successResponse(day);
    } catch (error) {
        console.error('Error updating day:', error);
        return errorResponse('Greška pri promjeni dana', 500);
    }
}
