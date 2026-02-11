'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card text-center max-w-md">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-2xl font-bold mb-2">Nešto je pošlo po krivu</h2>
        <p className="text-slate-400 mb-6 text-sm">
          Došlo je do neočekivane greške. Pokušajte ponovno ili se vratite na početnu stranicu.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Pokušaj ponovno
          </button>
          <a href="/" className="btn-secondary">
            Početna
          </a>
        </div>
      </div>
    </div>
  );
}
