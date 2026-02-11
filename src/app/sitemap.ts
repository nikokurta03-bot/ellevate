import { blogArticles } from '@/data/blog-articles';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogUrls = blogArticles.map((article) => ({
    url: `https://ellevate.hr/blog/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: 'https://ellevate.hr', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://ellevate.hr/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...blogUrls,
  ];
}
