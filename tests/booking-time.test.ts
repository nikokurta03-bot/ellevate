import assert from 'node:assert/strict';
import test from 'node:test';
import { bookingDeadline, canMakeReservation, canCancelReservation, trainingStart } from '../src/lib/booking-time';

for (const [date, deadline] of [
    ['2026-09-09', '2026-09-08T19:00:00.000Z'],
    ['2026-01-02', '2026-01-01T20:00:00.000Z'],
    ['2026-03-29', '2026-03-28T20:00:00.000Z'],
    ['2026-10-25', '2026-10-24T19:00:00.000Z'],
    ['2027-01-01', '2026-12-31T20:00:00.000Z'],
]) {
    test(`morning deadline and exact boundary for ${date}`, () => {
        assert.equal(bookingDeadline(date, '09:00').toISOString(), deadline);
        const edge = new Date(deadline);
        assert.equal(canMakeReservation(date, '09:00', new Date(+edge - 1)), true);
        assert.equal(canMakeReservation(date, '09:00', edge), true);
        assert.equal(canMakeReservation(date, '09:00', new Date(+edge + 1)), false);
    });
}
test('afternoon retains three-hour signup limit; noon is not morning', () => {
    assert.equal(bookingDeadline('2026-09-09', '18:15').toISOString(), '2026-09-09T13:15:00.000Z');
    assert.equal(bookingDeadline('2026-09-09', '12:00').toISOString(), '2026-09-09T07:00:00.000Z');
});
test('morning cancellation still uses three hours, independent of previous-evening signup', () => {
    assert.equal(canCancelReservation('2026-09-09', '09:00', new Date('2026-09-09T03:59:59Z')), true);
    assert.equal(canCancelReservation('2026-09-09', '09:00', new Date('2026-09-09T04:00:00Z')), false);
    assert.equal(canMakeReservation('2026-09-09', '09:00', new Date('2026-09-09T03:00:00Z')), false);
});
test('server timezone does not change deadlines or training instants', () => {
    const original = process.env.TZ;
    try {
        for (const zone of ['UTC', 'Europe/Zagreb', 'America/Los_Angeles', 'Asia/Tokyo']) {
            process.env.TZ = zone;
            assert.equal(trainingStart('2026-09-09', '09:00').toISOString(), '2026-09-09T07:00:00.000Z');
            assert.equal(bookingDeadline('2026-09-09', '09:00').toISOString(), '2026-09-08T19:00:00.000Z');
        }
    } finally {
        if (original === undefined) delete process.env.TZ;
        else process.env.TZ = original;
    }
});
