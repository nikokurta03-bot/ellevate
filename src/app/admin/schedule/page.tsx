'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AdminNav from '@/components/AdminNav';
import { ApiResponse, TrainingSlotWithCount } from '@/types';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { hr } from 'date-fns/locale';

export default function AdminSchedulePage() {
    const [slots, setSlots] = useState<TrainingSlotWithCount[]>([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // 🚀 OPTIMIZACIJA: Memoizirani izračuni datuma
    const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
    const weekDays = useMemo(() => [...Array(5)].map((_, i) => addDays(weekStart, i)), [weekStart]);
    const timeRows = useMemo(() => ['08:00', '09:00', '18:00', '19:00', '20:00'], []);

    // 🚀 OPTIMIZACIJA: useCallback za stabilnu referencu
    const fetchSlots = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/slots?week=${weekOffset}`);
            const result: ApiResponse<TrainingSlotWithCount[]> = await response.json();
            if (result.success) {
                setSlots(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch schedule', err);
        } finally {
            setIsLoading(false);
        }
    }, [weekOffset]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // 🚀 OPTIMIZACIJA: useCallback za generateSlots
    const generateSlots = useCallback(async () => {
        if (!confirm('Želite li generirati termine za ovaj tjedan?')) return;

        try {
            const response = await fetch('/api/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weekOffset }),
            });
            const result = await response.json();
            if (result.success) {
                alert(result.data.message);
                fetchSlots();
            }
        } catch (err) {
            alert('Greška pri generiranju termina');
        }
    }, [weekOffset, fetchSlots]);

    return (
        <div className="min-h-screen">
            <AdminNav />

            <main className="p-6 max-w-7xl mx-auto animate-fade-in">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Tjedni raspored</h1>
                        <p className="text-slate-400">Pregled svih termina i prijavljenih korisnika</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setWeekOffset(prev => prev - 1)} className="btn-secondary px-4"> ← </button>
                        <div className="glass px-6 py-2 rounded-xl flex items-center font-medium">
                            Tjedan {format(weekStart, 'd.M.')} - {format(addDays(weekStart, 4), 'd.M.yyyy.')}
                        </div>
                        <button onClick={() => setWeekOffset(prev => prev + 1)} className="btn-secondary px-4"> → </button>
                    </div>
                </header>

                <div className="glass-card overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Termini ({slots.length})</h2>
                        <button onClick={generateSlots} className="btn-primary text-sm py-2">
                            Generiraj termine za ovaj tjedan
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header Days */}
                            <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-white/10 pb-4">
                                <div className="text-slate-500 text-sm font-medium">Vrijeme</div>
                                {weekDays.map((day) => (
                                    <div key={day.toString()} className="text-center">
                                        <div className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                                            {format(day, 'EEEE', { locale: hr })}
                                        </div>
                                        <div className="text-xs text-slate-500">{format(day, 'd. MMMM', { locale: hr })}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Grid Rows */}
                            {timeRows.map((time) => (
                                <div key={time} className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-white/5 py-6 items-center">
                                    <div className="text-lg font-bold text-slate-300">{time}</div>
                                    {weekDays.map((day) => {
                                        const slotDateStr = format(day, 'yyyy-MM-dd');
                                        const slot = slots.find(s =>
                                            format(new Date(s.date), 'yyyy-MM-dd') === slotDateStr && s.startTime === time
                                        );

                                        return (
                                            <div key={day.toString()} className="px-2">
                                                {slot ? (
                                                    <div className={`p-3 rounded-xl border transition-all ${slot.currentCount >= slot.maxCapacity
                                                        ? 'bg-red-500/10 border-red-500/20'
                                                        : 'bg-emerald-500/10 border-emerald-500/20'
                                                        }`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-white uppercase">Grupni</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${slot.currentCount >= slot.maxCapacity ? 'bg-red-500/40 text-white' : 'bg-emerald-500/40 text-white'
                                                                }`}>
                                                                {slot.currentCount}/{slot.maxCapacity}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 truncate">
                                                            {slot.reservations?.map(r => r.user.firstName).join(', ') || 'Nema prijava'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 rounded-xl border border-dashed border-white/5 text-center text-[10px] text-slate-600">
                                                        Nema termina
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
