import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateOrigin } from '@/lib/csrf';
import { successResponse, errorResponse } from '@/lib/helpers';
import { validDate, nextPaymentDate } from '@/lib/membership';
import { studioDateKey } from '@/lib/booking-time';

async function access(request: NextRequest) {
    const { session, error } = await requireAuth(request);
    if (error) return { error };
    const actor = await prisma.user.findUnique({ where: { id: session!.userId }, select: { role: true } });
    if (!actor) return { error: errorResponse('Niste prijavljeni', 401) };
    const userId = Number(request.nextUrl.searchParams.get('userId') || session!.userId);
    if (!Number.isSafeInteger(userId) || userId < 1) return { error: errorResponse('Neispravan korisnik') };
    if (userId !== session!.userId && actor.role !== 'admin') return { error: errorResponse('Nemate pristup', 403) };
    return { userId, admin: actor.role === 'admin' };
}
export async function GET(request: NextRequest) {
    const auth = await access(request);
    if (auth.error) return auth.error;
    const data = await prisma.membership.findUnique({ where: { userId: auth.userId } });
    return successResponse(data ? { joinedOn: data.joinedOn, firstPaidOn: data.firstPaidOn, lastPaidOn: data.lastPaidOn, dueOn: data.dueOn } : null);
}
export async function PUT(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const auth = await access(request);
    if (auth.error) return auth.error;
    if (!auth.admin) return errorResponse('Samo administratorica može evidentirati uplate', 403);
    const body = await request.json().catch(() => null);
    if (!body || ![body.joinedOn, body.firstPaidOn, body.lastPaidOn].every(validDate)) return errorResponse('Unesite ispravne datume');
    const { joinedOn, firstPaidOn, lastPaidOn } = body;
    if (firstPaidOn < joinedOn || lastPaidOn < firstPaidOn || lastPaidOn > studioDateKey()) return errorResponse('Provjerite redoslijed datuma. Uplata ne može biti u budućnosti.');
    const target = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true } });
    if (!target) return errorResponse('Korisnica nije pronađena', 404);
    const data = { joinedOn, firstPaidOn, lastPaidOn, dueOn: nextPaymentDate(lastPaidOn) };
    await prisma.membership.upsert({ where: { userId: auth.userId }, create: { userId: auth.userId!, ...data }, update: data });
    return successResponse(data);
}
