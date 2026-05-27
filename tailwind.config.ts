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
          // Gold — outer ring, L/V letters
          gold:        '#C9A84C',
          'gold-light':'#E8C97A',
          'gold-dark': '#8B6914',
          // Royal Blue — R letter, inner border
          blue:        '#1B3D8C',
          'blue-light':'#2B5FD4',
          'blue-dark': '#0D1B4B',
          // Accent white for inner circle
          white:       '#FFFFFF',
        },
        surface: {
          DEFAULT: '#07080F',
          1: '#0D0F1A',
          2: '#141726',
          3: '#1C2035',
          4: '#252843',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Brand gradient: deep blue → gold
        'gradient-brand': 'linear-gradient(135deg, #1B3D8C 0%, #C9A84C 100%)',
        // Gold shimmer gradient
        'gradient-gold':  'linear-gradient(135deg, #8B6914 0%, #E8C97A 50%, #C9A84C 100%)',
        // Blue gradient
        'gradient-blue':  'linear-gradient(135deg, #0D1B4B 0%, #2B5FD4 100%)',
        'gradient-dark':  'linear-gradient(180deg, #07080F 0%, #0D0F1A 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'shimmer':    'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(27, 61, 140, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(201, 168, 76, 0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      boxShadow: {
        'brand':    '0 0 30px rgba(27, 61, 140, 0.5)',
        'brand-lg': '0 0 60px rgba(27, 61, 140, 0.3)',
        'gold':     '0 0 30px rgba(201, 168, 76, 0.5)',
        'gold-lg':  '0 0 60px rgba(201, 168, 76, 0.3)',
        'glass':    '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
