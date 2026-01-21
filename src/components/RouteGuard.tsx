'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user && pathname !== '/') {
                router.push('/');
            } else if (user) {
                if (user.role === 'admin' && pathname.startsWith('/dashboard')) {
                    router.push('/admin');
                } else if (user.role === 'user' && pathname.startsWith('/admin')) {
                    router.push('/dashboard');
                }
            }
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-2xl font-bold animate-pulse gradient-text">Ellevate...</div>
            </div>
        );
    }

    return <>{children}</>;
}
