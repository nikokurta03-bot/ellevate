import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card text-center max-w-md">
        <div className="text-6xl font-bold gradient-text mb-4">404</div>
        <h2 className="text-2xl font-bold mb-2">Stranica nije pronađena</h2>
        <p className="text-slate-400 mb-6 text-sm">
          Stranica koju tražite ne postoji ili je premještena.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
}
