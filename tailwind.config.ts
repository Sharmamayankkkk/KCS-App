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
        'primary': '#1E293B',
        'secondary': '#334155',
        'accent': '#B91C1C',
        'background': '#F8FAFC',
        'surface': '#F1F5F9',
        'border': '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        
        // Legacy support - mapped to new colors
        'primary-accent': '#B91C1C',
        'light-background': '#F8FAFC',
        'secondary-background': '#F1F5F9',
        'primary-text': '#0F172A',
        'secondary-text': '#64748B',
        
        video: {
          background: '#F8FAFC',
          'background-secondary': '#F1F5F9',
          accent: '#B91C1C',
          text: '#0F172A',
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

      /* Professional shadow styles - no neumorphism */
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'soft-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'soft-inset': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'soft-destructive': '0 1px 3px 0 rgb(185 28 28 / 0.3)',
        'soft-destructive-hover': '0 4px 6px -1px rgb(185 28 28 / 0.3)',
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