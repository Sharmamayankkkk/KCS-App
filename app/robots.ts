import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://meet.krishnaconsciousnesssociety.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/home/', '/meeting/', '/recordings/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
