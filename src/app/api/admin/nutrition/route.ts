import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { validateOrigin } from '@/lib/csrf';
import { errorResponse, successResponse } from '@/lib/helpers';
import { isNutritionPlan, parseNutritionDays } from '@/lib/nutrition';
import { prisma } from '@/lib/prisma';

async function authorize(request: NextRequest) {
    const originError = validateOrigin(request);
    if (originError) return originError;
    const { error, session } = await requireAdmin(request);
    if (error) return error;
    const administrator = await prisma.user.findUnique({ where: { id: session!.userId }, select: { role: true } });
    return administrator?.role === 'admin' ? null : errorResponse('Nemate administratorska prava', 403);
}

export async function PUT(request: NextRequest) {
    const accessError = await authorize(request);
    if (accessError) return accessError;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return errorResponse('Neispravan zahtjev', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return errorResponse('Neispravan zahtjev', 400);
    const { userId, plan, days: rawDays } = body as Record<string, unknown>;
    const days = parseNutritionDays(rawDays);
    if (!Number.isSafeInteger(userId) || (userId as number) <= 0 || !isNutritionPlan(plan) || !days) {
        return errorResponse('Jelovnik nije ispravno popunjen', 400);
    }
    const user = await prisma.user.findUnique({ where: { id: userId as number }, select: { id: true } });
    if (!user) return errorResponse('Račun nije pronađen', 404);

    try {
        await prisma.nutritionMenu.upsert({
            where: { userId_plan: { userId: user.id, plan } },
            create: { userId: user.id, plan, days: days as unknown as Prisma.InputJsonValue },
            update: { days: days as unknown as Prisma.InputJsonValue },
        });
        return successResponse({ days });
    } catch (error) {
        console.error('Failed to save nutrition menu:', error);
        return errorResponse('Jelovnik nije spremljen', 500);
    }
}

export async function DELETE(request: NextRequest) {
    const accessError = await authorize(request);
    if (accessError) return accessError;

    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get('user'));
    const plan = searchParams.get('plan');
    if (!Number.isSafeInteger(userId) || userId <= 0 || !isNutritionPlan(plan)) {
        return errorResponse('Neispravan zahtjev', 400);
    }
    try {
        await prisma.nutritionMenu.deleteMany({ where: { userId, plan } });
        return successResponse({ reset: true });
    } catch (error) {
        console.error('Failed to reset nutrition menu:', error);
        return errorResponse('Jelovnik nije vraćen na predložak', 500);
    }
}
