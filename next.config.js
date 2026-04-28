/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ❌ 'domains' is deprecated in Next.js 14+ (but still works)
    // ✅ Use 'remotePatterns' instead (recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zapitozibon.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imnhzvldzxzxbcnklclk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Add your current domain for OG images
      {
        protocol: 'https',
        hostname: 'doinikobhimot.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
    // Optional: Add image size limits
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: Enable Next.js image optimization
    formats: ['image/webp'],
    // Optional: Set minimum cache TTL
    minimumCacheTTL: 60,
  },
  // Optional: Add these for better performance
  swcMinify: true,
  compress: true,
  reactStrictMode: true,
  // Optional: Add headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig