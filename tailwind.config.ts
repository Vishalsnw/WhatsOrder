import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Scan all app files for Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
