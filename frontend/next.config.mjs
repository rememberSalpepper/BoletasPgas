/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/pgapps/boletas',
  trailingSlash: false,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig