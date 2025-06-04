/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors will now fail production builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript errors will now fail production builds
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 