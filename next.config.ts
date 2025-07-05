/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Allow local IP access during development (fixes sidebar/login issues)
  experimental: {
    allowedDevOrigins: ['http://localhost:3000', 'http://192.168.1.103:3000'],
  },
};

module.exports = nextConfig;
