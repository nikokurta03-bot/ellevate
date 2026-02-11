'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiResponse } from '@/types';
import { blogArticles } from '@/data/blog-articles';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<{ user: any }> = await response.json();

      if (result.success) {
        login(result.data.user);
        if (result.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Nešto je pošlo po zlu. Pokušajte ponovno.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/ellevate_logo.png"
                alt="Ellevate"
                width={140}
                height={40}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="btn-primary py-2 px-6"
            >
              Prijava
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-pink-950/50 to-pink-950/30" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Logo on Left */}
          <div className="flex-shrink-0">
            <Image
              src="/ellevate_logo.png"
              alt="Ellevate Fitness Studio"
              width={800}
              height={240}
              className="h-64 sm:h-80 md:h-96 lg:h-[32rem] w-auto invert brightness-100 drop-shadow-[0_0_30px_rgba(244,114,182,0.5)]"
              priority
            />
          </div>

          {/* Text Content on Right */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Rezervacije otvorene za veljače 2026.
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Podignite</span> svoj fitness
              <br />na višu razinu
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl">
              Ekskluzivni grupni treninzi dizajnirani za žene koje žele više.
              Snaga, energija, zajednica.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary text-lg px-8 py-4 group"
              >
                Započni sada
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
              <a href="#blog" className="btn-secondary text-lg px-8 py-4">
                Saznaj više
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-pink-300 font-semibold text-sm uppercase tracking-wider">Jednostavno</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Kako <span className="gradient-text">funkcionira</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📝', title: 'Registriraj se', desc: 'Kreirajte svoj račun u par klikova i pristupite sustavu rezervacija.' },
              { step: '02', icon: '📅', title: 'Odaberi termin', desc: 'Pregledajte tjedni raspored i rezervirajte termin koji vam odgovara.' },
              { step: '03', icon: '💪', title: 'Dođi na trening', desc: 'Pojavite se, dajte sve od sebe i uživajte u energiji grupe!' },
            ].map((item, i) => (
              <div key={i} className="glass-card text-center group">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-pink-300 text-xs font-bold uppercase tracking-widest mb-2">Korak {item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-pink-300 font-semibold text-sm uppercase tracking-wider">Iskustva</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Što kažu naše <span className="gradient-text">članice</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ana M.', text: 'Ellevate treninzi su mi potpuno promijenili rutinu. Grupna energija je nevjerojatna — uvijek se veselim sljedećem terminu!', tag: 'Članica 6 mjeseci' },
              { name: 'Petra K.', text: 'Konačno sam pronašla trening koji me motivira. Trenerice su stručne, atmosfera je fantastična, a rezultati vidljivi već nakon mjesec dana.', tag: 'Članica 1 godinu' },
              { name: 'Ivana S.', text: 'Rezervacijski sustav je super jednostavan. Odaberem termin, dođem i uživam. Preporuka svima koje traže kvalitetan grupni trening!', tag: 'Članica 3 mjeseca' },
            ].map((t, i) => (
              <div key={i} className="glass-card">
                <div className="text-pink-300 text-2xl mb-3">★★★★★</div>
                <p className="text-slate-300 text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-white/10 pt-3">
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-pink-300 font-semibold text-sm uppercase tracking-wider">Blog</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Fitness <span className="gradient-text">savjeti</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Stručni članci o treningu, prehrani i zdravom životnom stilu koji će vam pomoći da postignete svoje ciljeve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="glass-card group cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-pink-300/80 backdrop-blur-sm rounded-full text-xs font-semibold">
                    {article.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-300 transition-colors">
                  {article.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>🕐 {article.readTime} čitanja</span>
                  <span className="text-pink-300 font-semibold group-hover:translate-x-1 transition-transform">
                    Pročitaj više →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto glass-card text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-300/10 via-purple-500/10 to-pink-300/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Spremni za transformaciju?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Pridružite se našoj zajednici i započnite svoje fitness putovanje već danas.
              Vaše najbolje ja vas čeka.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="btn-primary text-lg px-8 py-4"
            >
              Prijavi se sada
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <Image src="/ellevate_logo.png" alt="Ellevate" width={120} height={36} className="h-8 w-auto mb-4" />
              <p className="text-slate-500 text-sm">Ekskluzivni studio za grupne treninge snage i oblikovanja tijela.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-slate-300">Radno vrijeme</h4>
              <div className="text-slate-500 text-sm space-y-1">
                <p>Pon / Sri / Pet</p>
                <p>09:00 - 10:00 | 19:15 - 20:15 | 20:30 - 21:30</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-slate-300">Kontakt</h4>
              <div className="text-slate-500 text-sm space-y-1">
                <p>📍 Zadar, Hrvatska</p>
                <p>📧 info@ellevate.hr</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm">© 2026 Ellevate. Sva prava pridržana.</div>
            <div className="flex gap-4 text-slate-400">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Dobrodošli natrag</h2>
              <p className="text-slate-400 text-sm mt-1">Prijavite se za pristup rezervacijama</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email adresa
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                  placeholder="vas@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Lozinka
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? 'Prijava u tijeku...' : 'Prijavi se'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
