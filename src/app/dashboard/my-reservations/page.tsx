'use client';

import React, { useEffect, useState } from 'react';
import UserNav from '@/components/UserNav';
import { useAuth } from '@/context/AuthContext';
import { ApiResponse, ReservationWithDetails } from '@/types';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

export default function MyReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReservations = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/reservations?userId=${user.id}`);
            const result: ApiResponse<ReservationWithDetails[]> = await response.json();
            if (result.success) {
                setReservations(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch reservations', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [user]);

    const handleCancel = async (id: number) => {
        if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return;

        try {
            const response = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                fetchReservations();
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert('Greška pri otkazivanju');
        }
    };

    return (
        <div className="min-h-screen">
            <UserNav />

            <main className="p-6 max-w-4xl mx-auto animate-fade-in">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Moje rezervacije</h1>
                    <p className="text-slate-400">Pregled svih vaših prijava na treninge</p>
                </header>

                <div className="space-y-4">
                    {reservations.length > 0 ? (
                        reservations.map((res) => (
                            <div key={res.id} className={`glass-card flex flex-col md:flex-row justify-between items-center gap-6 ${res.status === 'cancelled' ? 'opacity-50 grayscale' : ''
                                }`}>
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="bg-pink-300/20 p-4 rounded-2xl text-center min-w-[100px]">
                                        <p className="text-xs font-bold text-pink-300 uppercase">{format(new Date(res.slot.date), 'EEE', { locale: hr })}</p>
                                        <p className="text-2xl font-bold">{format(new Date(res.slot.date), 'd.M.')}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold">{res.slot.startTime} - {res.slot.endTime}</h3>
                                        <p className="text-slate-400 text-sm">Grupni trening snage</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${res.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'
                                                }`}>
                                                {res.status === 'active' ? 'AKTIVNO' : 'OTKAZANO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto">
                                    {res.status === 'active' && (
                                        <button
                                            onClick={() => handleCancel(res.id)}
                                            className="btn-danger w-full md:w-auto"
                                        >
                                            Otkaži trening
                                        </button>
                                    )}
                                    {res.status === 'cancelled' && (
                                        <div className="text-slate-500 text-sm italic">
                                            Otkazano {res.cancelledAt ? format(new Date(res.cancelledAt), 'd.M. HH:mm') : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card p-12 text-center text-slate-500">
                            {isLoading ? 'Učitavanje rezervacija...' : 'Nemate aktivnih rezervacija.'}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
