import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/login',
        '/register',
        '/checkout',
        '/cart',
        '/wishlist'
      ]
    },
    sitemap: 'https://candidcarryq.com/sitemap.xml',
  }
}
