/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // For static export
  },
  devIndicators: {
    appIsrStatus: false,
  },
}

module.exports = nextConfig
