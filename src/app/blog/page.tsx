'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function BlogPage() {
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
                        <Link href="/" className="btn-secondary py-2 px-6">
                            ← Povratak
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Blog Header */}
            <section className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <span className="text-pink-400 font-semibold text-sm uppercase tracking-wider">Blog</span>
                    <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
                        Fitness <span className="gradient-text">savjeti</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Stručni članci o treningu, prehrani i zdravom životnom stilu koji će vam pomoći da postignete svoje ciljeve.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="pb-24 px-4">
                <div className="max-w-7xl mx-auto">
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
