'use client';

import React, { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import UserModal from '@/components/UserModal';
import { ApiResponse, UserWithoutPassword } from '@/types';

export default function UsersAdminPage() {
    const [users, setUsers] = useState<UserWithoutPassword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users${searchTerm ? `?search=${searchTerm}` : ''}`);
            const result: ApiResponse<UserWithoutPassword[]> = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const handleEdit = (user: UserWithoutPassword) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Jeste li sigurni da želite obrisati ovog korisnika?')) return;

        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                fetchUsers();
            }
        } catch (err) {
            alert('Greška pri brisanju korisnika');
        }
    };

    return (
        <div className="min-h-screen">
            <AdminNav />

            <main className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
                <header className="flex flex-col gap-4 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Upravljanje korisnicima</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Popis svih članova i administratora sustava</p>
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

                    {/* Mobile: Card Layout */}
                    <div className="md:hidden space-y-4">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <div key={user.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
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
                                    <div className="text-xs text-slate-400 mb-4">
                                        {user.heightCm ? `${user.heightCm}cm` : '-'} / {user.weightKg ? `${user.weightKg}kg` : '-'}
                                    </div>
                                    <div className="flex gap-2">
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
                                    <th className="pb-4 font-semibold">Detalji</th>
                                    <th className="pb-4 font-semibold text-right">Akcije</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/5 transition-colors">
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
                                            <td className="py-4">
                                                <div className="text-xs text-slate-400">
                                                    {user.heightCm ? `${user.heightCm}cm` : '-'} / {user.weightKg ? `${user.weightKg}kg` : '-'}
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
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
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
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
