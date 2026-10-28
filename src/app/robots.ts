import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://siappro-app.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: [
          '/dashboard',
          '/worksheet',
          '/kalender',
          '/laporan',
          '/users',
          '/master-petugas',
          '/master-leading-sector',
          '/activity-log',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
