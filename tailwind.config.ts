import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand principal — verde terapêutico
        brand: {
          50:  '#edf5f3',
          100: '#d0e9e4',
          200: '#a1d3c9',
          300: '#72bcaf',
          400: '#4fa696',
          500: '#3A8D7B',
          600: '#347D6D',
          700: '#2b6659',
          800: '#224f46',
          900: '#183832',
          950: '#0e2420',
        },
        // Secundário — roxo profundo
        secondary: {
          50:  '#f3f1f8',
          100: '#e4dfef',
          200: '#c9bfde',
          300: '#ae9ece',
          400: '#9380bd',
          500: '#6B5B95',
          600: '#5f5186',
          700: '#4e4370',
          800: '#3d3558',
          900: '#2c2640',
        },
        // Neutros quentes
        sand: {
          50:  '#FDFCFA',
          100: '#F6F3EE',
          200: '#EDE9E2',
          300: '#E5E2DC',
          400: '#D4CFC7',
          500: '#B8B2A8',
          600: '#8C8880',
          700: '#6E6E6E',
          800: '#3D3D3D',
          900: '#1C1C1C',
        },
        // Superfícies
        surface: {
          DEFAULT: '#ffffff',
          50:  '#FDFCFA',
          100: '#F6F3EE',
          200: '#E5E2DC',
          300: '#D4CFC7',
        },
        // Manter primary compatível (aponta para brand)
        primary: {
          50:  '#edf5f3',
          100: '#d0e9e4',
          200: '#a1d3c9',
          300: '#72bcaf',
          400: '#4fa696',
          500: '#3A8D7B',
          600: '#3A8D7B',
          700: '#2b6659',
          800: '#224f46',
          900: '#183832',
          950: '#0e2420',
        },
      },
      fontFamily: {
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        display:  ['"Bebas Neue"', '"Barlow Condensed"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:        '0 1px 3px 0 rgba(28,28,28,0.06), 0 1px 2px -1px rgba(28,28,28,0.04)',
        'card-hover':'0 8px 24px -4px rgba(28,28,28,0.10), 0 4px 8px -2px rgba(28,28,28,0.04)',
        'brand-glow':'0 0 20px rgba(58,141,123,0.20)',
        'inner-sm':  'inset 0 1px 2px rgba(28,28,28,0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        pill:  '9999px',
      },
      backgroundImage: {
        'hero-mesh':    'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(58,141,123,0.12), transparent)',
        'sand-gradient':'linear-gradient(135deg, #F6F3EE 0%, #FDFCFA 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':   'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
