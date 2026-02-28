/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00d4ff',   // electric cyan  
        'primary-dim': '#0095b3',   // darker cyan for hover
        accent: '#7c3aed',   // violet accent for secondary CTAs
        surface: '#0c1120',   // card background (dark navy)
        base: '#070b14',   // page background
        card: '#111827',   // slightly lighter card
        correct: '#10b981',   // emerald green
        wrong: '#f43f5e',   // rose red
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans TC"', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.4)' },
          '50%': { boxShadow: '0 0 36px rgba(0,212,255,0.7)' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
