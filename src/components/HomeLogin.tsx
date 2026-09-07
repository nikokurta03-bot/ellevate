'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { ApiResponse, UserWithoutPassword } from '@/types';

const LoginContext = createContext<() => void>(() => {});

export function LoginButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const open = useContext(LoginContext);
  return <button type="button" onClick={open} className={className}>{children}</button>;
}

export function LoginProvider({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <LoginContext.Provider value={() => setShowLogin(true)}>
      {children}
      {showLogin && <LoginDialog onClose={() => setShowLogin(false)} />}
    </LoginContext.Provider>
  );
}

function LoginDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
        signal: AbortSignal.timeout(15000),
      });
      const result: ApiResponse<{ user: UserWithoutPassword }> = await response.json();
      if (result.success) {
        login(result.data.user);
        router.push(result.data.user.role === 'admin' ? '/admin' : '/dashboard');
        onClose();
      } else {
        setError(result.error);
      }
    } catch {
      setError('Prijava nije uspjela. Provjerite vezu i pokušajte ponovno.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="login-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-white/10 bg-[#17101d] p-6 text-slate-100 backdrop:bg-black/60">
      <button type="button" onClick={onClose} aria-label="Zatvori prijavu" className="absolute top-2 right-2 h-11 w-11 text-slate-400 hover:text-white">✕</button>
      <div className="text-center mb-6 mt-4">
        <h2 id="login-title" className="text-2xl font-bold">Dobrodošli natrag</h2>
        <p className="text-slate-400 text-sm mt-1">Prijavite se za pristup rezervacijama</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1">Email adresa</label>
          <input id="login-email" name="email" type="email" autoComplete="username" required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" placeholder="vas@email.com" />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1">Lozinka</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" placeholder="••••••••" />
        </div>
        {error && <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">{error}</div>}
        <button type="submit" disabled={isLoading} className="w-full btn-primary">
          {isLoading ? 'Prijava u tijeku...' : 'Prijavi se'}
        </button>
      </form>
    </dialog>
  );
}
