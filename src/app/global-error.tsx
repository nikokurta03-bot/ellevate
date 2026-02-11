'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="hr">
      <body style={{ background: '#0f0a14', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Kritična greška</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Aplikacija je naišla na ozbiljan problem. Pokušajte osvježiti stranicu.
            </p>
            <button
              onClick={reset}
              style={{ padding: '0.75rem 1.5rem', background: '#f472b6', color: '#111', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Pokušaj ponovno
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
