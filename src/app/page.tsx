import BrandLogo from '@/components/BrandLogo';
import Image from 'next/image';
import Link from 'next/link';
import { LoginProvider, LoginButton } from '@/components/HomeLogin';
import { blogArticles } from '@/data/blog-articles';

export default function HomePage() {
  return (
    <LoginProvider>
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BrandLogo />
            </div>
            <LoginButton className="btn-primary py-2 px-6">Prijava</LoginButton>
          </div>
        </div>
      </nav>

      <main id="main-content" tabIndex={-1}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-pink-950/50 to-pink-950/30" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Logo on Left */}
          <div className="w-full max-w-lg lg:w-1/2 flex-shrink-0 text-center">
            <BrandLogo large priority />
          </div>

          {/* Text Content on Right */}
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Rezervirajte svoj termin treninga
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
              <Link href="/pridruzi-se" target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-lg px-8 py-4 group"
              >
                Prijava novih članova
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
              <a href="#blog" className="btn-secondary text-lg px-8 py-4">
                Saznaj više
              </a>
            </div>
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
              { step: '01', icon: '📝', title: 'Pošalji upit', desc: 'Ispunite kratki obrazac za članstvo. Javit ćemo vam se s više informacija.' },
              { step: '02', icon: '📅', title: 'Dogovori početak', desc: 'Nakon dogovora sa studijem dobit ćete pristup rasporedu i rezervacijama.' },
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
            <Link href="/pridruzi-se" target="_blank" rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-4"
            >
              Prijava novih članova
            </Link>
          </div>
        </div>
      </section>

      </main>
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <BrandLogo />
              <p className="text-slate-500 text-sm">Ekskluzivni studio za grupne treninge snage i oblikovanja tijela.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-slate-300">Radno vrijeme</h4>
              <div className="text-slate-500 text-sm space-y-1">
                <p>Pon / Sri / Pet</p>
                <p>09:00 | 18:15 | 19:15 | 20:30</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-slate-300">Kontakt</h4>
              <div className="text-slate-500 text-sm space-y-1">
                <p>📍 Zadar, Hrvatska</p>
                <a href="mailto:info@ellevate.hr">📧 info@ellevate.hr</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm">© 2026 Ellevate. Sva prava pridržana.</div>
            <Link href="/pridruzi-se" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-pink-300">Upit za članstvo i cijene</Link>
          </div>
        </div>
      </footer>

    </div>
    </LoginProvider>
  );
}
