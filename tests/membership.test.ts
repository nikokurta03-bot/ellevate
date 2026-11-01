import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPaymentDate, validDate } from '../src/lib/membership';
test('payment deadlines use a calendar month and clamp short months', () => {
    assert.equal(nextPaymentDate('2026-01-31'), '2026-02-28');
    assert.equal(nextPaymentDate('2028-01-31'), '2028-02-29');
    assert.equal(nextPaymentDate('2026-12-15'), '2027-01-15');
    assert.equal(nextPaymentDate('2026-03-29'), '2026-04-29');
    assert.equal(nextPaymentDate('2026-10-25'), '2026-11-25');
});
test('dates reject rollover, timestamps and malformed input', () => {
    for (const value of ['2026-02-29', '2026-04-31', '2026-1-1', '', null, '2026-01-01T00:00:00Z']) assert.equal(validDate(value), false);
    assert.equal(validDate('2028-02-29'), true);
});
