import { Prisma, PrismaClient } from '@prisma/client';
import { canMakeReservation, canCancelReservation, bookingDeadlineLabel } from './booking-time';

export class BookingError extends Error {
    constructor(message: string, public status = 400) { super(message); }
}

const details = {
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
    slot: true,
} satisfies Prisma.ReservationInclude;

// All writers of active reservations lock the same slot row. ReadCommitted ensures
// count/status queries after waiting on the lock see the preceding writer's commit.
const transactionOptions = { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 10000, timeout: 10000 };

export async function bookTraining(db: PrismaClient, userId: number, slotId: number, now?: Date) {
    return db.$transaction(async tx => {
        const locked = await tx.$queryRaw<{ id: number }[]>`SELECT "id" FROM "TrainingSlot" WHERE "id" = ${slotId} FOR UPDATE`;
        if (!locked.length) throw new BookingError('Termin nije pronađen', 404);
        const slot = await tx.trainingSlot.findUniqueOrThrow({ where: { id: slotId } });
        if (!canMakeReservation(slot.date, slot.startTime, now ?? new Date())) {
            throw new BookingError(`Rok za prijavu je istekao. Prijave su bile moguće do ${bookingDeadlineLabel(slot.date, slot.startTime)} (Zagreb).`);
        }
        const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (!user) throw new BookingError('Korisnik nije pronađen', 404);
        const existing = await tx.reservation.findUnique({ where: { userId_slotId: { userId, slotId } } });
        if (existing?.status === 'active') throw new BookingError('Već imate rezervaciju za ovaj termin', 409);
        const count = await tx.reservation.count({ where: { slotId, status: 'active' } });
        if (count >= slot.maxCapacity) throw new BookingError('Termin je popunjen', 409);
        if (existing) {
            return tx.reservation.update({ where: { id: existing.id }, data: { status: 'active', cancelledAt: null }, include: details });
        }
        return tx.reservation.create({ data: { userId, slotId, status: 'active' }, include: details });
    }, transactionOptions);
}

export async function cancelTraining(db: PrismaClient, reservationId: number, actor: { userId: number; role: string }, now?: Date) {
    return db.$transaction(async tx => {
        const initial = await tx.reservation.findUnique({ where: { id: reservationId }, select: { slotId: true } });
        if (!initial) throw new BookingError('Rezervacija nije pronađena', 404);
        await tx.$queryRaw`SELECT "id" FROM "TrainingSlot" WHERE "id" = ${initial.slotId} FOR UPDATE`;
        const reservation = await tx.reservation.findUnique({ where: { id: reservationId }, include: { slot: true } });
        if (!reservation) throw new BookingError('Rezervacija nije pronađena', 404);
        if (actor.role !== 'admin' && reservation.userId !== actor.userId) throw new BookingError('Možete otkazati samo svoje rezervacije', 403);
        if (reservation.status !== 'active') throw new BookingError('Rezervacija je već otkazana', 409);
        if (!canCancelReservation(reservation.slot.date, reservation.slot.startTime, now ?? new Date())) {
            throw new BookingError('Nije moguće otkazati rezervaciju manje od 3 sata prije početka termina');
        }
        return tx.reservation.update({ where: { id: reservationId }, data: { status: 'cancelled', cancelledAt: now ?? new Date() }, include: details });
    }, transactionOptions);
}
