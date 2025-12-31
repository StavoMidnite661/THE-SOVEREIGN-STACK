import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['val'],
  serverExternalPackages: ['tigerbeetle-node'],
  // Use webpack for production builds (Turbopack has WalletConnect issues)
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
