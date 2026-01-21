'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="text-2xl font-bold gradient-text">
                    Ellevate
                </Link>
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className={`px-4 py-2 rounded-xl transition-all ${pathname === '/dashboard'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Rezervacija termina
                    </Link>
                    <Link
                        href="/dashboard/my-reservations"
                        className={`px-4 py-2 rounded-xl transition-all ${pathname === '/dashboard/my-reservations'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Moje rezervacije
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-tighter">Član</p>
                </div>
                <button onClick={handleLogout} className="btn-secondary px-4 py-2">
                    Odjava
                </button>
            </div>
        </nav>
    );
}
