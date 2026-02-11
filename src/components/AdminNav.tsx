'use client';

import AppNav from './AppNav';

const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Korisnici', href: '/admin/users' },
    { label: 'Raspored', href: '/admin/schedule' },
];

export default function AdminNav() {
    return <AppNav items={navItems} homeHref="/admin" roleLabel="Administrator" menuTitle="Admin Menu" />;
}
