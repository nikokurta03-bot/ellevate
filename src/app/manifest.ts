import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ellevate Fitness Studio',
    short_name: 'Ellevate',
    description: 'Ekskluzivni studio za grupne treninge snage i oblikovanja tijela.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0a14',
    theme_color: '#f9a8d4',
    icons: [
      { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
  };
}
