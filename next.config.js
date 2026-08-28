/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
