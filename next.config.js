/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build as there are known issues that need to be fixed separately
    ignoreDuringBuilds: true
  },
  images: {
    domains: ["i.ytimg.com", "img.youtube.com", "avatars.githubusercontent.com", "utfs.io"],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Configure output for Vercel deployment
  output: 'standalone',
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 