'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import UserModal from '@/components/UserModal';
import { ApiResponse, UserWithoutPassword } from '@/types';
import { useToast } from '@/components/Toasts';
import { MembershipInlineEditor, membershipRowClass } from '@/components/Membership';
import { membershipAttentionText, membershipSummary, type MembershipStatus } from '@/lib/membership';

type MembershipFilter = 'all' | 'attention' | MembershipStatus;

export default function UsersPage() {
    const { success, error } = useToast();
    const [users, setUsers] = useState<UserWithoutPassword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>('all');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users${debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ''}`);
            const result: ApiResponse<UserWithoutPassword[]> = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: UserWithoutPassword) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleMembershipUpdated = (updated: UserWithoutPassword) => {
        setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
    };

    const members = users.filter((user) => user.role !== 'admin');
    const countStatus = (status: MembershipStatus) =>
        members.filter((user) => membershipSummary(user.membershipPaidOn).status === status).length;
    const overdueCount = countStatus('overdue');
    const dueSoonCount = countStatus('due_soon');
    const attentionText = membershipAttentionText(overdueCount, dueSoonCount);
    const filters: { id: MembershipFilter; label: string; count: number }[] = [
        { id: 'all', label: 'Sve', count: users.length },
        { id: 'attention', label: 'Za obnovu', count: overdueCount + dueSoonCount },
        { id: 'overdue', label: 'Istekle', count: overdueCount },
        { id: 'due_soon', label: 'Uskoro', count: dueSoonCount },
        { id: 'missing', label: 'Bez datuma', count: countStatus('missing') },
    ];
    const visibleUsers = users.filter((user) => {
        if (membershipFilter === 'all') return true;
        if (user.role === 'admin') return false;
        const status = membershipSummary(user.membershipPaidOn).status;
        if (membershipFilter === 'attention') return status === 'overdue' || status === 'due_soon';
        return status === membershipFilter;
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Jeste li sigurni da želite obrisati ovog korisnika?')) return;

        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                success('Korisnik obrisan');
                fetchUsers();
            }
        } catch {
            error('Greška pri brisanju korisnika');
        }
    };

    return (
        <div className="min-h-screen">
            <AdminNav />

            <main id="main-content" tabIndex={-1} className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
                <header className="flex flex-col gap-4 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Upravljanje korisnicima</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Popis članica, datuma plaćanja članarine i administratora</p>
                        </div>
                        <button onClick={handleCreate} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                            <span>+</span> Dodaj korisnika
                        </button>
                    </div>
                </header>

                <div className="glass-card">
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Pretraži po imenu, emailu ili OIB-u..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 sm:py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-base"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter članarine">
                        {filters.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={membershipFilter === item.id}
                                onClick={() => setMembershipFilter(item.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${membershipFilter === item.id
                                    ? 'bg-pink-400 text-gray-900 border-pink-400'
                                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {item.label} ({item.count})
                            </button>
                        ))}
                    </div>
                    {attentionText && (
                        <p className="text-sm text-amber-100 mb-4">{attentionText}</p>
                    )}

                    {/* Mobile: Card Layout */}
                    <div className="md:hidden space-y-4">
                        {visibleUsers.length > 0 ? (
                            visibleUsers.map((user) => (
                                <div key={user.id} className={`p-4 rounded-xl border border-white/10 ${membershipRowClass(user.role, user.membershipPaidOn) || 'bg-white/5'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-base">{user.firstName} {user.lastName}</div>
                                            <div className="text-sm text-slate-400 mt-0.5">{user.email}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{user.oib}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-pink-300/20 text-pink-300'
                                            }`}>
                                            {user.role === 'admin' ? 'ADMIN' : 'USER'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-3">
                                        {user.heightCm ? `${user.heightCm}cm` : '-'} / {user.weightKg ? `${user.weightKg}kg` : '-'}
                                    </div>
                                    <div className="mb-4">
                                        <MembershipInlineEditor user={user} onUpdated={handleMembershipUpdated} />
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/nutrition?user=${user.id}`}
                                            className="flex-1 py-2 px-2 bg-pink-400/10 hover:bg-pink-400/20 text-pink-200 rounded-xl text-center text-sm font-medium transition-colors"
                                        >
                                            Prehrana
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
                                        >
                                            Uredi
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="flex-1 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-medium transition-colors"
                                        >
                                            Obriši
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-500">
                                {isLoading ? 'Učitavanje korisnika...' : 'Nema pronađenih korisnika.'}
                            </div>
                        )}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-sm">
                                    <th className="pb-4 font-semibold">Ime i prezime</th>
                                    <th className="pb-4 font-semibold">Email / OIB</th>
                                    <th className="pb-4 font-semibold">Uloga</th>
                                    <th className="pb-4 font-semibold">Članarina</th>
                                    <th className="pb-4 font-semibold">Detalji</th>
                                    <th className="pb-4 font-semibold text-right">Akcije</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {visibleUsers.length > 0 ? (
                                    visibleUsers.map((user) => (
                                        <tr key={user.id} className={`group transition-colors ${membershipRowClass(user.role, user.membershipPaidOn) || 'hover:bg-white/5'}`}>
                                            <td className="py-4">
                                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-sm">{user.email}</div>
                                                <div className="text-xs text-slate-500">{user.oib}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-pink-300/20 text-pink-300'
                                                    }`}>
                                                    {user.role === 'admin' ? 'ADMIN' : 'USER'}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <MembershipInlineEditor user={user} onUpdated={handleMembershipUpdated} />
                                            </td>
                                            <td className="py-4">
                                                <div className="text-xs text-slate-400">
                                                    {user.heightCm ? `${user.heightCm}cm` : '-'} / {user.weightKg ? `${user.weightKg}kg` : '-'}
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/nutrition?user=${user.id}`}
                                                        className="p-2 hover:bg-pink-400/10 rounded-lg text-pink-200 transition-colors"
                                                    >
                                                        Prehrana
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        Uredi
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-500 transition-colors"
                                                    >
                                                        Obriši
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            {isLoading ? 'Učitavanje korisnika...' : 'Nema pronađenih korisnika.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchUsers}
                user={selectedUser}
            />
        </div>
    );
}
