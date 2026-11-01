import Link from 'next/link';

export default function LegalLinks({ className = '' }: { className?: string }) {
    return (
        <nav aria-label="Pravne informacije" className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
            <Link href="/privatnost" className="text-slate-300 hover:text-pink-300">Politika privatnosti</Link>
            <Link href="/impressum" className="text-slate-300 hover:text-pink-300">Impressum</Link>
        </nav>
    );
}
