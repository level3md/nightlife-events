import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7c3aed',
          'purple-light': '#a855f7',
          pink: '#ec4899',
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
        },
        surface: {
          DEFAULT: '#0a0a0f',
          1: '#111118',
          2: '#1a1a24',
          3: '#242433',
          4: '#2e2e40',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' },
        },
      },
      boxShadow: {
        'brand': '0 0 30px rgba(124, 58, 237, 0.4)',
        'brand-lg': '0 0 60px rgba(124, 58, 237, 0.3)',
        'pink': '0 0 30px rgba(236, 72, 153, 0.4)',
        'gold': '0 0 30px rgba(245, 158, 11, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
