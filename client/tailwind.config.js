/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f6',
          100: '#d4dbe8',
          200: '#a9b7d1',
          300: '#7e93ba',
          400: '#5370a3',
          500: '#37578a',
          600: '#2a4470',
          700: '#1f3355',
          800: '#16233c',
          900: '#0d1524',
        },
        gold: {
          50: '#fdf8ec',
          100: '#faedc7',
          200: '#f4da8f',
          300: '#eec257',
          400: '#e6a92f',
          500: '#c98c1e',
          600: '#a56d17',
          700: '#7f5215',
          800: '#5c3b14',
          900: '#3d2712',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(13, 21, 36, 0.06)',
        elevated: '0 10px 30px rgba(13, 21, 36, 0.12)',
      },
    },
  },
  plugins: [],
};
