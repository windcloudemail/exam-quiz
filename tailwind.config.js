/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4255ff',   // Quizlet brand blue-purple
        'primary-dark': '#3444cc',
        accent: '#ffcd1f',   // highlight yellow
        surface: '#1a1d28',   // card background
        base: '#13141e',   // page background
        'card': '#23263a',   // slightly lighter card
        correct: '#18b566',
        wrong: '#ea4b4b',
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans TC"', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        'pulse-ring': 'pulse-ring 1.5s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
