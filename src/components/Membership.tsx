'use client';

import React, { useEffect, useRef, useState } from 'react';
import { studioDateKey } from '@/lib/booking-time';
import {
    adminStatusLabel,
    isRealIsoDate,
    membershipCopy,
    membershipSummary,
    toDateOnly,
    type MembershipStatus,
} from '@/lib/membership';
import type { UserWithoutPassword } from '@/types';
import { useToast } from '@/components/Toasts';

const STATUS_TEXT: Record<MembershipStatus, string> = {
    missing: 'text-slate-400',
    active: 'text-emerald-300',
    due_soon: 'text-amber-200',
    overdue: 'text-red-300',
};

const CARD_TONE = {
    neutral: 'bg-white/5 border-white/10',
    ok: 'bg-emerald-500/10 border-emerald-400/40',
    soon: 'bg-amber-500/15 border-amber-300/50',
    overdue: 'bg-red-500/15 border-red-400/50',
};

export function membershipRowClass(role: string, paidOn: Date | string | null | undefined): string {
    if (role === 'admin') return '';
    const status = membershipSummary(paidOn).status;
    if (status === 'overdue') return 'bg-red-500/15';
    if (status === 'due_soon') return 'bg-amber-500/15';
    return '';
}

export function MembershipStatusText({
    paidOn,
    role = 'user',
}: {
    paidOn: Date | string | null | undefined;
    role?: string;
}) {
    const summary = membershipSummary(paidOn);
    if (role === 'admin' && summary.status === 'missing') {
        return null;
    }

    return (
        <p className={`text-xs mt-1 leading-relaxed ${STATUS_TEXT[summary.status]}`}>
            <span className="font-semibold">{adminStatusLabel(summary.status)}</span>
            {summary.paidOnLabel && <> · Plaćeno: {summary.paidOnLabel}</>}
            {summary.validUntilLabel && (
                <> · {summary.status === 'overdue' ? 'Vrijedila do' : 'Vrijedi do'}: {summary.validUntilLabel}</>
            )}
        </p>
    );
}

export function MembershipDateInput({
    id,
    value,
    onChange,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1">
                Datum upisa / plaćanja članarine
            </label>
            <input
                id={id}
                name="membershipPaidOn"
                type="date"
                max={studioDateKey()}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-white/5 border border-white/10 p-2 rounded-lg"
            />
            <p className="text-xs text-slate-500 mt-1">
                Članarina vrijedi jedan kalendarski mjesec od ovog datuma. Prazno polje znači da datum još nije unesen.
            </p>
            <MembershipStatusText paidOn={value || null} />
        </div>
    );
}

export function MembershipInlineEditor({
    user,
    onUpdated,
}: {
    user: UserWithoutPassword;
    onUpdated: (user: UserWithoutPassword) => void;
}) {
    const { error } = useToast();
    const saved = toDateOnly(user.membershipPaidOn) ?? '';
    const [value, setValue] = useState(saved);
    const [saving, setSaving] = useState(false);
    const requestId = useRef(0);

    useEffect(() => {
        setValue(saved);
    }, [saved]);

    async function commit(next: string) {
        if (next === saved) return;
        const id = ++requestId.current;
        setSaving(true);
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ membershipPaidOn: next }),
            });
            const result = await response.json();
            if (id !== requestId.current) return;
            if (result.success) {
                onUpdated(result.data);
            } else {
                setValue(saved);
                error(result.error || 'Greška pri spremanju datuma članarine');
            }
        } catch {
            if (id !== requestId.current) return;
            setValue(saved);
            error('Greška pri spremanju datuma članarine');
        } finally {
            if (id === requestId.current) setSaving(false);
        }
    }

    return (
        <div className="min-w-[12rem]">
            <label htmlFor={`membership-${user.id}`} className="block text-xs font-medium text-slate-400 mb-1">
                Datum upisa / plaćanja
            </label>
            <input
                id={`membership-${user.id}`}
                type="date"
                max={studioDateKey()}
                value={value}
                onChange={(event) => {
                    const next = event.target.value;
                    setValue(next);
                    if (isRealIsoDate(next)) void commit(next);
                }}
                onBlur={(event) => {
                    void commit(event.currentTarget.value);
                }}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg text-sm"
            />
            <MembershipStatusText paidOn={value || null} role={user.role} />
            {saving && <p className="text-[11px] text-slate-500 mt-1">Spremanje...</p>}
        </div>
    );
}

export function MembershipCard({ paidOn }: { paidOn: Date | string | null | undefined }) {
    const [current, setCurrent] = useState<Date | string | null | undefined>(paidOn);

    useEffect(() => {
        setCurrent(paidOn);
    }, [paidOn]);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal })
            .then((response) => response.json())
            .then((data) => {
                if (data?.success) setCurrent(data.data?.membershipPaidOn ?? null);
            })
            .catch(() => {
                // Keep the date already loaded with the session.
            });
        return () => controller.abort();
    }, []);

    const copy = membershipCopy(membershipSummary(current));

    return (
        <section aria-label="Članarina" className={`mb-6 rounded-2xl border p-5 sm:p-6 ${CARD_TONE[copy.tone]}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2">{copy.title}</h2>
            <p className="text-lg sm:text-xl font-semibold">{copy.primary}</p>
            {copy.secondary && <p className="text-sm text-slate-300 mt-1">{copy.secondary}</p>}
        </section>
    );
}
