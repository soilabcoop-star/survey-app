import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#46549C',
          blue: '#248DAC',
          green: '#228D7B',
        },
        admin: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
        category: {
          livinglab: '#46549C',
          workshop: '#248DAC',
          consulting: '#228D7B',
          education: '#8b5cf6',
          other: '#64748b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
