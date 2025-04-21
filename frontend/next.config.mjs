/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pgapps/boletas',
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}
export default nextConfig