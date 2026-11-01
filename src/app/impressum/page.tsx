import Link from 'next/link';
import type { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
import LegalLinks from '@/components/LegalLinks';

export const metadata: Metadata = {
    title: 'Impressum',
    description: 'Kontakt i podaci o Ellevate studiju u Zadru.',
};

export default function ImpressumPage() {
    return (
        <div className="min-h-screen">
            <nav className="glass border-b border-white/10">
                <div className="max-w-3xl mx-auto px-4 min-h-20 py-3 flex flex-wrap gap-3 items-center justify-between">
                    <Link href="/" aria-label="Ellevate — početna"><BrandLogo /></Link>
                    <Link href="/" className="btn-secondary py-2 text-sm">Povratak na početnu</Link>
                </div>
            </nav>
            <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-6 text-slate-300 leading-relaxed">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Impressum</h1>
                <p>Ellevate — grupni treninzi za žene</p>
                <p>Zadar, Hrvatska</p>
                <p>
                    E-mail:{' '}
                    <a className="text-pink-300 hover:underline" href="mailto:info@ellevate.hr">info@ellevate.hr</a>
                </p>
                <p>
                    Naziv pravnog subjekta, točna adresa sjedišta i OIB nisu upisani u aplikaciju. Te podatke studio šalje
                    na zahtjev putem navedenog e-maila, a na ovoj stranici trebaju biti objavljeni čim ih vlasnik potvrdi.
                </p>
                <LegalLinks />
            </main>
        </div>
    );
}
