import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // JUT Brand
        pink: {
          DEFAULT: '#ED1966',
          50: '#fef0f5',
          100: '#fcd5e5',
          200: '#f9aacb',
          300: '#f470a3',
          400: '#ed3f7e',
          500: '#ED1966',
          600: '#c91050',
          700: '#a00d3f',
          800: '#7d0f34',
          900: '#61102d',
        },
        blue: {
          DEFAULT: '#2152A4',
          50: '#eff4ff',
          100: '#dbe7ff',
          200: '#bed4ff',
          300: '#91b6ff',
          400: '#618dfe',
          500: '#3b64fb',
          600: '#2244f0',
          700: '#2152A4',
          800: '#1e3fb5',
          900: '#1e3a8a',
        },
        // Surface system
        surface: {
          DEFAULT: '#16161f',
          50: '#f5f5fa',
          100: '#e8e8f0',
          200: '#d0d0e0',
          300: '#a8a8c0',
          400: '#7878a0',
          500: '#555580',
          600: '#3d3d60',
          700: '#2a2a45',
          800: '#1e1e30',
          900: '#16161f',
          950: '#0d0d14',
        },
        // Semantic
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'gradient-jut': 'linear-gradient(135deg, #ED1966, #2152A4)',
        'gradient-jut-subtle': 'linear-gradient(135deg, rgba(237,25,102,0.15), rgba(33,82,164,0.15))',
        'gradient-dark': 'linear-gradient(180deg, #050508 0%, #0d0d14 100%)',
      },
      boxShadow: {
        'pink-glow': '0 0 40px rgba(237, 25, 102, 0.35)',
        'pink-glow-lg': '0 0 80px rgba(237, 25, 102, 0.25)',
        'blue-glow': '0 0 40px rgba(33, 82, 164, 0.35)',
        'surface': '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)',
        'surface-lg': '0 10px 40px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
