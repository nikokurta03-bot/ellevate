'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiResponse } from '@/types';

const blogArticles = [
  {
    id: 1,
    slug: 'grupni-treninzi',
    title: 'Zašto su grupni treninzi učinkovitiji?',
    excerpt: 'Otkrijte kako zajednička energija i motivacija grupe može transformirati vaše fitness rezultate i učiniti vježbanje zabavnijim.',
    image: '/blog/group-training.png',
    readTime: '5 min',
    category: 'Motivacija',
  },
  {
    id: 2,
    slug: 'trening-snage',
    title: 'Osnove treninga snage za žene',
    excerpt: 'Razbijamo mitove o treningu snage i pokazujemo kako pravilno dizanje utega može oblikovati vaše tijelo.',
    image: '/blog/strength-training.png',
    readTime: '7 min',
    category: 'Snaga',
  },
  {
    id: 3,
    slug: 'hiit-vs-kardio',
    title: 'HIIT vs. Kardio: Što je bolje za vas?',
    excerpt: 'Usporedba intenzivnog intervalnog treninga i tradicionalnog kardija - pronađite što odgovara vašim ciljevima.',
    image: '/blog/cardio-workout.png',
    readTime: '6 min',
    category: 'Kardio',
  },
  {
    id: 4,
    slug: 'istezanje-fleksibilnost',
    title: 'Važnost istezanja i fleksibilnosti',
    excerpt: 'Naučite zašto je fleksibilnost ključna za prevenciju ozljeda i kako ju poboljšati kroz svakodnevne vježbe.',
    image: '/blog/stretching-yoga.png',
    readTime: '4 min',
    category: 'Wellness',
  },
  {
    id: 5,
    slug: 'zdrave-navike',
    title: 'Zdrave navike za aktivni životni stil',
    excerpt: 'Praktični savjeti za održavanje energije, hidrataciju i oporavak koji će unaprijediti vaše treninge.',
    image: '/blog/healthy-lifestyle.png',
    readTime: '5 min',
    category: 'Lifestyle',
  },
];

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
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold gradient-text">Ellevate</span>
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Rezervacije otvorene za veljače 2026.
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Podignite</span> svoj fitness
            <br />na višu razinu
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Ekskluzivni grupni treninzi dizajnirani za žene koje žele više.
            Snaga, energija, zajednica.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">500+</div>
              <div className="text-sm text-slate-500 mt-1">Članica</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">15</div>
              <div className="text-sm text-slate-500 mt-1">Treninga tjedno</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">98%</div>
              <div className="text-sm text-slate-500 mt-1">Zadovoljstvo</div>
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

      {/* Blog Section */}
      <section id="blog" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-pink-400 font-semibold text-sm uppercase tracking-wider">Blog</span>
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
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-pink-500/80 backdrop-blur-sm rounded-full text-xs font-semibold">
                    {article.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                  {article.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>🕐 {article.readTime} čitanja</span>
                  <span className="text-pink-400 font-semibold group-hover:translate-x-1 transition-transform">
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
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10" />
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
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="font-bold">Ellevate</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Ellevate. Sva prava pridržana.
          </div>
          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
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
