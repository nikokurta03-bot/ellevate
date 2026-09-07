import assert from 'node:assert/strict';
import test from 'node:test';
import { isProtectedRoute, routeRedirect } from '../src/lib/route-access';

test('public pages remain accessible without a session', () => {
  for (const path of ['/', '/blog', '/blog/grupni-treninzi', '/missing', '/administrator']) {
    assert.equal(isProtectedRoute(path), false);
    assert.equal(routeRedirect(path, null), null);
  }
});
test('private routes redirect signed-out visitors', () => {
  for (const path of ['/admin', '/admin/users', '/dashboard', '/dashboard/my-reservations']) {
    assert.equal(isProtectedRoute(path), true);
    assert.equal(routeRedirect(path, null), '/');
  }
});
test('role-specific destinations remain protected', () => {
  assert.equal(routeRedirect('/admin/users', 'user'), '/dashboard');
  assert.equal(routeRedirect('/dashboard/my-reservations', 'admin'), '/admin');
  assert.equal(routeRedirect('/admin', 'admin'), null);
  assert.equal(routeRedirect('/dashboard', 'user'), null);
  assert.equal(routeRedirect('/blog/grupni-treninzi', 'admin'), null);
});
