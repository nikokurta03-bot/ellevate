import Link from 'next/link';
import type { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
import LegalLinks from '@/components/LegalLinks';

export const metadata: Metadata = {
    title: 'Politika privatnosti',
    description: 'Kako Ellevate obrađuje osobne podatke iz upita, članstva i rezervacija.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen">
            <nav className="glass border-b border-white/10">
                <div className="max-w-3xl mx-auto px-4 min-h-20 py-3 flex flex-wrap gap-3 items-center justify-between">
                    <Link href="/" aria-label="Ellevate — početna"><BrandLogo /></Link>
                    <Link href="/" className="btn-secondary py-2 text-sm">Povratak na početnu</Link>
                </div>
            </nav>
            <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-6 text-slate-300 leading-relaxed">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Politika privatnosti</h1>
                <p>
                    Ellevate je studio grupnih treninga u Zadru. Za pitanja o osobnim podacima pišite na{' '}
                    <a className="text-pink-300 hover:underline" href="mailto:info@ellevate.hr">info@ellevate.hr</a>.
                    Podatke ne prodajemo i ne koristimo za oglašavanje.
                </p>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Upit za članstvo</h2>
                    <p>
                        Obrazac na stranici za pridruživanje šalje ime, prezime, e-mail te, ako ih upišete, telefon i poruku.
                        Svrha je odgovor na upit. Poruka stiže na info@ellevate.hr. Obrazac ne otvara račun i ne rezervira trening.
                    </p>
                </section>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Račun i rezervacije</h2>
                    <p>
                        Račun otvara administratorica studija. Čuvamo ime, prezime, e-mail, sažetak lozinke i, ako su uneseni,
                        OIB, adresu, datum rođenja, visinu, težinu, napomenu i datum plaćanja članarine. Rezervacije povezuju
                        račun s terminom treninga. Članice na rasporedu vide imena prijavljenih osoba u istoj grupi.
                    </p>
                </section>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Kolačić za prijavu</h2>
                    <p>
                        Nakon prijave preglednik dobije kolačić <span className="text-white">ellevate_token</span>. Dostupan je
                        samo poslužitelju, vrijedi sedam dana i služi da vas prepozna na stranicama rasporeda i administracije.
                        Stranica ne postavlja marketinške kolačiće.
                    </p>
                </section>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Vaša prava</h2>
                    <p>
                        Možete zatražiti pristup, ispravak ili brisanje podataka na info@ellevate.hr. Ako smatrate da je obrada
                        nepravilna, možete se obratiti Agenciji za zaštitu osobnih podataka.
                    </p>
                </section>
                <LegalLinks />
            </main>
        </div>
    );
}
