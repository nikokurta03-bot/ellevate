'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isProtectedRoute, routeRedirect } from '@/lib/route-access';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const redirect = routeRedirect(pathname, user?.role ?? null);

    useEffect(() => {
        if (!isLoading && redirect) router.replace(redirect);
    }, [isLoading, redirect, router]);

    if (isProtectedRoute(pathname) && (isLoading || redirect)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background" role="status">
                <div className="text-2xl font-bold animate-pulse gradient-text">Ellevate...</div>
            </div>
        );
    }

    return <>{children}</>;
}
