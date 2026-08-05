import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    qualities: [75, 90, 92, 94, 95, 96],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "onuoramenswear.com"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/brand/final-hero.png",
        destination: "/brand/menswear-hero.png"
      }
    ];
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
