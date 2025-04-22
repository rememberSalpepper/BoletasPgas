/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/pgapps/boletas',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}
export default nextConfig