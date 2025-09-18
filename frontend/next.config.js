/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // Allow production builds even with TypeScript errors
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // This prevents Next.js from trying to optimize images
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  },
  async rewrites() {
    const backendHost = 'gps-trucks-backend:3002';

    return [
      {
        source: '/api/:path*',
        destination: `http://${backendHost}/api/:path*`,
      },
      {
        source: '/images/:path*',
        destination: `http://${backendHost}/images/:path*`,
      },
    ];
  },
}

module.exports = nextConfig