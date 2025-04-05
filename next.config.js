/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build as there are known issues that need to be fixed separately
    ignoreDuringBuilds: true
  },
  images: {
    domains: ["i.ytimg.com", "img.youtube.com", "avatars.githubusercontent.com", "utfs.io"],
  }
}

module.exports = nextConfig 