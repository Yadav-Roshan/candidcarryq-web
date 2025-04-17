import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CandidCarryq - Online Shopping Nepal – Buy Luxury Bags, Backpacks & Travel Accessories',
    short_name: 'CandidCarryq',
    description: 'Shop online at Candid CarryQ, Nepal’s destination for luxury handbags, backpacks, and travel bags. Discover authentic craftsmanship, elegant designs, and durable materials. Free delivery & easy returns available.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      },
      
    ]
  }
}
