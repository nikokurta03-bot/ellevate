'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
    label: string;
    href: string;
}

interface AppNavProps {
    items: NavItem[];
    homeHref: string;
    roleLabel: string;
    menuTitle?: string;
}

export default function AppNav({ items, homeHref, roleLabel, menuTitle = 'Menu' }: AppNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <>
            <nav className="glass sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4 sm:gap-8">
                    <Link href={homeHref} className="flex items-center">
                        <Image src="/ellevate_logo.png" alt="Ellevate" width={140} height={40} className="h-8 sm:h-10 w-auto" priority />
                    </Link>
                    <div className="hidden md:flex items-center gap-4">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-xl transition-all ${pathname === item.href
                                    ? 'bg-pink-400 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className={`text-xs font-bold uppercase tracking-tighter ${roleLabel === 'Administrator' ? 'text-amber-500' : 'text-pink-300'}`}>{roleLabel}</p>
                    </div>
                    <button onClick={handleLogout} className="hidden sm:block btn-secondary px-4 py-2">Odjava</button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
                        aria-label="Otvori menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            <div className={`fixed top-0 right-0 h-full w-72 bg-slate-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-lg font-bold gradient-text">{menuTitle}</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Zatvori menu">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-white/5 rounded-xl">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className={`text-xs font-bold uppercase tracking-tighter ${roleLabel === 'Administrator' ? 'text-amber-500' : 'text-pink-300'}`}>{roleLabel}</p>
                    </div>

                    <div className="space-y-2">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl transition-all ${pathname === item.href
                                    ? 'bg-pink-400 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full mt-6 btn-secondary py-3">Odjava</button>
                </div>
            </div>
        </>
    );
}
