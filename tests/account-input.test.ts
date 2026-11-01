import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEmail, optionalPositiveNumber, parseOptionalIsoDate } from '../src/lib/helpers';

test('normalizes login and account emails', () => {
    assert.equal(normalizeEmail('  Foo@Bar.com '), 'foo@bar.com');
    assert.equal(normalizeEmail('not-an-email'), null);
    assert.equal(normalizeEmail(''), null);
    assert.equal(normalizeEmail(12), null);
});

test('stores a real birth date at UTC midnight and rejects impossible dates', () => {
    const parsed = parseOptionalIsoDate('1990-05-15');
    if ('error' in parsed) assert.fail(parsed.error);
    assert.equal(parsed.date?.toISOString(), '1990-05-15T00:00:00.000Z');
    assert.equal('error' in parseOptionalIsoDate('1990-02-31'), true);
    const empty = parseOptionalIsoDate('');
    if ('error' in empty) assert.fail(empty.error);
    assert.equal(empty.date, null);
});

test('drops invalid measurements and rounds height to a whole centimetre', () => {
    assert.equal(optionalPositiveNumber(170.6, true), 171);
    assert.equal(optionalPositiveNumber(0, true), null);
    assert.equal(optionalPositiveNumber('nope', false), null);
    assert.equal(optionalPositiveNumber(62.5, false), 62.5);
});
