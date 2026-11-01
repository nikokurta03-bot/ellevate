'use client';
import { useEffect, useState } from 'react';
import { displayDate, nextPaymentDate, validDate, type MembershipDates } from '@/lib/membership';
import { studioDateKey } from '@/lib/booking-time';

export default function MembershipCard({ userId, editable = false }: { userId?: number; editable?: boolean }) {
    const [data, setData] = useState<MembershipDates | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [failed, setFailed] = useState(false);
    const url = `/api/membership${userId ? `?userId=${userId}` : ''}`;
    useEffect(() => {
        const controller = new AbortController();
        fetch(url, { signal: controller.signal, cache: 'no-store' }).then(r => r.json()).then(r => {
            if (!r.success) throw new Error();
            setData(r.data);
        }).catch(() => { if (!controller.signal.aborted) setFailed(true); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [url]);
    async function save() {
        if (!data || saving) return;
        setSaving(true); setMessage('');
        try {
            const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            setData(result.data); setMessage('Datumi su spremljeni.');
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Spremanje nije uspjelo.'); }
        finally { setSaving(false); }
    }
    const due = data && validDate(data.lastPaidOn) ? nextPaymentDate(data.lastPaidOn) : '';
    return <section className="glass-card mb-6 min-w-0" aria-label="Članstvo i uplate">
        <h2 className="text-xl font-bold mb-4">Članstvo i uplate</h2>
        {loading ? <p role="status">Učitavanje...</p> : failed ? <p role="alert">Podaci nisu dostupni. Osvježite stranicu i pokušajte ponovno.</p> : editable ? <>
            <div className="grid gap-4 sm:grid-cols-2">
                {([['joinedOn', 'Datum upisa'], ['firstPaidOn', 'Datum prve uplate'], ['lastPaidOn', 'Datum zadnje uplate']] as const).map(([key, label]) => <label key={key} className="block min-w-0 text-sm">
                    {label}
                    <input type="date" value={data?.[key] || ''} max={studioDateKey()} disabled={saving}
                        onChange={e => { const value = e.target.value; setMessage(''); setData(previous => {
                            const updated = { joinedOn: '', firstPaidOn: '', lastPaidOn: '', dueOn: '', ...previous, [key]: value };
                            if (key === 'firstPaidOn' && !updated.lastPaidOn) updated.lastPaidOn = value;
                            return updated;
                        }); }}
                        className="block mt-2 w-full min-w-0 max-w-full min-h-12 rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-base [color-scheme:dark]" />
                </label>)}
            </div>
            <p className="mt-4">Sljedeća uplata: <strong>{due ? displayDate(due) : 'Unesite datum uplate'}</strong></p>
            <p className="text-sm text-slate-300 mt-2">Nakon nove uplate ažurirajte datum zadnje uplate. Podsjetnik se šalje e-mailom dan prije roka.</p>
            <button type="button" onClick={save} disabled={saving || !data || ![data.joinedOn, data.firstPaidOn, data.lastPaidOn].every(validDate)} className="btn-primary mt-4 w-full">{saving ? 'Spremanje...' : 'Spremi datume uplata'}</button>
            <p role="status" className="mt-2 text-sm">{message}</p>
        </> : data ? <>
            <dl className="grid gap-4 sm:grid-cols-2">
                {([['Datum upisa', data.joinedOn], ['Prva uplata', data.firstPaidOn], ['Zadnja uplata', data.lastPaidOn], ['Sljedeća uplata', data.dueOn]]).map(([label, value]) => <div key={label}><dt className="text-sm text-slate-300">{label}</dt><dd className="font-semibold mt-1">{displayDate(value)}</dd></div>)}
            </dl>
            <p className="text-sm text-slate-300 mt-4">Za evidenciju uplata obratite se Matei. E-mail podsjetnik šaljemo dan prije roka.</p>
        </> : <p className="text-slate-300">Matea još nije unijela datume upisa i uplate.</p>}
    </section>;
}
