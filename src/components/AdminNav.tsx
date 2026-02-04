'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <>
            <nav className="glass sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4 sm:gap-8">
                    <Link href="/admin" className="text-lg sm:text-2xl font-bold gradient-text">
                        Ellevate Admin
                    </Link>
                    {/* Desktop Navigation */}
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

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                    <button onClick={handleLogout} className="hidden sm:block btn-secondary px-4 py-2">
                        Odjava
                    </button>
                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Slide-out */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-slate-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="p-6">
                    {/* Close Button */}
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-lg font-bold gradient-text">Admin Menu</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="mb-6 p-4 bg-white/5 rounded-xl">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-amber-500 font-bold uppercase tracking-tighter">Administrator</p>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl transition-all ${pathname === item.href
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                        }}
                        className="w-full mt-6 btn-secondary py-3"
                    >
                        Odjava
                    </button>
                </div>
            </div>
        </>
    );
}
