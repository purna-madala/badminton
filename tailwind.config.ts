import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d7ecff',
          500: '#1d87e4',
          700: '#1566b0',
          900: '#0f3d68',
        },
      },
    },
  },
  plugins: [],
};

export default config;
