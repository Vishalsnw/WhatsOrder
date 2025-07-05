import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // ⚠️ Disables LightningCSS to fix Termux build error
  },
}

export default nextConfig
