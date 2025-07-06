/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Ignore ESLint errors during Vercel build to prevent deployment failure
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ No unsupported experimental options (to prevent Vercel warnings)
  experimental: {},
};

module.exports = nextConfig;
