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
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    // 🚀 OPTIMIZACIJA: Memoizirani izračuni datuma
    const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
    // Only Monday (0), Wednesday (2), Friday (4) - skip Tuesday and Thursday
    const weekDays = useMemo(() => [0, 2, 4].map((dayOffset) => addDays(weekStart, dayOffset)), [weekStart]);
    const timeRows = useMemo(() => ['09:00', '19:30', '20:30'], []);

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

    // Mobile: render a single selected day's slots
    const renderMobileSlotCard = (slot: TrainingSlotWithCount | undefined, time: string, day: Date) => {
        const slotDateStr = format(day, 'yyyy-MM-dd');

        if (!slot) {
            return (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-sm text-slate-600">
                    Nema termina
                </div>
            );
        }

        const isFull = slot.currentCount >= slot.maxCapacity;

        return (
            <div className={`p-4 rounded-xl border transition-all ${isFull
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                <div className="flex justify-between items-center mb-3">
                    <div className="bg-pink-300/20 text-pink-300 px-3 py-1 rounded-lg text-sm font-bold">
                        {time}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${isFull ? 'bg-red-500/30 text-red-400' : 'bg-emerald-500/30 text-emerald-400'}`}>
                        {slot.currentCount}/{slot.maxCapacity} polaznika
                    </span>
                </div>
                <div className="text-sm text-slate-300 font-medium mb-2">Grupni trening</div>
                <div className="text-xs text-slate-400">
                    {slot.reservations?.map(r => r.user.firstName).join(', ') || 'Nema prijava'}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <AdminNav />

            <main className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <header className="flex flex-col gap-4 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Tjedni raspored</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Pregled svih termina i prijavljenih korisnika</p>
                        </div>
                        {/* Week Navigation */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setWeekOffset(prev => prev - 1)} className="btn-secondary px-4 py-2 flex-1 sm:flex-none"> ← </button>
                            <div className="glass px-3 sm:px-6 py-2 rounded-xl flex items-center justify-center font-medium text-xs sm:text-base flex-1 sm:flex-none">
                                {format(weekStart, 'd.M.')} - {format(addDays(weekStart, 4), 'd.M.yyyy.')}
                            </div>
                            <button onClick={() => setWeekOffset(prev => prev + 1)} className="btn-secondary px-4 py-2 flex-1 sm:flex-none"> → </button>
                        </div>
                    </div>
                </header>

                <div className="glass-card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-lg sm:text-xl font-bold">Termini ({slots.length})</h2>
                        <button onClick={generateSlots} className="btn-primary text-sm py-2 w-full sm:w-auto">
                            Generiraj termine za ovaj tjedan
                        </button>
                    </div>

                    {/* Mobile: Day Tabs + Cards */}
                    <div className="md:hidden">
                        {/* Day Selector Tabs */}
                        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
                            {weekDays.map((day, index) => (
                                <button
                                    key={day.toString()}
                                    onClick={() => setSelectedDayIndex(index)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-center transition-all min-w-[70px] ${selectedDayIndex === index
                                        ? 'bg-pink-400 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="text-xs font-bold uppercase">{format(day, 'EEE', { locale: hr })}</div>
                                    <div className="text-sm font-medium">{format(day, 'd.M.')}</div>
                                </button>
                            ))}
                        </div>

                        {/* Selected Day's Slots */}
                        <div className="space-y-3">
                            {timeRows.map((time) => {
                                const day = weekDays[selectedDayIndex];
                                const slotDateStr = format(day, 'yyyy-MM-dd');
                                const slot = slots.find(s =>
                                    format(new Date(s.date), 'yyyy-MM-dd') === slotDateStr && s.startTime === time
                                );
                                return (
                                    <div key={time}>
                                        {renderMobileSlotCard(slot, time, day)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop: Grid Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <div className="min-w-[700px]">
                            {/* Header Days */}
                            <div className="grid grid-cols-[80px_repeat(3,1fr)] border-b border-white/10 pb-4">
                                <div className="text-slate-500 text-sm font-medium">Vrijeme</div>
                                {weekDays.map((day) => (
                                    <div key={day.toString()} className="text-center">
                                        <div className="text-sm font-bold uppercase tracking-wider text-pink-300">
                                            {format(day, 'EEEE', { locale: hr })}
                                        </div>
                                        <div className="text-xs text-slate-500">{format(day, 'd. MMMM', { locale: hr })}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Grid Rows */}
                            {timeRows.map((time) => (
                                <div key={time} className="grid grid-cols-[80px_repeat(3,1fr)] border-b border-white/5 py-4 items-center">
                                    <div className="text-base font-bold text-slate-300">{time}</div>
                                    {weekDays.map((day) => {
                                        const slotDateStr = format(day, 'yyyy-MM-dd');
                                        const slot = slots.find(s =>
                                            format(new Date(s.date), 'yyyy-MM-dd') === slotDateStr && s.startTime === time
                                        );

                                        return (
                                            <div key={day.toString()} className="px-1">
                                                {slot ? (
                                                    <div className={`p-2 rounded-xl border transition-all ${slot.currentCount >= slot.maxCapacity
                                                        ? 'bg-red-500/10 border-red-500/20'
                                                        : 'bg-emerald-500/10 border-emerald-500/20'
                                                        }`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[10px] font-bold text-white uppercase">Grupni</span>
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
                                                    <div className="p-2 rounded-xl border border-dashed border-white/5 text-center text-[10px] text-slate-600">
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
