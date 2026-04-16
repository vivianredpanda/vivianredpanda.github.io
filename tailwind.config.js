/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f0f4ed',
          100: '#dce5d5',
          200: '#c5d4b8',
          300: '#a8c09a',
          400: '#8b9d83',
          500: '#6d8066',
        },
        sky: {
          50: '#eef5fb',
          100: '#d4e6f5',
          200: '#a8c8e8',
          300: '#7eb5d6',
          400: '#5a9cc4',
          500: '#3d7da3',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          dark: '#ebe4d8',
        },
        panda: {
          light: '#e8a88c',
          DEFAULT: '#d4917a',
          dark: '#b87860',
        },
        bark: {
          light: '#7a6352',
          DEFAULT: '#4a3728',
        },
      },
      fontFamily: {
        display: ['Caveat', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'sway': 'sway 4s ease-in-out infinite',
        'float-up': 'floatUp 3s ease-in infinite',
        'bob': 'bob 3s ease-in-out infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-100px) scale(0.5)', opacity: '0' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
