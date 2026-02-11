import Link from 'next/link';
import Image from 'next/image';
import { blogArticles } from '@/data/blog-articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog — Fitness savjeti',
    description: 'Stručni članci o treningu, prehrani i zdravom životnom stilu koji će vam pomoći da postignete svoje ciljeve.',
};

export default function BlogPage() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center">
                            <Image src="/ellevate_logo.png" alt="Ellevate" width={140} height={40} className="h-8 sm:h-10 w-auto" />
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
                    <span className="text-pink-300 font-semibold text-sm uppercase tracking-wider">Blog</span>
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

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <Image src="/ellevate_logo.png" alt="Ellevate" width={100} height={30} className="h-8 w-auto" />
                    <div className="text-slate-500 text-sm">© 2026 Ellevate. Sva prava pridržana.</div>
                </div>
            </footer>
        </div>
    );
}
