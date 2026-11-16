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
let testDatabaseUrl: string;
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
    testDatabaseUrl = url;
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

test('admin bypasses cutoffs but respects capacity; stale admin role has no privilege', async () => {
    const training = await slot(1, 16);
    const admin = await db.user.create({ data: { email: 'admin@example.invalid', password: 'test-only', firstName: 'Admin', lastName: 'Test', role: 'admin' } });
    const actor = { userId: admin.id, role: 'admin' };
    const late = new Date('2026-09-16T06:45:00Z');
    await assert.rejects(bookTraining(db, users[0].id, training.id, late), /Rok za prijavu/);
    const booking = await bookTraining(db, users[0].id, training.id, late, actor);
    await assert.rejects(bookTraining(db, users[1].id, training.id, late, actor), /popunjen/);
    await assert.rejects(cancelTraining(db, booking.id, { userId: users[0].id, role: 'user' }, late), /3 sata/);
    await cancelTraining(db, booking.id, actor, late);
    await assert.rejects(bookTraining(db, users[1].id, training.id, new Date('2026-09-16T07:00:00Z'), actor), /već prošao/);
    await db.user.update({ where: { id: admin.id }, data: { role: 'user' } });
    await assert.rejects(bookTraining(db, users[1].id, training.id, late, actor), error => error instanceof BookingError && error.status === 403);
});

test('closed day preserves bookings, rejects additions, survives generation and reopens without duplicates', async () => {
    const { setDayState, generateWeek } = await import('../src/lib/schedule-db');
    const date = '2026-11-18';
    await setDayState(db, date, false);
    const training = await db.trainingSlot.findFirstOrThrow({ where: { date: new Date(date), startTime: '17:15' } });
    const booked = await bookTraining(db, users[0].id, training.id, now);
    await setDayState(db, date, true);
    await assert.rejects(bookTraining(db, users[1].id, training.id, now), /Dan je zatvoren/);
    await generateWeek(db, 0, '2026-11-16');
    assert.equal((await db.scheduleDay.findUniqueOrThrow({ where: { date: new Date(date) } })).isClosed, true);
    assert.equal((await db.reservation.findUniqueOrThrow({ where: { id: booked.id } })).status, 'active');
    await setDayState(db, date, false);
    await setDayState(db, date, false);
    assert.equal(await db.trainingSlot.count({ where: { date: new Date(date) } }), 5);
    assert.equal((await db.reservation.findUniqueOrThrow({ where: { id: booked.id } })).slotId, training.id);
    const results = await Promise.allSettled(users.slice(1).map(user => bookTraining(db, user.id, training.id, now)));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 8);
    assert.equal(await db.reservation.count({ where: { slotId: training.id, status: 'active' } }), 9);
});

test('admin can open weekends and close empty days before generation', async () => {
    const { setDayState, generateWeek } = await import('../src/lib/schedule-db');
    await setDayState(db, '2026-11-21', false);
    assert.equal(await db.trainingSlot.count({ where: { date: new Date('2026-11-21'), maxCapacity: 9 } }), 5);
    await setDayState(db, '2026-11-23', true);
    await generateWeek(db, 0, '2026-11-23');
    assert.equal(await db.trainingSlot.count({ where: { date: new Date('2026-11-23') } }), 0);
});

test('closure serializes with simultaneous bookings', async () => {
    const { setDayState } = await import('../src/lib/schedule-db');
    await setDayState(db, '2026-11-27', false);
    const training = await db.trainingSlot.findFirstOrThrow({ where: { date: new Date('2026-11-27') } });
    await Promise.allSettled([setDayState(db, '2026-11-27', true), ...users.map(user => bookTraining(db, user.id, training.id, now))]);
    assert.equal((await db.scheduleDay.findUniqueOrThrow({ where: { date: new Date('2026-11-27') } })).isClosed, true);
    await assert.rejects(bookTraining(db, users[0].id, training.id, now), /Dan je zatvoren/);
    assert.ok(await db.reservation.count({ where: { slotId: training.id, status: 'active' } }) <= 9);
});


test('production migration preserves slot IDs, bookings and historical capacities', async () => {
    // Exercise the exact SQL only against this suite's disposable loopback database.
    const history = await db.trainingSlot.create({ data: { date: new Date('2026-11-13'), startTime: '18:15', endTime: '19:15', maxCapacity: 8 } });
    const future = await db.trainingSlot.create({ data: { date: new Date('2026-11-30'), startTime: '19:20', endTime: '20:20', maxCapacity: 8 } });
    const reservation = await db.reservation.create({ data: { userId: users[0].id, slotId: future.id } });
    await db.$executeRawUnsafe('DROP TABLE "ScheduleDay"');
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'execute', '--file', 'prisma/migrations/20261116000000_schedule_admin/migration.sql', '--schema', 'prisma/schema.prisma'], {
        env: { ...process.env, DATABASE_URL: testDatabaseUrl, DIRECT_URL: testDatabaseUrl }, stdio: 'pipe',
    });
    assert.equal((await db.trainingSlot.findUniqueOrThrow({ where: { id: history.id } })).maxCapacity, 8);
    assert.equal((await db.trainingSlot.findUniqueOrThrow({ where: { id: future.id } })).maxCapacity, 9);
    assert.equal((await db.reservation.findUniqueOrThrow({ where: { id: reservation.id } })).status, 'active');
    assert.equal(await db.trainingSlot.count({ where: { date: future.date, startTime: '17:15', maxCapacity: 9 } }), 1);
    assert.equal(await db.trainingSlot.count({ where: { date: history.date, startTime: '17:15' } }), 0);
});
