'use client';

import React, { useState, useEffect } from 'react';
import { UserWithoutPassword, CreateUserInput } from '@/types';

type UserModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    user?: UserWithoutPassword | null;
};

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [formData, setFormData] = useState<Partial<CreateUserInput>>({
        email: '',
        firstName: '',
        lastName: '',
        oib: '',
        password: '',
        role: 'user',
        address: '',
        dateOfBirth: '',
        heightCm: 0,
        weightKg: 0,
        characteristics: '',
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                oib: user.oib,
                role: user.role as any,
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                heightCm: user.heightCm || 0,
                weightKg: user.weightKg || 0,
                characteristics: user.characteristics || '',
            });
        } else {
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                oib: '',
                password: '',
                role: 'user',
                address: '',
                dateOfBirth: '',
                heightCm: 0,
                weightKg: 0,
                characteristics: '',
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'heightCm' || name === 'weightKg' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const url = user ? `/api/users/${user.id}` : '/api/users';
            const method = user ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                onSave();
                onClose();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Greška pri spremanju korisnika');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{user ? 'Uredi korisnika' : 'Dodaj novog korisnika'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"> zatvori </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Osnovni podaci</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Lozinka</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Ime</label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Prezime</label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">OIB</label>
                        <input name="oib" value={formData.oib} onChange={handleChange} required maxLength={11} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Uloga</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg">
                            <option value="user" className="bg-slate-900">Korisnik</option>
                            <option value="admin" className="bg-slate-900">Administrator</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-4 mt-4">
                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Dodatni podaci</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Datum rođenja</label>
                        <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Adresa</label>
                        <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Visina (cm)</label>
                        <input name="heightCm" type="number" value={formData.heightCm} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Težina (kg)</label>
                        <input name="weightKg" type="number" step="0.1" value={formData.weightKg} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Karakteristike / Napomene</label>
                        <textarea name="characteristics" value={formData.characteristics} onChange={handleChange} rows={3} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg resize-none" />
                    </div>

                    {error && <div className="md:col-span-2 text-red-500 text-sm">{error}</div>}

                    <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary">Odustani</button>
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Spremanje...' : 'Spremi korisnika'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
