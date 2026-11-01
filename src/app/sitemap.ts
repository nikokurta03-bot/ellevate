import { blogArticles } from '@/data/blog-articles';
import type { MetadataRoute } from 'next';

const site = 'https://www.ellevate.hr';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogUrls = blogArticles.map((article) => ({
    url: `${site}/blog/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: site, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${site}/pridruzi-se`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site}/privatnost`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site}/impressum`, changeFrequency: 'yearly', priority: 0.3 },
    ...blogUrls,
  ];
}
