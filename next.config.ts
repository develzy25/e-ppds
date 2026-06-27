import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion', 'recharts'],
  },
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/demo/image/upload/',
    unoptimized: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  }
};

export default nextConfig;
