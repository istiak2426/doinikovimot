/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'zapitozibon.vercel.app',
      'imnhzvldzxzxbcnklclk.supabase.co',  // Your exact Supabase domain
      '*.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig