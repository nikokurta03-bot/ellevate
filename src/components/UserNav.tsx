'use client';

import AppNav from './AppNav';

const navItems = [
    { label: 'Rezervacija termina', href: '/dashboard' },
    { label: 'Moje rezervacije', href: '/dashboard/my-reservations' },
];

export default function UserNav() {
    return <AppNav items={navItems} homeHref="/dashboard" roleLabel="Član" />;
}
