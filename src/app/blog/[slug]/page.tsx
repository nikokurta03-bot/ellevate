'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const articles: Record<string, {
    title: string;
    excerpt: string;
    image: string;
    readTime: string;
    category: string;
    content: string;
    author: string;
    date: string;
}> = {
    'grupni-treninzi': {
        title: 'Zašto su grupni treninzi učinkovitiji?',
        excerpt: 'Otkrijte kako zajednička energija i motivacija grupe može transformirati vaše fitness rezultate.',
        image: '/blog/group-training.png',
        readTime: '5 min',
        category: 'Motivacija',
        author: 'Ellevate Tim',
        date: '15. siječnja 2026.',
        content: `
## Snaga zajednice

Grupni treninzi nisu samo trend – oni su revolucija u svijetu fitnessa. Kada vježbate u grupi, događa se nešto magično: **vaša motivacija raste**, a osjećaj usamljenosti nestaje.

### Benefiti grupnog treninga

1. **Povećana motivacija** - Kada vidite druge kako daju sve od sebe, i vi ćete se potruditi više.

2. **Odgovornost** - Teže je preskočiti trening kada znate da vas ekipa čeka.

3. **Profesionalno vodstvo** - Trener osigurava pravilnu tehniku i maksimalnu učinkovitost.

4. **Socijalna interakcija** - Upoznajete ljude sličnih interesa i gradite prijateljstva.

5. **Strukturirani programi** - Stručno osmišljeni treninzi za optimalne rezultate.

### Znanstveno dokazano

Istraživanja pokazuju da ljudi koji vježbaju u grupi imaju **26% niži stres** i osjećaju se sretnijima. Također, vjerojatnost da će nastaviti s vježbanjem je čak **42% veća** u usporedbi s onima koji vježbaju sami.

### Zaključak

Ako tražite način da podignete svoje fitness putovanje na višu razinu, grupni treninzi su odgovor. Pridružite se našoj Ellevate zajednici i osjetite razliku!
    `
    },
    'trening-snage': {
        title: 'Osnove treninga snage za žene',
        excerpt: 'Razbijamo mitove o treningu snage i pokazujemo kako pravilno dizanje utega može oblikovati vaše tijelo.',
        image: '/blog/strength-training.png',
        readTime: '7 min',
        category: 'Snaga',
        author: 'Ellevate Tim',
        date: '10. siječnja 2026.',
        content: `
## Zaboravite mitove

Mnoge žene izbjegavaju trening snage jer misle da će postati "prevelike". Ovo je **potpuno pogrešno**! Žene nemaju dovoljno testosterona za izgradnju velikih mišića bez ekstremnih mjera.

### Što trening snage zapravo radi?

- **Oblikuje tijelo** - Tonira mišiće i stvara definiciju
- **Ubrzava metabolizam** - Više mišića = više sagorijevanja kalorija u mirovanju
- **Jača kosti** - Smanjuje rizik od osteoporoze
- **Poboljšava držanje** - Jača leđa i trup

### Osnovne vježbe za početak

1. **Čučnjevi (Squats)** - Kraljica svih vježbi za donji dio tijela
2. **Mrtvo dizanje (Deadlifts)** - Odlično za stražnjicu i leđa
3. **Potisak s klupe (Bench Press)** - Jača prsa i ruke
4. **Vesanje (Rows)** - Gradi snažna leđa

### Savjeti za sigurnost

- Uvijek se zagrijte prije treninga
- Počnite s lakšim utezima dok ne savladate tehniku
- Slušajte svoje tijelo
- Zatražite pomoć trenera za pravilnu formu

### Zaključak

Trening snage je jedan od najboljih poklona koje možete dati svom tijelu. Ne bojte se utega – oni su vaši saveznici na putu do jačeg, zdravijeg vas!
    `
    },
    'hiit-vs-kardio': {
        title: 'HIIT vs. Kardio: Što je bolje za vas?',
        excerpt: 'Usporedba intenzivnog intervalnog treninga i tradicionalnog kardija.',
        image: '/blog/cardio-workout.png',
        readTime: '6 min',
        category: 'Kardio',
        author: 'Ellevate Tim',
        date: '5. siječnja 2026.',
        content: `
## Vječna debata

HIIT (High-Intensity Interval Training) i tradicionalni kardio oba imaju svoje mjesto u fitness svijetu. Ali koji je bolji za vas?

### Što je HIIT?

HIIT uključuje kratke intervale **maksimalnog napora** izmjenjene s periodima odmora. Tipični HIIT trening traje 20-30 minuta.

**Primjer HIIT treninga:**
- 30 sekundi sprint
- 30 sekundi hodanje
- Ponoviti 10-15 puta

### Što je tradicionalni kardio?

Tradicionalni kardio (steady-state) uključuje kontinuirano vježbanje umjerenog intenziteta, poput trčanja, plivanja ili bicikliranja **45-60 minuta**.

### Usporedba

| Aspekt | HIIT | Tradicionalni kardio |
|--------|------|---------------------|
| Trajanje | 20-30 min | 45-60 min |
| Intenzitet | Visok | Umjeren |
| Sagorijevanje kalorija | Više po minuti | Manje po minuti |
| Afterburn efekt | Značajan | Minimalan |
| Utjecaj na zglobove | Veći | Manji |

### Zaključak

**Idealno rješenje?** Kombinacija oboje! HIIT 2-3 puta tjedno uz 1-2 sesije tradicionalnog kardija daje optimalne rezultate za većinu ljudi.
    `
    },
    'istezanje-fleksibilnost': {
        title: 'Važnost istezanja i fleksibilnosti',
        excerpt: 'Naučite zašto je fleksibilnost ključna za prevenciju ozljeda.',
        image: '/blog/stretching-yoga.png',
        readTime: '4 min',
        category: 'Wellness',
        author: 'Ellevate Tim',
        date: '1. siječnja 2026.',
        content: `
## Zanemareni aspekt fitnessa

Istezanje je često prvi element koji preskačemo kada nam fali vremena. Ali to je velika greška!

### Zašto je istezanje važno?

1. **Prevencija ozljeda** - Fleksibilni mišići manje su podložni ozljedama
2. **Poboljšan raspon pokreta** - Bolje izvođenje vježbi
3. **Smanjenje napetosti** - Relaksacija mišića nakon treninga
4. **Bolja cirkulacija** - Više kisika do mišića

### Vrste istezanja

#### Dinamičko istezanje (prije treninga)
- Kruženje rukama
- Podizanje koljena
- Bočni iskoraci
- Rotacije trupa

#### Statičko istezanje (nakon treninga)
- Istezanje hamstringsa (30 sekundi)
- Istezanje kvadricepsa (30 sekundi)
- Istezanje leđa (30 sekundi)
- Istezanje ramena (30 sekundi)

### Koliko često?

- Istezanje bi trebalo biti dio **svakog treninga**
- Dodatno: 2-3 sesije joge ili pilatesa tjedno za maksimalnu fleksibilnost

### Savjet

Nikada ne istežite hladne mišiće! Uvijek se prvo zagrijte laganim kardijom 5-10 minuta.
    `
    },
    'zdrave-navike': {
        title: 'Zdrave navike za aktivni životni stil',
        excerpt: 'Praktični savjeti za održavanje energije, hidrataciju i oporavak.',
        image: '/blog/healthy-lifestyle.png',
        readTime: '5 min',
        category: 'Lifestyle',
        author: 'Ellevate Tim',
        date: '20. prosinca 2025.',
        content: `
## Više od treninga

Fitness nije samo ono što radite u teretani – to je način života. Evo navika koje će transformirati vaše rezultate.

### 1. Hidratacija

**Zašto je važna?**
- Regulira tjelesnu temperaturu
- Pomaže u transportu nutrijenata
- Poboljšava performanse

**Koliko piti?**
- Minimum 2 litre vode dnevno
- Dodatnih 500ml za svaki sat vježbanja
- Više tijekom vrućih dana

### 2. San i oporavak

Vaši mišići **ne rastu tijekom treninga** – oni rastu dok spavate!

- Ciljajte 7-9 sati sna
- Održavajte redovan raspored spavanja
- Izbjegavajte ekrane sat vremena prije spavanja

### 3. Prehrana

**Osnovne smjernice:**
- Protein uz svaki obrok (meso, riba, jaja, mahunarke)
- Složeni ugljikohidrati za energiju (zobene pahuljice, smeđa riža)
- Zdrave masti (avokado, maslinovo ulje, orašasti plodovi)
- Puno povrća za vitamine i minerale

### 4. Konzistentnost

Tajna uspjeha nije savršenstvo, već **konzistentnost**. Bolje je vježbati 30 minuta svaki dan nego 3 sata jednom tjedno.

### Zaključak

Male promjene u svakodnevnim navikama donose velike rezultate. Počnite s jednom navikom i postupno dodavajte nove!
    `
    }
};

export default function ArticlePage() {
    const params = useParams();
    const slug = params.slug as string;
    const article = articles[slug];

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Članak nije pronađen</h1>
                    <Link href="/blog" className="btn-primary">
                        Povratak na blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <span className="text-xl font-bold gradient-text">Ellevate</span>
                        </Link>
                        <Link href="/blog" className="btn-secondary py-2 px-6">
                            ← Svi članci
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Article Header */}
            <header className="pt-24 pb-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-6">
                        <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-semibold">
                            {article.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
                    <p className="text-xl text-slate-400 mb-6">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>✍️ {article.author}</span>
                        <span>📅 {article.date}</span>
                        <span>🕐 {article.readTime} čitanja</span>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            <div className="max-w-4xl mx-auto px-4 mb-12">
                <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 pb-16">
                <div className="glass-card prose prose-invert prose-lg max-w-none">
                    <div
                        className="article-content"
                        dangerouslySetInnerHTML={{
                            __html: article.content
                                .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 gradient-text">$1</h2>')
                                .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-6 mb-3 text-white">$1</h3>')
                                .replace(/#### (.*)/g, '<h4 class="text-lg font-semibold mt-4 mb-2 text-pink-400">$1</h4>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-4">')
                                .replace(/^- (.*)/gm, '<li class="text-slate-300 ml-4 mb-2">• $1</li>')
                                .replace(/^\d+\. (.*)/gm, '<li class="text-slate-300 ml-4 mb-2">$1</li>')
                        }}
                    />
                </div>
            </article>

            {/* CTA Section */}
            <section className="pb-16 px-4">
                <div className="max-w-4xl mx-auto glass-card text-center">
                    <h2 className="text-2xl font-bold mb-4">Spremni za akciju?</h2>
                    <p className="text-slate-400 mb-6">
                        Pridružite se Ellevate zajednici i započnite svoje fitness putovanje već danas.
                    </p>
                    <Link href="/" className="btn-primary inline-block">
                        Rezerviraj trening
                    </Link>
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
                </div>
            </footer>
        </div>
    );
}
