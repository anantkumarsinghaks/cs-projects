import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allows production builds to successfully complete even if the project has ESLint warnings/errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ensures type checking warnings do not block Vercel deployment builds.
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
