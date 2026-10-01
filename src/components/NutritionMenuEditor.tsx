'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MealDay, nutritionMenus } from '@/data/nutrition-menus';
import { NutritionPlan } from '@/lib/nutrition';
import { ApiResponse } from '@/types';

type MealKey = 'breakfast' | 'lunch' | 'dinner';
const meals: { key: MealKey; label: string }[] = [
    { key: 'breakfast', label: 'Doručak' },
    { key: 'lunch', label: 'Ručak' },
    { key: 'dinner', label: 'Večera' },
];

export default function NutritionMenuEditor({ userId, plan, initialDays, customized }: {
    userId: number;
    plan: NutritionPlan;
    initialDays: MealDay[];
    customized: boolean;
}) {
    const router = useRouter();
    const [days, setDays] = useState(initialDays);
    const [isCustomized, setIsCustomized] = useState(customized);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState('');

    function updateMeal(index: number, meal: MealKey, value: string) {
        setDays((current) => current.map((day, dayIndex) => dayIndex === index ? { ...day, [meal]: value } : day));
    }

    async function save() {
        setIsSaving(true);
        setNotice('');
        try {
            const response = await fetch('/api/admin/nutrition', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, plan, days }),
            });
            const result: ApiResponse<{ days: MealDay[] }> = await response.json();
            if (!response.ok || !result.success) throw new Error(result.success ? 'Spremanje nije uspjelo' : result.error);
            setDays(result.data.days);
            setIsCustomized(true);
            setIsEditing(false);
            setNotice('Jelovnik je spremljen za ovaj račun.');
            router.refresh();
        } catch (error) {
            setNotice(error instanceof Error ? error.message : 'Jelovnik nije spremljen.');
        } finally {
            setIsSaving(false);
        }
    }

    async function reset() {
        if (!window.confirm('Vratiti generički jelovnik? Spremljene izmjene za ovaj račun bit će uklonjene.')) return;
        setIsSaving(true);
        setNotice('');
        try {
            const response = await fetch(`/api/admin/nutrition?user=${userId}&plan=${plan}`, { method: 'DELETE' });
            const result: ApiResponse<{ reset: boolean }> = await response.json();
            if (!response.ok || !result.success) throw new Error(result.success ? 'Vraćanje nije uspjelo' : result.error);
            setDays(nutritionMenus[plan].days.map((day) => ({ ...day })));
            setIsCustomized(false);
            setIsEditing(false);
            setNotice('Vraćen je generički jelovnik.');
            router.refresh();
        } catch (error) {
            setNotice(error instanceof Error ? error.message : 'Jelovnik nije vraćen.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{isCustomized ? 'Uređeni jelovnik za ovaj račun' : 'Generički predložak'}</p>
                <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                        <>
                            <button type="button" disabled={isSaving} onClick={() => { setDays(initialDays); setIsEditing(false); setNotice(''); }} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Odustani</button>
                            <button type="button" disabled={isSaving} onClick={save} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">{isSaving ? 'Spremanje...' : 'Spremi promjene'}</button>
                        </>
                    ) : (
                        <>
                            {isCustomized && <button type="button" disabled={isSaving} onClick={reset} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Vrati generički</button>}
                            <button type="button" disabled={isSaving} onClick={() => { setIsEditing(true); setNotice(''); }} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">Uredi jelovnik</button>
                        </>
                    )}
                </div>
            </div>
            {notice && <p className="mb-4 rounded-xl border border-white/15 bg-white/5 p-3 text-sm" role="status">{notice}</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {days.map((day, index) => (
                    <article key={day.day} className="glass-card">
                        <h3 className="mb-4 border-b border-white/10 pb-3 text-lg font-semibold text-pink-200">{day.day}</h3>
                        <dl className="space-y-3 text-sm">
                            {meals.map(({ key, label }) => (
                                <div key={key}>
                                    <dt className="font-semibold text-slate-400">{label}</dt>
                                    <dd className="mt-1 whitespace-pre-line">
                                        {isEditing ? (
                                            <textarea
                                                aria-label={`${label} za ${day.day}`}
                                                value={day[key]}
                                                onChange={(event) => updateMeal(index, key, event.target.value)}
                                                maxLength={1000}
                                                rows={2}
                                                disabled={isSaving}
                                                className="w-full resize-y rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-pink-300 focus:outline-none disabled:opacity-50"
                                            />
                                        ) : (day[key] || '—')}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </article>
                ))}
            </div>
        </div>
    );
}
