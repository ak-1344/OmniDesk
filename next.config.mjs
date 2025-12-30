/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist',
  typescript: {
    // ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    // ignoreDuringBuilds: true,
  },
}

export default nextConfig
