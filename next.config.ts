import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 OPTIMIZACIJA: Produkcijske optimizacije
  reactStrictMode: true,

  // Kompresija - smanjuje veličinu bundle-a
  compress: true,

  // Optimizacija paketa - automatski tree-shake eksterne biblioteke
  experimental: {
    optimizePackageImports: ['date-fns'],
  },

  // Produkcijski source maps - isključi za manje datoteke
  productionBrowserSourceMaps: false,

  // Power by header - isključi za sigurnost
  poweredByHeader: false,

  // Caching headers za statičke resurse
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
