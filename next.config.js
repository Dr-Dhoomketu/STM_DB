/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for GitHub deployment
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  // Optimize for production
  swcMinify: true,
  // Handle environment variables properly
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig