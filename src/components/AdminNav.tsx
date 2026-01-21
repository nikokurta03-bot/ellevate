'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const navItems = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Korisnici', href: '/admin/users' },
        { label: 'Raspored', href: '/admin/schedule' },
    ];

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-8">
                <Link href="/admin" className="text-2xl font-bold gradient-text">
                    Ellevate Admin
                </Link>
                <div className="hidden md:flex items-center gap-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-4 py-2 rounded-xl transition-all ${pathname === item.href
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <button onClick={handleLogout} className="btn-secondary px-4 py-2">
                    Odjava
                </button>
            </div>
        </nav>
    );
}
