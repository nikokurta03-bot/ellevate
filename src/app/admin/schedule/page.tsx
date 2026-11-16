'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { useToast } from '@/components/Toasts';
import { TrainingSlotWithCount } from '@/types';
import { dateKey, studioToday, weekDates } from '@/lib/schedule';
import { trainingStart } from '@/lib/booking-time';

type Member = { id: number; firstName: string; lastName: string; email: string };
type Day = { date: string; isClosed: boolean };
const dayLabel = (date: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('hr-HR', { ...options, timeZone: 'UTC' }).format(new Date(date));

export default function AdminSchedule() {
    const { success, error } = useToast();
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState((new Date(`${studioToday()}T00:00:00Z`).getUTCDay() + 6) % 7);
    const [slots, setSlots] = useState<TrainingSlotWithCount[]>([]);
    const [days, setDays] = useState<Day[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [busy, setBusy] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [memberId, setMemberId] = useState('');
    const dates = useMemo(() => weekDates(weekOffset), [weekOffset]);
    const date = dates[selectedDay];
    const daySlots = slots.filter(slot => dateKey(slot.date) === date);
    const closed = days.find(day => dateKey(day.date) === date)?.isClosed ?? false;
    const past = date < studioToday();
    const refresh = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setLoadError('');
        try {
            const results = await Promise.all([
                fetch(`/api/slots?week=${weekOffset}`, { signal, cache: 'no-store' }),
                fetch(`/api/days?week=${weekOffset}`, { signal, cache: 'no-store' }),
                fetch('/api/users?role=user', { signal, cache: 'no-store' }),
            ].map(async response => (await response).json()));
            if (signal?.aborted) return;
            const failure = results.find(result => !result.success);
            if (failure) throw new Error(failure.error);
            setSlots(results[0].data);
            setDays(results[1].data);
            setMembers(results[2].data.sort((a: Member, b: Member) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'hr')));
        } catch (cause) {
            if (!signal?.aborted) setLoadError(cause instanceof Error ? cause.message : 'Raspored nije učitan. Pokušajte ponovno.');
        } finally { if (!signal?.aborted) setLoading(false); }
    }, [weekOffset]);

    useEffect(() => {
        const controller = new AbortController();
        void refresh(controller.signal);
        return () => controller.abort();
    }, [refresh]);

    async function mutate(url: string, method: string, body: unknown, message: string) {
        if (busy) return;
        setBusy(true);
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Promjena nije spremljena');
            success(message);
            setMemberId('');
            await refresh();
        } catch (cause) {
            error(cause instanceof Error ? cause.message : 'Promjena nije spremljena');
            await refresh();
        } finally { setBusy(false); }
    }

    function toggleDay() {
        if (!closed && daySlots.length > 0 && !confirm('Zatvoriti ovaj dan za treninge? Postojeće prijave ostat će sačuvane i bit će ponovno dostupne nakon otvaranja dana.')) return;
        void mutate('/api/days', 'PATCH', { date, isClosed: daySlots.length > 0 && !closed }, closed ? 'Dan je otvoren.' : 'Dan je zatvoren. Prijave su sačuvane.');
    }

    return <div className="min-h-screen">
        <AdminNav />
        <main id="main-content" tabIndex={-1} className="p-4 sm:p-6 max-w-7xl mx-auto">
            <header className="mb-6 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Tjedni raspored</h1>
                <p className="text-slate-300">Otvorite ili zatvorite dan i upravljajte polaznicama pojedinog termina.</p>
                <div className="flex items-center gap-2">
                    <button aria-label="Prethodni tjedan" disabled={busy} onClick={() => { setWeekOffset(value => value - 1); setExpanded(null); }} className="btn-secondary px-4 min-h-[44px]">←</button>
                    <p className="flex-1 text-center text-sm font-medium">{dayLabel(dates[0], { day: 'numeric', month: 'numeric' })} – {dayLabel(dates[6], { day: 'numeric', month: 'numeric', year: 'numeric' })}</p>
                    <button aria-label="Sljedeći tjedan" disabled={busy} onClick={() => { setWeekOffset(value => value + 1); setExpanded(null); }} className="btn-secondary px-4 min-h-[44px]">→</button>
                </div>
                <button className="btn-primary min-h-[44px] w-full sm:w-auto" disabled={busy || loading || !!loadError} onClick={() => void mutate('/api/slots', 'POST', { weekOffset }, 'Raspored je dopunjen. Zatvoreni dani ostaju zatvoreni.')}>
                    Generiraj termine za ovaj tjedan
                </button>
            </header>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4" aria-label="Odabir dana">
                {dates.map((value, index) => <button key={value} aria-pressed={index === selectedDay} disabled={busy} onClick={() => { setSelectedDay(index); setExpanded(null); setMemberId(''); }} className={`shrink-0 rounded-xl px-4 py-3 min-h-[44px] ${index === selectedDay ? 'bg-pink-300 text-gray-900' : 'bg-white/5 text-slate-300'}`}>
                    <span className="block font-bold">{dayLabel(value, { weekday: 'short' })}</span>
                    <span className="block text-sm">{dayLabel(value, { day: 'numeric', month: 'numeric' })}</span>
                </button>)}
            </div>
            {loading ? <p role="status">Učitavanje rasporeda…</p> : loadError ? <div role="alert" className="glass-card"><p>{loadError}</p><button className="btn-secondary mt-3" onClick={() => void refresh()}>Pokušaj ponovno</button></div> : <>
                <section className="glass-card mb-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{dayLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                        <p className={`mt-1 text-sm ${closed ? 'text-amber-300' : 'text-slate-300'}`}>{closed ? 'Dan je zatvoren — treninzi se ne održavaju. Prijave su sačuvane.' : daySlots.length ? 'Dan je otvoren za treninge.' : 'Za ovaj dan nema termina. Otvaranje dodaje svih pet termina.'}</p>
                    </div>
                    {!past && <div className="flex flex-col gap-2 shrink-0">
                        <button disabled={busy} className="btn-secondary min-h-[44px]" onClick={toggleDay}>{closed || daySlots.length === 0 ? 'Otvori dan' : 'Zatvori dan'}</button>
                        {!closed && daySlots.length === 0 && <button disabled={busy} className="btn-secondary min-h-[44px]" onClick={() => void mutate('/api/days', 'PATCH', { date, isClosed: true }, 'Dan je zatvoren i neće se generirati termini.')}>Zatvori dan</button>}
                    </div>}
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                    {daySlots.map(slot => {
                        const full = slot.currentCount >= slot.maxCapacity;
                        const started = trainingStart(slot.date, slot.startTime) <= new Date();
                        const available = members.filter(member => !slot.reservations?.some(reservation => reservation.userId === member.id));
                        return <section key={slot.id} className="glass-card min-w-0">
                            <div className="flex justify-between items-center gap-2 mb-3">
                                <h3 className="text-lg font-bold">{slot.startTime} – {slot.endTime}</h3>
                                <span className={`text-sm rounded-lg px-2 py-1 ${closed ? 'bg-amber-500/10 text-amber-300' : full ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{slot.currentCount}/{slot.maxCapacity}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-4">{slot.reservations?.map(reservation => `${reservation.user.firstName} ${reservation.user.lastName}`).join(', ') || 'Nema prijavljenih polaznica.'}</p>
                            <button className="btn-secondary w-full min-h-[44px]" aria-expanded={expanded === slot.id} disabled={busy} onClick={() => { setExpanded(expanded === slot.id ? null : slot.id); setMemberId(''); }}>Upravljaj polaznicama</button>
                            {expanded === slot.id && <div className="mt-4 border-t border-white/10 pt-3 space-y-3">
                                <ul className="space-y-2">{slot.reservations?.map(reservation => <li key={reservation.id} className="flex gap-2 items-center justify-between text-sm">
                                    <span className="break-words min-w-0">{reservation.user.firstName} {reservation.user.lastName}</span>
                                    <button disabled={busy} className="shrink-0 text-red-300 underline px-2 min-h-[44px]" aria-label={`Ukloni ${reservation.user.firstName} ${reservation.user.lastName}`} onClick={() => {
                                        if (confirm(`Ukloniti ${reservation.user.firstName} ${reservation.user.lastName} s termina u ${slot.startTime}?`)) void mutate(`/api/reservations/${reservation.id}`, 'DELETE', undefined, 'Polaznica je uklonjena s termina.');
                                    }}>Ukloni</button>
                                </li>)}</ul>
                                {closed || started || full ? <p className="text-sm text-slate-300">{closed ? 'Za dodavanje polaznica najprije otvorite dan.' : started ? 'Termin je već počeo.' : 'Termin je popunjen.'}</p> : <>
                                    <label htmlFor={`member-${slot.id}`} className="block text-sm">Dodaj polaznicu</label>
                                    <select id={`member-${slot.id}`} className="w-full min-w-0 rounded-xl bg-slate-900 border border-white/20 p-3 text-base" value={memberId} disabled={busy} onChange={event => setMemberId(event.target.value)}>
                                        <option value="">Odaberite polaznicu</option>
                                        {available.map(member => <option key={member.id} value={member.id}>{member.firstName} {member.lastName} ({member.email})</option>)}
                                    </select>
                                    <button className="btn-primary w-full min-h-[44px]" disabled={busy || !memberId} onClick={() => void mutate('/api/reservations', 'POST', { userId: Number(memberId), slotId: slot.id }, 'Polaznica je dodana na termin.')}>Dodaj na termin</button>
                                </>}
                            </div>}
                        </section>;
                    })}
                </div>
            </>}
        </main>
    </div>;
}
