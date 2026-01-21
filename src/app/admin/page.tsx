'use client';

import React, { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { ApiResponse, TrainingSlotWithCount } from '@/types';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

export default function AdminDashboard() {
    const [slots, setSlots] = useState<TrainingSlotWithCount[]>([]);
    const [userCount, setUserCount] = useState(0);
    const [reservationCount, setReservationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch today's slots
                const today = format(new Date(), 'yyyy-MM-dd');
                const slotsRes = await fetch(`/api/slots?date=${today}`);
                const slotsData: ApiResponse<TrainingSlotWithCount[]> = await slotsRes.json();

                if (slotsData.success) {
                    setSlots(slotsData.data);
                }

                // Fetch basic stats
                const usersRes = await fetch('/api/users');
                const usersData = await usersRes.json();
                if (usersData.success) {
                    setUserCount(usersData.data.length);
                }

                const resRes = await fetch('/api/reservations?status=active');
                const resData = await resRes.json();
                if (resData.success) {
                    setReservationCount(resData.data.length);
                }

            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen">
            <AdminNav />

            <main className="p-6 max-w-7xl mx-auto">
                <header className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold mb-2">Dobrodošli natrag, Admin</h1>
                    <p className="text-slate-400">Pregled aktivnosti za {format(new Date(), 'EEEE, d. MMMM yyyy.', { locale: hr })}</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card animate-fade-in delay-100">
                        <p className="text-slate-400 text-sm mb-1">Ukupno korisnika</p>
                        <p className="text-4xl font-bold">{userCount}</p>
                        <div className="mt-4 text-emerald-400 text-xs flex items-center gap-1">
                            <span>Aktivni članovi sustava</span>
                        </div>
                    </div>
                    <div className="glass-card animate-fade-in delay-200">
                        <p className="text-slate-400 text-sm mb-1">Aktivne rezervacije</p>
                        <p className="text-4xl font-bold">{reservationCount}</p>
                        <div className="mt-4 text-indigo-400 text-xs flex items-center gap-1">
                            <span>Ukupno prijavljenih polaznika</span>
                        </div>
                    </div>
                    <div className="glass-card animate-fade-in delay-300">
                        <p className="text-slate-400 text-sm mb-1">Današnji termini</p>
                        <p className="text-4xl font-bold">{slots.length}</p>
                        <div className="mt-4 text-amber-400 text-xs flex items-center gap-1">
                            <span>Planirani treninzi za danas</span>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <section className="animate-fade-in delay-300">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        Današnji raspored
                        {isLoading && <span className="text-sm font-normal text-slate-500 animate-pulse">(učitavanje...)</span>}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {slots.length > 0 ? (
                            slots.map((slot) => (
                                <div key={slot.id} className="glass-card flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-sm font-bold">
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${slot._count.reservations >= slot.maxCapacity
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {slot._count.reservations} / {slot.maxCapacity} polaznika
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <p className="text-slate-300 font-medium">Grupni trening snage</p>
                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${(slot._count.reservations / slot.maxCapacity) > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${(slot._count.reservations / slot.maxCapacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button className="btn-secondary w-full text-sm">
                                        Pogledaj polaznike
                                    </button>
                                </div>
                            ))
                        ) : !isLoading && (
                            <div className="col-span-full glass-card p-12 text-center text-slate-500">
                                Nema planiranih termina za danas.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
