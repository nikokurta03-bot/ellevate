import assert from 'node:assert/strict';
import test from 'node:test';
import {
    addCalendarMonths,
    formatCroatianDate,
    membershipAttentionText,
    membershipCopy,
    membershipSummary,
    parseMembershipPaidOn,
} from '../src/lib/membership';

test('adds one calendar month and clamps month-end dates', () => {
    assert.equal(addCalendarMonths('2026-01-31', 1), '2026-02-28');
    assert.equal(addCalendarMonths('2024-01-31', 1), '2024-02-29');
    assert.equal(addCalendarMonths('2028-01-31', 1), '2028-02-29');
    assert.equal(addCalendarMonths('2026-01-30', 1), '2026-02-28');
    assert.equal(addCalendarMonths('2024-01-30', 1), '2024-02-29');
    assert.equal(addCalendarMonths('2026-03-31', 1), '2026-04-30');
    assert.equal(addCalendarMonths('2026-05-31', 1), '2026-06-30');
    assert.equal(addCalendarMonths('2026-12-15', 1), '2027-01-15');
    assert.equal(addCalendarMonths('2024-02-29', 1), '2024-03-29');
    assert.equal(addCalendarMonths('2026-02-28', 1), '2026-03-28');
});

test('formats dates as DD.MM.YYYY.', () => {
    assert.equal(formatCroatianDate('2026-01-05'), '05.01.2026.');
    assert.equal(formatCroatianDate('2026-11-15'), '15.11.2026.');
});

test('membership is valid through the due date and overdue the next day', () => {
    const paid = '2026-10-01';
    const active = membershipSummary(paid, new Date('2026-10-24T10:00:00Z'));
    assert.equal(active.validUntil, '2026-11-01');
    assert.equal(active.status, 'active');
    assert.equal(active.daysLeft, 8);
    assert.equal(membershipCopy(active).primary, 'Članarina vrijedi do: 01.11.2026.');

    const soon = membershipSummary(paid, new Date('2026-10-25T10:00:00Z'));
    assert.equal(soon.status, 'due_soon');
    assert.equal(soon.daysLeft, 7);
    assert.equal(membershipCopy(soon).primary, 'Članarina vrijedi do: 01.11.2026.');
    assert.match(membershipCopy(soon).secondary ?? '', /Obnova je za 7 dana/);

    const dueToday = membershipSummary(paid, new Date('2026-11-01T10:00:00Z'));
    assert.equal(dueToday.status, 'due_soon');
    assert.equal(dueToday.daysLeft, 0);
    assert.match(membershipCopy(dueToday).secondary ?? '', /Obnova je danas/);

    const overdue = membershipSummary(paid, new Date('2026-11-02T10:00:00Z'));
    assert.equal(overdue.status, 'overdue');
    assert.equal(overdue.daysLeft, -1);
    assert.equal(membershipCopy(overdue).primary, 'Članarina je vrijedila do: 01.11.2026.');
    assert.equal(membershipCopy(overdue).secondary, 'Zadnje plaćanje: 01.10.2026.');
});

test('missing payment date stays empty for existing members', () => {
    const summary = membershipSummary(null, new Date('2026-11-01T10:00:00Z'));
    assert.equal(summary.status, 'missing');
    assert.equal(summary.validUntilLabel, null);
    assert.equal(membershipCopy(summary).primary, 'Datum plaćanja članarine još nije unesen.');
});

test('due date follows the Europe/Zagreb calendar, not the server timezone', () => {
    const original = process.env.TZ;
    try {
        // 28.02. 23:30 UTC is already 01.03. in Zagreb, and still 28.02. in Los Angeles.
        const now = new Date('2026-02-28T23:30:00Z');
        for (const zone of ['UTC', 'Europe/Zagreb', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
            process.env.TZ = zone;
            const summary = membershipSummary('2026-01-31', now);
            assert.equal(summary.validUntil, '2026-02-28');
            assert.equal(summary.status, 'overdue');
            assert.equal(addCalendarMonths('2026-01-31', 1), '2026-02-28');
        }
    } finally {
        if (original === undefined) delete process.env.TZ;
        else process.env.TZ = original;
    }
});

function expectDate(value: unknown, today: string): Date | null {
    const parsed = parseMembershipPaidOn(value, today);
    if ('error' in parsed) assert.fail(parsed.error);
    return parsed.date;
}

test('accepts a payment date up to today and rejects invalid or future dates', () => {
    const today = '2026-11-01';
    assert.equal(expectDate('', today), null);
    assert.equal(expectDate(null, today), null);
    assert.equal(expectDate('2026-11-01', today)?.toISOString(), '2026-11-01T00:00:00.000Z');
    assert.equal('error' in parseMembershipPaidOn('2026-11-02', today), true);
    assert.equal('error' in parseMembershipPaidOn('2026-02-31', today), true);
    assert.equal('error' in parseMembershipPaidOn('15.10.2026', today), true);
    assert.equal('error' in parseMembershipPaidOn('1999-12-31', today), true);
    assert.equal('error' in parseMembershipPaidOn(20261101, today), true);
});

test('attention sentence uses Croatian plural forms', () => {
    assert.equal(membershipAttentionText(0, 0), null);
    assert.equal(membershipAttentionText(1, 0), '1 članarina je istekla.');
    assert.equal(membershipAttentionText(2, 0), '2 članarine su istekle.');
    assert.equal(membershipAttentionText(5, 0), '5 članarina je isteklo.');
    assert.equal(membershipAttentionText(11, 0), '11 članarina je isteklo.');
    assert.equal(membershipAttentionText(21, 0), '21 članarina je istekla.');
    assert.equal(membershipAttentionText(0, 1), '1 članarina ističe u sljedećih 7 dana.');
    assert.equal(membershipAttentionText(0, 3), '3 članarine ističu u sljedećih 7 dana.');
    assert.equal(
        membershipAttentionText(2, 1),
        '2 članarine su istekle. 1 članarina ističe u sljedećih 7 dana.',
    );
});
