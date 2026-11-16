import test from 'node:test';
import assert from 'node:assert/strict';
import { slotsForDay, studioToday, validDate, weekDates } from '../src/lib/schedule';

test('capacity and 17:15 start on November 16 without changing earlier dates', () => {
    assert.equal(slotsForDay('2026-11-15').length, 4);
    assert.ok(slotsForDay('2026-11-15').every(slot => slot.maxCapacity === 8));
    const slots = slotsForDay('2026-11-16');
    assert.equal(slots.length, 5);
    assert.ok(slots.every(slot => slot.maxCapacity === 9));
    assert.equal(slots.find(slot => slot.startTime === '17:15')?.endTime, '18:15');
    assert.ok(slots.some(slot => slot.startTime === '19:20'));
});
test('studio dates and weeks handle local midnight and year boundaries', () => {
    assert.equal(studioToday(new Date('2026-11-15T23:30:00Z')), '2026-11-16');
    assert.deepEqual(weekDates(0, '2027-01-01'), ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']);
    assert.equal(validDate('2026-02-30'), false);
    assert.equal(validDate('2028-02-29'), true);
});
