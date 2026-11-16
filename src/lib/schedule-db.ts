import { Prisma, PrismaClient } from '@prisma/client';
import { dateKey, slotsForDay, studioToday, weekDates } from './schedule';

// All booking, generation and day-state writes share a transaction-scoped date lock.
export async function lockDay(tx: Prisma.TransactionClient, date: Date | string) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(17015, ${Number(dateKey(date).replaceAll('-', ''))}::integer)::text`;
}

export async function setDayState(db: PrismaClient, date: string, isClosed: boolean) {
    return db.$transaction(async tx => {
        await lockDay(tx, date);
        const day = await tx.scheduleDay.upsert({
            where: { date: new Date(date) }, create: { date: new Date(date), isClosed }, update: { isClosed },
        });
        if (!isClosed) await tx.trainingSlot.createMany({ data: slotsForDay(date), skipDuplicates: true });
        return day;
    });
}

export async function generateWeek(db: PrismaClient, offset: number, today = studioToday()) {
    return db.$transaction(async tx => {
        let count = 0;
        for (const date of weekDates(offset, today).filter((_, i) => [0, 2, 4].includes(i))) {
            if (date < today) continue;
            await lockDay(tx, date);
            const day = await tx.scheduleDay.findUnique({ where: { date: new Date(date) } });
            if (!day?.isClosed) count += (await tx.trainingSlot.createMany({ data: slotsForDay(date), skipDuplicates: true })).count;
        }
        return count;
    });
}
