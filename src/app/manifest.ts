import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CandidCarryq - Premium Bags & Accessories',
    short_name: 'CandidCarryq',
    description: 'Premium quality bags and accessories for every lifestyle',
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
