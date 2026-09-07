// Public pages must render without waiting for session verification.
export function isProtectedRoute(pathname: string) {
  return ['/admin', '/dashboard'].some(path => pathname === path || pathname.startsWith(`${path}/`));
}

export function routeRedirect(pathname: string, role: string | null) {
  if (!isProtectedRoute(pathname)) return null;
  if (!role) return '/';
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && role !== 'admin') return '/dashboard';
  if ((pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && role === 'admin') return '/admin';
  return null;
}
