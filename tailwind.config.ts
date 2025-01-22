import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        dark: {
          1: '#000000',  // Changed from #1C1F2E to white
          2: '#F8F9FA',  // Changed from #161925 to light gray
          3: '#E9ECEF',  // Changed from #252A41 to lighter gray
          4: '#DEE2E6',  // Changed from #1E2757 to light blue-gray
        },
        blue: {
          1: '#2196F3',  // Changed from #0E78F9 to brighter blue
        },
        sky: {
          1: '#E3F2FD',  // Changed from #C9DDFF to lighter blue
          2: '#BBDEFB',  // Changed from #ECF0FF to light blue
          3: '#90CAF9',  // Changed from #F5FCFF to sky blue
        },
        orange: {
          1: '#FF9800',  // Changed from #FF742E to brighter orange
        },
        purple: {
          1: '#9C27B0',  // Changed from #830EF9 to brighter purple
        },
        yellow: {
          1: '#FFC107',  // Changed from #F9A90E to brighter yellow
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        hero: "url('/images/hero-background.png')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
