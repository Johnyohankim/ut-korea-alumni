export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/profile/'],
      },
    ],
    sitemap: 'https://www.utkorea.org/sitemap.xml',
  }
}
