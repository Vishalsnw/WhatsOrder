/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // The following configurations have been commented out to support Next.js 14.
  // experimental: {
  //   esmExternals: false
  // },
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false,
  //     net: false,
  //     tls: false,
  //   };
  //   return config;
  // },
};

module.exports = nextConfig;
