import type { Config } from 'tailwindcss';

// By explicitly typing the constant with ': Config', we ensure compatibility 
// across different TypeScript setups, which resolves the errors.
const config: Config = {
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
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        'primary-accent': '#A41F13',
        'light-background': '#FAF5F1',
        'secondary-background': '#E0DBD8',
        'primary-text': '#292F36',
        'secondary-text': '#8F7A6E',
        
        video: {
          background: '#FAF5F1',
          'background-secondary': '#E0DBD8',
          accent: '#A41F13',
          text: '#292F36',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'screen': '100dvh',
      },
      minHeight: {
        'screen': '100dvh',
      },
      maxHeight: {
        'screen': '100dvh',
      },
      borderRadius: {
        'video': '12px',
      },

      /* ✅ Added soft shadow styles */
      boxShadow: {
        'soft': '5px 5px 10px #d9d5d2, -5px -5px 10px #ffffff',
        'soft-hover': '3px 3px 8px #d9d5d2, -3px -3px 8px #ffffff',
        'soft-inset': 'inset 2px 2px 5px #d9d5d2, inset -2px -2px 5px #ffffff',
        'soft-destructive': '5px 5px 10px #931c11, -5px -5px 10px #b52215',
        'soft-destructive-hover': '3px 3px 8px #931c11, -3px -3px 8px #b52215',
        'soft-destructive-inset': 'inset 2px 2px 5px #931c11, inset -2px -2px 5px #b52215',
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'slide-out': 'slideOut 0.3s ease-in-out',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'hero': "url('/images/hero-background.mp4')",
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '250': '250ms',
      },
      gridTemplateColumns: {
        'video-grid': 'repeat(auto-fit, minmax(250px, 1fr))',
      },
      gridAutoRows: {
        'video': 'minmax(200px, auto)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;