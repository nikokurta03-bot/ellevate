import assert from 'node:assert/strict';
import test from 'node:test';
import { parseVital } from '../src/lib/web-vitals';
test('only bounded public metrics survive; identifying fields are dropped', () => {
    assert.deepEqual(parseVital({ name: 'LCP', value: 1200, page: '/', email: 'ignored', url: 'ignored' }), { name: 'LCP', value: 1200, page: '/' });
    assert.equal(parseVital({ name: 'INP', value: 30, page: '/admin' }), null);
    assert.equal(parseVital({ name: 'CLS', value: -1, page: '/' }), null);
    assert.equal(parseVital({ name: 'LCP', value: Infinity, page: '/' }), null);
    assert.equal(parseVital({ name: 'other', value: 1, page: '/' }), null);
});
