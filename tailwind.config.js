/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kid-friendly martial arts color palette
        karate: {
          // Primary Orange (Energy & Action)
          orange: '#FF6B35',
          orangeLight: '#FF8C5F',
          orangeDark: '#E55A2E',
          
          // Primary Blue (Trust & Structure)
          blue: '#004E98',
          blueLight: '#0067CB', 
          blueDark: '#003876',
          
          // Success Green (Achievement)
          green: '#2ECC71',
          greenLight: '#58D68D',
          greenDark: '#27AE60',
          
          // Warning Yellow (Attention)
          yellow: '#F39C12',
          yellowLight: '#F8C471',
          yellowDark: '#D68910',
          
          // Backgrounds
          cream: '#FAFAFA',
          lightBlue: '#EBF5FF',
          lightOrange: '#FFF4F0',
          
          // Text colors
          darkText: '#2C3E50',
          lightText: '#7F8C8D',
        },
        // Maintain compatibility with existing Tailwind classes
        orange: {
          500: '#FF6B35',
          400: '#FF8C5F',
          600: '#E55A2E',
        },
        blue: {
          900: '#004E98',
          800: '#003876',
          700: '#0067CB',
          600: '#0067CB',
          100: '#EBF5FF',
          50: '#F8FBFF',
        },
        green: {
          500: '#2ECC71',
          400: '#58D68D',
          600: '#27AE60',
        },
        cream: '#FAFAFA',
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