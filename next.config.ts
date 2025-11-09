import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Fix workspace root warning by setting outputFileTracingRoot
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
