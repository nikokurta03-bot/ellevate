import Link from 'next/link';
import type { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata: Metadata = {
    title: 'Upit za članstvo',
    description: 'Pošaljite upit Ellevate studiju i saznajte više o članstvu i grupnim treninzima.',
};

export default function JoinPage() {
    return (
        <div className="min-h-screen">
            <nav className="glass border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href="/" aria-label="Ellevate — početna"><BrandLogo /></Link>
                    <Link href="/" className="btn-secondary py-2">Povratak na početnu</Link>
                </div>
            </nav>
            <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Pridružite se <span className="gradient-text">Ellevate studiju</span></h1>
                <p className="text-slate-300 mb-8">Ispunite kratki obrazac i javit ćemo vam se s informacijama o članstvu i treninzima. Polja označena zvjezdicom su obavezna.</p>
                <EnquiryForm />
            </main>
        </div>
    );
}
