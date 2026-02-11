import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogArticles, getArticleBySlug } from '@/data/blog-articles';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
    return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) return { title: 'Članak nije pronađen' };
    return {
        title: article.title,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt,
            images: [{ url: `https://ellevate.hr${article.image}` }],
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article || !article.content) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center">
                            <Image src="/ellevate_logo.png" alt="Ellevate" width={140} height={40} className="h-8 sm:h-10 w-auto" />
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
                        <span className="px-3 py-1 bg-pink-300/20 text-pink-300 rounded-full text-sm font-semibold">
                            {article.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
                    <p className="text-xl text-slate-400 mb-6">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>✍️ Ellevate Tim</span>
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
                        sizes="(max-width: 768px) 100vw, 896px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 pb-16">
                <div className="glass-card prose prose-invert prose-lg max-w-none">
                    <div className="article-content">
                        <ReactMarkdown
                            components={{
                                h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 gradient-text">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3 text-white">{children}</h3>,
                                h4: ({ children }) => <h4 className="text-lg font-semibold mt-4 mb-2 text-pink-300">{children}</h4>,
                                p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-4">{children}</p>,
                                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                li: ({ children }) => <li className="text-slate-300 ml-4 mb-2">{children}</li>,
                                ul: ({ children }) => <ul className="mb-4">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-4">{children}</ol>,
                            }}
                        >
                            {article.content}
                        </ReactMarkdown>
                    </div>
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
                    <Image src="/ellevate_logo.png" alt="Ellevate" width={100} height={30} className="h-8 w-auto" />
                    <div className="text-slate-500 text-sm">© 2026 Ellevate. Sva prava pridržana.</div>
                </div>
            </footer>
        </div>
    );
}
