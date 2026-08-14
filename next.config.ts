import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cpus: 1 keeps the 2GB sandbox from OOM-killing `next build` during static
  // generation of 509 pages. Safe to remove on Vercel where workers are bigger.
  experimental: {
    cpus: 1,
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
