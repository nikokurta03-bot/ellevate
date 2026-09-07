'use client';

import { useRef, useState } from 'react';

export default function EnquiryForm() {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const requestId = useRef<string | null>(null);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (sending) return;
        const data = new FormData(event.currentTarget);
        requestId.current ??= crypto.randomUUID();
        setSending(true);
        setError('');
        try {
            const response = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: data.get('firstName'), lastName: data.get('lastName'),
                    email: data.get('email'), phone: data.get('phone'), message: data.get('message'),
                    website: data.get('website'), requestId: requestId.current,
                }),
                signal: AbortSignal.timeout(25000),
            });
            const result = await response.json();
            if (response.ok && result.success) setSent(true);
            else setError(result.error || 'Upit nije poslan. Pokušajte ponovno.');
        } catch {
            setError('Nismo mogli potvrditi slanje. Provjerite vezu i pokušajte ponovno.');
        } finally {
            setSending(false);
        }
    }

    if (sent) return (
        <div role="status" className="glass-card text-center py-12">
            <h2 className="text-2xl font-bold mb-3">Hvala! Vaš upit je poslan.</h2>
            <p className="text-slate-300">Javit ćemo vam se s informacijama o članstvu i početku treninga.</p>
        </div>
    );

    const inputClass = 'w-full mt-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3';
    return (
        <form onSubmit={submit} onChange={() => { requestId.current = null; }} className="glass-card space-y-5">
            <fieldset disabled={sending} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                    <div><label htmlFor="enquiry-first-name">Ime *</label><input id="enquiry-first-name" name="firstName" autoComplete="given-name" required maxLength={80} className={inputClass} /></div>
                    <div><label htmlFor="enquiry-last-name">Prezime *</label><input id="enquiry-last-name" name="lastName" autoComplete="family-name" required maxLength={80} className={inputClass} /></div>
                </div>
                <div><label htmlFor="enquiry-email">E-mail *</label><input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} /></div>
                <div><label htmlFor="enquiry-phone">Broj telefona <span className="text-slate-400">(neobavezno)</span></label><input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} className={inputClass} /></div>
                <div><label htmlFor="enquiry-message">Poruka <span className="text-slate-400">(neobavezno)</span></label><textarea id="enquiry-message" name="message" rows={4} maxLength={2000} className={inputClass} placeholder="Što biste željeli saznati o treninzima?" /></div>
                <div className="hidden" aria-hidden="true"><label htmlFor="enquiry-website">Web stranica</label><input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
                <p className="text-sm text-slate-300">Podatke šaljemo administratorici studija kako bi vam odgovorila na upit. Ovaj obrazac ne kreira korisnički račun niti rezervira trening.</p>
                {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-red-300">{error}</p>}
                <button type="submit" disabled={sending} className="btn-primary w-full">{sending ? 'Slanje upita...' : 'Pošalji upit'}</button>
            </fieldset>
        </form>
    );
}
