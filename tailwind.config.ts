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
          1: '#000000', // Primary background color - Lightest blue-grey
          2: '#000907', // Secondary background color - Light blue-grey
          3: '#26282A', // Tertiary background color - Medium blue-grey
          4: '#060606', // Quaternary background color - Deep blue-grey
        },
        blue: {
          1: '#0E78F9', // Primary action color - Used for interactive elements like buttons
        },
        sky: {
          1: '#C9DDFF', // Active state background - Lightest sky blue
          2: '#ECF0FF', // Secondary active state - Medium sky blue
          3: '#F5FCFF', // Tertiary active state - Darkest sky blue
        },
        orange: {
          1: '#FF742E', // Primary accent color - Used for highlight elements
        },
        purple: {
          1: '#830EF9', // Secondary accent color - Used for secondary highlights
        },
        yellow: {
          1: '#F9A90E', // Tertiary accent color - Used for tertiary highlights
        },
        text: {
          light: '#1A1C23', // Primary text color for light themes - Near black for contrast
          dark: '#FFFFFF', // Primary text color for dark themes - Pure white
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
