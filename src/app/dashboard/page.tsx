'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import UserNav from '@/components/UserNav';
import { useAuth } from '@/context/AuthContext';
import { ApiResponse, TrainingSlotWithCount } from '@/types';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { hr } from 'date-fns/locale';

export default function UserDashboard() {
    const { user } = useAuth();
    const [slots, setSlots] = useState<TrainingSlotWithCount[]>([]);
    const [userReservations, setUserReservations] = useState<number[]>([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // 🚀 OPTIMIZACIJA: Memoizirani izračuni datuma
    const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
    const weekDays = useMemo(() => [...Array(5)].map((_, i) => addDays(weekStart, i)), [weekStart]);
    const timeRows = useMemo(() => ['09:00', '19:30', '20:30'], []);

    // 🚀 OPTIMIZACIJA: useCallback za stabilnu referencu
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 🚀 OPTIMIZACIJA: Paralelni API pozivi
            const fetchPromises: Promise<Response>[] = [
                fetch(`/api/slots?week=${weekOffset}`)
            ];

            if (user) {
                fetchPromises.push(fetch(`/api/reservations?userId=${user.id}&status=active`));
            }

            const responses = await Promise.all(fetchPromises);
            const [slotsData, resData] = await Promise.all(
                responses.map(r => r.json())
            );

            if (slotsData.success) {
                setSlots(slotsData.data);
            }

            if (user && resData?.success) {
                setUserReservations(resData.data.map((r: any) => r.slotId));
            }
        } catch (err) {
            console.error('Failed to fetch user dashboard data', err);
        } finally {
            setIsLoading(false);
        }
    }, [weekOffset, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 🚀 OPTIMIZACIJA: useCallback za handleBooking
    const handleBooking = useCallback(async (slotId: number) => {
        if (!user) return;
        setActionLoading(slotId);

        try {
            const isBooked = userReservations.includes(slotId);

            if (isBooked) {
                // Find the reservation ID to cancel
                const resRes = await fetch(`/api/reservations?userId=${user.id}&slotId=${slotId}&status=active`);
                const resData = await resRes.json();

                if (resData.success && resData.data.length > 0) {
                    const reservationId = resData.data[0].id;
                    const cancelRes = await fetch(`/api/reservations/${reservationId}`, { method: 'DELETE' });
                    const cancelResult = await cancelRes.json();

                    if (cancelResult.success) {
                        fetchData();
                    } else {
                        alert(cancelResult.error);
                    }
                }
            } else {
                const bookRes = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, slotId }),
                });
                const bookResult = await bookRes.json();

                if (bookResult.success) {
                    fetchData();
                } else {
                    alert(bookResult.error);
                }
            }
        } catch (err) {
            alert('Došlo je do greške.');
        } finally {
            setActionLoading(null);
        }
    }, [user, userReservations, fetchData]);

    return (
        <div className="min-h-screen">
            <UserNav />

            <main className="p-6 max-w-7xl mx-auto animate-fade-in">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Rezervirajte svoj termin</h1>
                            <p className="text-slate-400 max-w-lg">
                                Odaberite željeni termin za trening. Maksimalno 8 osoba po grupi.
                                Otkazivanje je moguće najkasnije 1 sat prije početka.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                                disabled={weekOffset === 0}
                                className="btn-secondary px-4 disabled:opacity-20"
                            > ← </button>
                            <div className="glass px-6 py-2 rounded-xl flex items-center font-medium bg-indigo-500/10 border-indigo-500/20">
                                {format(weekStart, 'd.M.')} - {format(addDays(weekStart, 4), 'd.M.yyyy.')}
                            </div>
                            <button onClick={() => setWeekOffset(prev => prev + 1)} className="btn-secondary px-4"> → </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {weekDays.map((day) => (
                        <div key={day.toString()} className="space-y-6">
                            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 sticky top-24 z-10 backdrop-blur-md">
                                <p className="text-indigo-400 font-bold uppercase text-sm tracking-widest">{format(day, 'EEEE', { locale: hr })}</p>
                                <p className="text-2xl font-bold">{format(day, 'd.M.')}</p>
                            </div>

                            <div className="space-y-4">
                                {timeRows.map((time) => {
                                    const slotDateStr = format(day, 'yyyy-MM-dd');
                                    const slot = slots.find(s =>
                                        format(new Date(s.date), 'yyyy-MM-dd') === slotDateStr && s.startTime === time
                                    );
                                    const isBooked = slot ? userReservations.includes(slot.id) : false;
                                    const isFull = slot ? slot.currentCount >= slot.maxCapacity : false;
                                    const isPast = slot ? new Date(`${slotDateStr}T${time}`) < new Date() : true;

                                    return (
                                        <div key={time} className={`glass-card p-4 flex flex-col gap-3 border ${isBooked ? 'border-indigo-500/40 bg-indigo-500/5' : ''
                                            } ${isPast ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold">{time}</span>
                                                {slot && (
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${isFull ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                                        }`}>
                                                        {slot.currentCount}/{slot.maxCapacity} MJESTA
                                                    </span>
                                                )}
                                            </div>

                                            {/* Prikaz rezerviranih korisnika */}
                                            {slot && slot.reservations && slot.reservations.length > 0 && (
                                                <div className="border-t border-white/10 pt-2">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Prijavljeni:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {slot.reservations.map((res) => (
                                                            <span
                                                                key={res.id}
                                                                className={`text-[10px] px-2 py-0.5 rounded-full ${user && res.user.id === user.id
                                                                        ? 'bg-indigo-500/30 text-indigo-300 font-semibold'
                                                                        : 'bg-white/5 text-slate-400'
                                                                    }`}
                                                            >
                                                                {res.user.firstName} {res.user.lastName.charAt(0)}.
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {slot ? (
                                                <button
                                                    onClick={() => handleBooking(slot.id)}
                                                    disabled={actionLoading === slot.id || (isFull && !isBooked)}
                                                    className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${isBooked
                                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                                        : isFull
                                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                                                        }`}
                                                >
                                                    {actionLoading === slot.id
                                                        ? 'Učitavanje...'
                                                        : isBooked
                                                            ? 'Otkaži rezervaciju'
                                                            : isFull
                                                                ? 'Popunjeno'
                                                                : 'Rezerviraj'}
                                                </button>
                                            ) : (
                                                <div className="py-2 text-center text-xs text-slate-600 italic">Nije dostupno</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
