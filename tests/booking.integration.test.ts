import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import EmbeddedPostgres from 'embedded-postgres';
import { PrismaClient } from '@prisma/client';
import { bookTraining, cancelTraining, BookingError } from '../src/lib/booking-service';

let pg: EmbeddedPostgres;
let db: PrismaClient;
let users: { id: number }[];
const now = new Date('2026-09-08T12:00:00Z');

before(async () => {
    const port = await new Promise<number>(resolve => {
        const socket = createServer();
        socket.listen(0, '127.0.0.1', () => {
            const address = socket.address();
            if (!address || typeof address === 'string') throw new Error('No local port');
            socket.close(() => resolve(address.port));
        });
    });
    pg = new EmbeddedPostgres({ databaseDir: mkdtempSync(join(tmpdir(), 'ellevate-test-db-')), user: 'postgres', password: 'test-only-password', port,
        persistent: false, postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} });
    await pg.initialise();
    await pg.start();
    await pg.createDatabase('ellevate_test');
    // Only this newly created loopback database is ever passed to schema push.
    const url = `postgresql://postgres:test-only-password@127.0.0.1:${port}/ellevate_test?connection_limit=16`;
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], {
        env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url }, stdio: 'pipe',
    });
    db = new PrismaClient({ datasources: { db: { url } } });
    users = await Promise.all(Array.from({ length: 12 }, (_, i) => db.user.create({ data: {
        email: `test${i}@example.invalid`, password: 'test-only', firstName: 'Test', lastName: `Member ${i}`,
    }, select: { id: true } })));
});
after(async () => { await db?.$disconnect(); await pg?.stop(); });

async function slot(capacity: number, day: number) {
    return db.trainingSlot.create({ data: { date: new Date(`2026-09-${day}T00:00:00Z`), startTime: '09:00', endTime: '10:00', maxCapacity: capacity } });
}
function assertConflict(result: PromiseSettledResult<unknown>) {
    if (result.status === 'rejected') assert.ok(result.reason instanceof BookingError && result.reason.status === 409);
}
test('12 simultaneous requests cannot overbook two places', async () => {
    const training = await slot(2, 10);
    const results = await Promise.allSettled(users.map(user => bookTraining(db, user.id, training.id, now)));
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 2);
    results.forEach(assertConflict);
    assert.equal(await db.reservation.count({ where: { slotId: training.id, status: 'active' } }), 2);
});
test('duplicate requests only create one active reservation', async () => {
    const training = await slot(8, 11);
    const results = await Promise.allSettled(Array.from({ length: 6 }, () => bookTraining(db, users[0].id, training.id, now)));
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    results.forEach(assertConflict);
    assert.equal(await db.reservation.count({ where: { slotId: training.id } }), 1);
});
test('reactivation competes with new bookings for the same final place', async () => {
    const training = await slot(1, 12);
    await db.reservation.create({ data: { userId: users[0].id, slotId: training.id, status: 'cancelled', cancelledAt: now } });
    const results = await Promise.allSettled(users.slice(0, 4).map(user => bookTraining(db, user.id, training.id, now)));
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    results.forEach(assertConflict);
    const active = await db.reservation.findMany({ where: { slotId: training.id, status: 'active' } });
    assert.equal(active.length, 1);
    assert.equal(active[0].cancelledAt, null);
});
test('cutoff is enforced in the transaction without creating a reservation', async () => {
    const training = await slot(8, 13);
    await assert.rejects(bookTraining(db, users[0].id, training.id, new Date('2026-09-12T19:00:00.001Z')), /Rok za prijavu je istekao/);
    assert.equal(await db.reservation.count({ where: { slotId: training.id } }), 0);
    const accepted = await bookTraining(db, users[0].id, training.id, new Date('2026-09-12T19:00:00Z'));
    assert.equal(accepted.status, 'active');
});
test('cancellation enforces ownership and simultaneous cancellations have one winner', async () => {
    const training = await slot(1, 14);
    const booked = await bookTraining(db, users[0].id, training.id, now);
    await assert.rejects(cancelTraining(db, booked.id, { userId: users[1].id, role: 'user' }, now), error => error instanceof BookingError && error.status === 403);
    const actor = { userId: users[0].id, role: 'user' };
    const results = await Promise.allSettled([cancelTraining(db, booked.id, actor, now), cancelTraining(db, booked.id, actor, now)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    results.forEach(assertConflict);
    const next = await bookTraining(db, users[1].id, training.id, now);
    assert.equal(next.status, 'active');
});
