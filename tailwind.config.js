/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#FF6B35', // Primary
        },
        blue: {
          900: '#004E98', // Secondary
          600: '#0067CB',
        },
        green: {
          500: '#2ECC71', // Accent
        },
        cream: '#FAFAFA', // Background
      },
      fontFamily: {
        comic: ['Comic Sans MS', 'cursive'],
      },
      animation: {
        bounce: 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
};