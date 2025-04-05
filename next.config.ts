import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      electron: false,
      fs: false,
      net: false,
      tls: false,
      'fs/promises': false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'electron-fetch': 'node-fetch'
      };
    }

    return config;
  },
  reactStrictMode: false,
};

export default nextConfig;
