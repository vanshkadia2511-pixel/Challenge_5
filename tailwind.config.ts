import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // KSHAN design tokens — warm, editorial, calm
      colors: {
        ink: '#1F2A37',
        paper: '#FBF7F0',
        saffron: '#E8A33D',
        teal: '#1F7A74',
        rose: '#C4476A',
        mist: '#ECE7DD',
      },
      fontFamily: {
        serif: [
          '"Playfair Display"',
          '"Cormorant Garamond"',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'serif',
        ],
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
      spacing: {
        'touch-min': '44px', // minimum touch target per spec
      },
    },
  },
  plugins: [],
};

export default config;

