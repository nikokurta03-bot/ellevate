import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=15552000' },
  {
    key: 'Content-Security-Policy',
    value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  },
];

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
        source: '/:path*',
        headers: securityHeaders,
      },
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
